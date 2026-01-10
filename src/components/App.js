import React, { useState, useEffect } from 'react';
import Answer from './Answer';
import Question from './Question';
import Value from './Value';
import Category from './Category';
import GameSetup from './GameSetup';
import { GAME_PHASES, INITIAL_GAME_STATE } from '../constants/gameConfig';
import { initializeGame, startRound1 } from '../utils/gameStateManager';
import { loadGameState, clearGameState } from '../utils/localStorageService';

export default function App(props) {
	const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
	const [question, updateQuestion] = useState({});
	const [isVisible, setIsVisible] = useState(false);
	const toggleTrueFalse = () => setIsVisible(!isVisible);

	useEffect(() => {
		const savedState = loadGameState();
		if (savedState) {
			setGameState(savedState);
		}
	}, []);

	useEffect(() => {
		if (gameState.phase === GAME_PHASES.SETUP) {
			(async () => {
				try {
					const categoriesRes = await fetch(`https://rithm-jeopardy.herokuapp.com/api/categories?count=100`);
					const categories = await categoriesRes.json();
					const randomCategory = categories[Math.floor(Math.random() * categories.length)];

					const categoryRes = await fetch(`https://rithm-jeopardy.herokuapp.com/api/category?id=${randomCategory.id}`);
					const categoryData = await categoryRes.json();
					const randomClue = categoryData.clues[Math.floor(Math.random() * categoryData.clues.length)];

					await updateQuestion([randomClue]);
				} catch (err) {
					console.error(err);
				}
			})();
		}
	}, [gameState.phase]);

	const handleStartGame = async (playerNames) => {
		try {
			const initialState = initializeGame(playerNames);
			const round1State = await startRound1(initialState);
			setGameState(round1State);
		} catch (error) {
			console.error('Error starting game:', error);
		}
	};

	const handleNewGame = () => {
		clearGameState();
		setGameState(INITIAL_GAME_STATE);
	};

	async function handleFetch() {
		try {
			const categoriesRes = await fetch('https://rithm-jeopardy.herokuapp.com/api/categories?count=100');
			const categories = await categoriesRes.json();
			const randomCategory = categories[Math.floor(Math.random() * categories.length)];

			const categoryRes = await fetch(`https://rithm-jeopardy.herokuapp.com/api/category?id=${randomCategory.id}`);
			const categoryData = await categoryRes.json();
			const randomClue = categoryData.clues[Math.floor(Math.random() * categoryData.clues.length)];

			updateQuestion([randomClue]);
			setIsVisible(false);
		} catch (error) {
			console.log(error);
		}
	}

	if (gameState.phase === GAME_PHASES.SETUP) {
		return <GameSetup onStartGame={handleStartGame} />;
	}

	return (
		<>
			<div className="jeopardyPage">
				<div className="jeopardyTitle">
					<img
						className="jeopardyTitleImage"
						src="https://i.imgur.com/aDK80QC.png"
					></img>
				</div>
				<hr className="jeopardyDivide" />
				<div className="gameArea">
					<div className="topGameArea">
						<span className="categoryTitle">Category:</span>
						<span className="categoryTitle">Value:</span>
						<div className="leftSide catDiv">
							<br />
							{Object.keys(question).length ? (
								<Category question={question} />
							) : (
								''
							)}
						</div>
						<div className="rightSide valDiv">
							<br />
							{Object.keys(question).length ? (
								<Value question={question} />
							) : (
								''
							)}
						</div>
					</div>
					<hr />
					<span className="gameQuestion">Question:</span>
					<div className="questionArea">
						<br />
						{Object.keys(question).length ? (
							<Question question={question} />
						) : (
							''
						)}
					</div>
					<hr />
					<div className="jeopardyScore">
						<span className="gameScore">Score:&nbsp; {score}</span>
					</div>
					<br />
					<div className="scoreArea">
						<div className="scoreDown">
							<button className="scoreDownButton" onClick={decrement}>
								-
							</button>
						</div>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						<div className="scoreUp">
							<button className="scoreUpButton" onClick={increment}>
								+
							</button>
						</div>
					</div>
					<br />
					<hr />
					<span className="answerTitle">Answer:</span>
					<div
						className="answerArea"
						style={{ display: isVisible ? 'block' : 'none' }}
					>
						{Object.keys(question).length ? <Answer question={question} /> : ''}
					</div>
				</div>
			</div>
			<div className="gameButtons">
				<div className="leftSide">
					<button
						className="answerButton bottomButtons"
						onClick={toggleTrueFalse}
					>
						<h3>Show Answer</h3>
					</button>
				</div>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<div className="rightSide">
					<button
						className="getNewQuestionButton bottomButtons"
						onClick={handleFetch}
					>
						<h3>New Question</h3>
					</button>
				</div>
			</div>
		</>
	);
}

import React, { useState, useEffect } from 'react';
import Answer from './Answer';
import Question from './Question';
import Value from './Value';
import Category from './Category';
import GameSetup from './GameSetup';
import GameBoard from './GameBoard';
import QuestionModal from './QuestionModal';
import DailyDoubleModal from './DailyDoubleModal';
import RoundTransition from './RoundTransition';
import FinalJeopardyModal from './FinalJeopardyModal';
import GameComplete from './GameComplete';
import { GAME_PHASES, INITIAL_GAME_STATE } from '../constants/gameConfig';
import { initializeGame, startRound1, startRound2, startFinalJeopardy, isRoundComplete, completeGame } from '../utils/gameStateManager';
import { loadGameState, clearGameState } from '../utils/localStorageService';
import { submitAnswer, selectCell, registerBuzzIn, submitBuzzAnswer, closeQuestion } from '../utils/gameStateManager';

export default function App(props) {
	const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
	const [question, updateQuestion] = useState({});
	const [isVisible, setIsVisible] = useState(false);
	const toggleTrueFalse = () => setIsVisible(!isVisible);
	const [selectedCellData, setSelectedCellData] = useState(null);
	const [showDailyDoubleModal, setShowDailyDoubleModal] = useState(false);
	const [dailyDoubleWager, setDailyDoubleWager] = useState(null);
	const [showRoundTransition, setShowRoundTransition] = useState(false);

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

	// Check if round is complete after each state change
	useEffect(() => {
		if ((gameState.phase === GAME_PHASES.ROUND_1 || gameState.phase === GAME_PHASES.ROUND_2) &&
		    isRoundComplete(gameState) &&
		    !showRoundTransition) {
			setShowRoundTransition(true);
		}
	}, [gameState, showRoundTransition]);

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

	const handleCellClick = (cellData) => {
		setSelectedCellData(cellData);

		// Initialize active question for buzz-in system
		const updatedState = {
			...gameState,
			activeQuestion: {
				cellId: cellData.cellId,
				originalSelector: gameState.currentPlayerIndex,
				buzzedPlayers: [],
				attemptedAnswers: {},
				currentBuzzer: null,
				timerStartTime: Date.now(),
				isLocked: false,
				remainingPlayers: gameState.players.map(p => p.id)
			}
		};

		const cellSelectedState = selectCell(updatedState, cellData.cellId);
		setGameState(cellSelectedState);

		// If it's a Daily Double, show the wager modal first
		if (cellData.isDailyDouble) {
			setShowDailyDoubleModal(true);
		}
	};

	const handleWagerSubmit = (wager) => {
		setDailyDoubleWager(wager);
		setShowDailyDoubleModal(false);
		// Question modal will now show automatically since selectedCellData is set
	};

	const handleBuzzIn = (playerId) => {
		// Pause timer, lock question, mark player as buzzer
		const updatedState = registerBuzzIn(gameState, playerId);
		setGameState(updatedState);
		// Modal will update to show "Show Answer" button for this player
	};

	const handleCorrectAnswer = (playerId) => {
		if (!selectedCellData) return;

		// For Daily Doubles, use old system
		if (dailyDoubleWager !== null) {
			const updatedState = submitAnswer(
				gameState,
				true,
				selectedCellData.value,
				dailyDoubleWager
			);
			setGameState(updatedState);
			setSelectedCellData(null);
			setDailyDoubleWager(null);
			return;
		}

		// Award points to buzzer, give them board control, close modal
		const updatedState = submitBuzzAnswer(
			gameState,
			playerId,
			true, // isCorrect
			selectedCellData.value,
			null // no wager for regular questions
		);
		setGameState(updatedState);
		setSelectedCellData(null);
	};

	const handleIncorrectAnswer = (playerId) => {
		if (!selectedCellData) return;

		// For Daily Doubles, use old system
		if (dailyDoubleWager !== null) {
			const updatedState = submitAnswer(
				gameState,
				false,
				selectedCellData.value,
				dailyDoubleWager
			);
			setGameState(updatedState);

			// Delay closing modal by 2 seconds on incorrect answer
			setTimeout(() => {
				setSelectedCellData(null);
				setDailyDoubleWager(null);
			}, 2000);
			return;
		}

		// Deduct points from buzzer, remove from remaining players
		const updatedState = submitBuzzAnswer(
			gameState,
			playerId,
			false, // isCorrect
			selectedCellData.value,
			null // no wager
		);

		setGameState(updatedState);

		// Check if any players remaining
		if (updatedState.activeQuestion && updatedState.activeQuestion.remainingPlayers.length === 0) {
			// All players wrong - show message, close after 3s
			setTimeout(() => {
				const finalState = closeQuestion(updatedState);
				setGameState(finalState);
				setSelectedCellData(null);
			}, 3000);
		} else {
			// Other players can still buzz - keep modal open, reset to BUZZER_ACTIVE
			// Modal will automatically reopen buzzer based on activeQuestion state
		}
	};

	const handleCloseModal = () => {
		// Close question if active
		if (gameState.activeQuestion) {
			const finalState = closeQuestion(gameState);
			setGameState(finalState);
		}
		setSelectedCellData(null);
		setShowDailyDoubleModal(false);
		setDailyDoubleWager(null);
	};

	const handleContinueToNextRound = async () => {
		try {
			if (gameState.currentRound === 1) {
				const round2State = await startRound2(gameState);
				setGameState(round2State);
				setShowRoundTransition(false);
			} else if (gameState.currentRound === 2) {
				const finalJeopardyState = await startFinalJeopardy(gameState);
				setGameState(finalJeopardyState);
				setShowRoundTransition(false);
			}
		} catch (error) {
			console.error('Error starting next round:', error);
		}
	};

	const handleFinalJeopardyComplete = (results, wager, isCorrect, eligiblePlayers, currentAnswerPlayer) => {
		// Calculate final scores
		const updatedPlayers = gameState.players.map(player => {
			const result = results[player.id];
			if (result) {
				return {
					...player,
					score: player.score + result.scoreChange
				};
			}
			return player;
		});

		// Handle the last player's answer
		const lastPlayer = eligiblePlayers[currentAnswerPlayer];
		const lastResult = {
			wager,
			isCorrect,
			scoreChange: isCorrect ? wager : -wager
		};

		const finalPlayers = updatedPlayers.map(player => {
			if (player.id === lastPlayer.id) {
				return {
					...player,
					score: player.score + lastResult.scoreChange
				};
			}
			return player;
		});

		// Complete the game
		const completeState = completeGame({
			...gameState,
			players: finalPlayers
		});
		setGameState(completeState);
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

	if (gameState.phase === GAME_PHASES.ROUND_1 || gameState.phase === GAME_PHASES.ROUND_2) {
		return (
			<>
				<GameBoard
					gameState={gameState}
					onCellClick={handleCellClick}
				/>
				{/* Show Round Transition when round is complete */}
				{showRoundTransition && (
					<RoundTransition
						currentRound={gameState.currentRound}
						players={gameState.players}
						onContinue={handleContinueToNextRound}
					/>
				)}
				{/* Show Daily Double Modal first if it's a Daily Double */}
				{showDailyDoubleModal && selectedCellData && !showRoundTransition && (
					<DailyDoubleModal
						category={gameState.categories[selectedCellData.categoryIndex].title}
						currentPlayer={gameState.players[gameState.currentPlayerIndex]}
						currentRound={gameState.currentRound}
						onWagerSubmit={handleWagerSubmit}
						onClose={handleCloseModal}
					/>
				)}
				{/* Show Question Modal after Daily Double wager or immediately for regular questions */}
				{selectedCellData && !showDailyDoubleModal && !showRoundTransition && (
					<QuestionModal
						clue={selectedCellData.clue}
						value={dailyDoubleWager !== null ? dailyDoubleWager : selectedCellData.value}
						category={gameState.categories[selectedCellData.categoryIndex].title}
						players={gameState.players}
						activeQuestion={gameState.activeQuestion}
						onBuzzIn={handleBuzzIn}
						onCorrect={handleCorrectAnswer}
						onIncorrect={handleIncorrectAnswer}
						onClose={handleCloseModal}
						isDailyDouble={dailyDoubleWager !== null}
					/>
				)}
			</>
		);
	}

	if (gameState.phase === GAME_PHASES.FINAL_JEOPARDY) {
		const category = gameState.categories[0];
		const clue = category.clues[0];

		return (
			<FinalJeopardyModal
				category={category.title}
				clue={clue}
				players={gameState.players}
				onComplete={handleFinalJeopardyComplete}
			/>
		);
	}

	if (gameState.phase === GAME_PHASES.COMPLETE) {
		return (
			<GameComplete
				gameState={gameState}
				onNewGame={handleNewGame}
			/>
		);
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

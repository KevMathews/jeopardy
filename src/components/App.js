import React, { useState, useEffect } from 'react';
import Answer from './Answer';
import Question from './Question';
import Game from './Game';
import Value from './Value';
import Category from './Category';
// import '../css/styles.css';

export default function App(props) {
	const [question, updateQuestion] = useState({});
	const [isVisible, setIsVisible] = useState(false);
	const toggleTrueFalse = () => setIsVisible(!isVisible);
	const [score, changeScore] = useState(0);
	const increment = () => changeScore(score + question[0].value);
	const decrement = () => changeScore(score - question[0].value);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`https://jservice.io/api/random`);
				const data = await res.json();
				await updateQuestion(data);
			} catch (err) {
				console.error(err);
			}
		})();
	}, []);

	async function handleFetch() {
		try {
			const response = await fetch('https://jservice.io/api/random');
			const data = await response.json();
			updateQuestion(data);
			setIsVisible(false);
		} catch (error) {
			console.log(error);
		}
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
					<div className="gameArea2">
						<div className="topGameArea">
							<div className="leftSide">
								<span className="categoryTitle">Category:</span>
								<br />
								{Object.keys(question).length ? (
									<Category question={question} />
								) : (
									''
								)}
							</div>

							<div className="rightSide">
								<span className="categoryTitle">Value:</span>
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
							<span className="gameScore">Current Score:&nbsp; {score}</span>
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
							{Object.keys(question).length ? (
								<Answer question={question} />
							) : (
								''
							)}
						</div>
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

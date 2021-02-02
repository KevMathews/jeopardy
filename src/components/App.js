import React, { useState, useEffect } from 'react';
import Answer from './Answer';
import Question from './Question';
import Game from './Game';
export default function App(props) {
	const [question, updateQuestion] = useState({});
	const [isVisible, setIsVisible] = useState(false);
	const toggleTrueFalse = () => setIsVisible(!isVisible);

	// useEffect(() => {
	// 	(async () => {
	// 		try {
	// 			const response = await fetch('http://jservice.io/api/random');
	// 			const data = await response.json();
	// 			updateQuestion(data);
	// 		} catch (error) {
	// 			console.error(error);
	// 		}
	// 	})();
	// }, []);
	async function handleFetch() {
		try {
			const response = await fetch('http://jservice.io/api/random');
			const data = await response.json();
			updateQuestion(data);
			setIsVisible(false);
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<div className="jeopardyPage">
			<div className="jeopardyTitle">
				<img
					className="jeopardyTitleImage"
					src="https://i.imgur.com/aDK80QC.png"
				></img>
			</div>
			<hr />
			<div className="page1">
				{Object.keys(question).length ? <Question question={question} /> : ''}
			</div>

			<div className="getNewQuestionDiv">
				<button className="getNewQuestionButton" onClick={handleFetch}>
					Get a New Question
				</button>
			</div>

			<div className="page3" style={{ display: isVisible ? 'block' : 'none' }}>
				{Object.keys(question).length ? <Answer question={question} /> : ''}
			</div>
			<div className="page2">
				{Object.keys(question).length ? <Game question={question} /> : ''}
			</div>
			<button className="answerButton" onClick={toggleTrueFalse}>
				<h3>Reveal The Answer</h3>
			</button>
		</div>
	);
}

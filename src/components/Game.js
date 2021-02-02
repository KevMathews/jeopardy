import React, { useState, useEffect } from 'react';

export default function Game(props) {
	const [score, changeScore] = useState(0);
	const increment = () => changeScore(score + props.question[0].value);
	const decrement = () => changeScore(score - props.question[0].value);

	return (
		<div className="gameScoreDiv">
			<div className="scoreDown">
				<button className="scoreUpButton" onClick={increment}>
					Got Answer Right
				</button>
			</div>
			<div className="jeopardyScore">
				Score: <span className="jeopardyScoreSpan">{score}</span>
			</div>
			<div className="scoreUp">
				<button className="scoreDownButton" onClick={decrement}>
					Got Answer Wrong
				</button>
			</div>
		</div>
	);
}

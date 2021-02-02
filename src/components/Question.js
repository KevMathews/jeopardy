import React from 'react';
export default function Question(props) {
	const selectQuestion = () => updateQuestion(props.question);
	return (
		<div className="jeopardyQuestionDiv">
			<div className="jeopardyCategory">
				Category: {props.question[0].category.title}
			</div>

			<div className="jeopardyQuestion">
				Question: {props.question[0].question}
			</div>
			<div className="jeopardyValue">Value: {props.question[0].value}</div>
		</div>
	);
}

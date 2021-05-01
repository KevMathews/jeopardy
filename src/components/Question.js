import React from 'react';
export default function Question(props) {
	const selectQuestion = () => updateQuestion(props.question);
	return (
		<>
			<div className="jeopardyQuestion">{props.question[0].question}</div>
		</>
	);
}

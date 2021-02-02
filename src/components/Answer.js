import React from 'react';
export default function Answer(props) {
	return (
		<div className="jeopardyAnswer">Answer: {props.question[0].answer} </div>
	);
}

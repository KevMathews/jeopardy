import React from 'react';
export default function Answer(props) {
	return (
		<div className="jeopardyAnswer">
			<span className="fetchedAnswer">{props.question[0].answer}</span>{' '}
		</div>
	);
}

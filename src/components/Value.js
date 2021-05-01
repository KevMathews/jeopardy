import React from 'react';
export default function Value(props) {
	return (
		<>
			<div className="jeopardyValue">{props.question[0].value}</div>
		</>
	);
}

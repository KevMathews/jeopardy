import React from 'react';
export default function Category(props) {
	return (
		<>
			<div className="jeopardyCategory">{props.question[0].category.title}</div>
		</>
	);
}

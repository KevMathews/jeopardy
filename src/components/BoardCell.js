import React from 'react';

export default function BoardCell({
	value,
	isAnswered,
	isDailyDouble,
	onClick,
	cellId
}) {
	const handleClick = () => {
		if (!isAnswered && onClick) {
			onClick(cellId);
		}
	};

	return (
		<button
			className={`boardCell ${isAnswered ? 'answered' : ''}`}
			onClick={handleClick}
			disabled={isAnswered}
		>
			{!isAnswered && (
				<div className="cellValue">${value}</div>
			)}
		</button>
	);
}

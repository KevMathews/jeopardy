import React from 'react';
import { playHoverSound, playClickSound } from '../utils/audioEffects';

export default function BoardCell({
	value,
	isAnswered,
	isDailyDouble,
	onClick,
	cellId
}) {
	const handleClick = () => {
		if (!isAnswered && onClick) {
			playClickSound();
			onClick(cellId);
		}
	};

	return (
		<button
			className={`boardCell ${isAnswered ? 'answered' : ''}`}
			onClick={handleClick}
			disabled={isAnswered}
			onMouseEnter={!isAnswered ? playHoverSound : undefined}
		>
			{!isAnswered && (
				<div className="cellValue">${value}</div>
			)}
		</button>
	);
}

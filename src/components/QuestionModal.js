import React, { useState, useEffect, useRef } from 'react';

const TIMER_DURATION = 5000; // 5 seconds in milliseconds

export default function QuestionModal({
	clue,
	value,
	category,
	currentPlayer,
	onCorrect,
	onIncorrect,
	onClose
}) {
	const [showAnswer, setShowAnswer] = useState(false);
	const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
	const [isTimerActive, setIsTimerActive] = useState(true);
	const timerRef = useRef(null);
	const startTimeRef = useRef(Date.now());

	useEffect(() => {
		// Start timer when modal opens
		startTimeRef.current = Date.now();
		setIsTimerActive(true);

		const updateTimer = () => {
			const elapsed = Date.now() - startTimeRef.current;
			const remaining = Math.max(0, TIMER_DURATION - elapsed);
			setTimeRemaining(remaining);

			if (remaining > 0) {
				timerRef.current = requestAnimationFrame(updateTimer);
			} else {
				setIsTimerActive(false);
				// Timer expired - player loses points
				onIncorrect();
			}
		};

		timerRef.current = requestAnimationFrame(updateTimer);

		return () => {
			if (timerRef.current) {
				cancelAnimationFrame(timerRef.current);
			}
		};
	}, [onIncorrect]);

	const handleShowAnswer = () => {
		setShowAnswer(true);
		setIsTimerActive(false);
		if (timerRef.current) {
			cancelAnimationFrame(timerRef.current);
		}
	};

	const timerPercentage = (timeRemaining / TIMER_DURATION) * 100;

	return (
		<div className="modalOverlay" onClick={onClose}>
			<div className="questionModal" onClick={(e) => e.stopPropagation()}>
				<button className="modalCloseButton" onClick={onClose}>
					×
				</button>

				<div className="modalHeader">
					<div className="modalCategory">{category}</div>
					<div className="modalValue">${value}</div>
				</div>

				<div className="modalContent">
					<div className="modalCurrentPlayer">
						{currentPlayer.name}'s Turn
					</div>

					{/* Timer Bar */}
					{isTimerActive && !showAnswer && (
						<div className="timerContainer">
							<div className="timerBar">
								<div
									className="timerProgress"
									style={{ transform: `scaleX(${timerPercentage / 100})` }}
								/>
							</div>
						</div>
					)}

					<div className="modalQuestion">
						{clue.question}
					</div>

					{!showAnswer ? (
						<button
							className="modalButton showAnswerButton"
							onClick={handleShowAnswer}
						>
							Show Answer
						</button>
					) : (
						<>
							<div className="modalAnswer">
								{clue.answer}
							</div>

							<div className="modalActions">
								<button
									className="modalButton correctButton"
									onClick={onCorrect}
								>
									✓ Correct
								</button>
								<button
									className="modalButton incorrectButton"
									onClick={onIncorrect}
								>
									✗ Incorrect
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

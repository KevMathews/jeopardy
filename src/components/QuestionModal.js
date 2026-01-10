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
	const [timedOut, setTimedOut] = useState(false);
	const timerRef = useRef(null);
	const startTimeRef = useRef(Date.now());
	const buzzerRef = useRef(null);

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
				setTimedOut(true);
				setShowAnswer(true);

				// Play double buzzer sound
				playBuzzer();

				// Auto-close after 3 seconds
				setTimeout(() => {
					onIncorrect();
				}, 3000);
			}
		};

		timerRef.current = requestAnimationFrame(updateTimer);

		return () => {
			if (timerRef.current) {
				cancelAnimationFrame(timerRef.current);
			}
		};
	}, [onIncorrect]);

	const playBuzzer = () => {
		// Create double buzz sound using Web Audio API
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();

		const playBuzz = (delay) => {
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			oscillator.type = 'sawtooth';
			oscillator.frequency.value = 200; // Low buzzer frequency

			gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
			gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + delay + 0.01);
			gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + delay + 0.3);

			oscillator.start(audioContext.currentTime + delay);
			oscillator.stop(audioContext.currentTime + delay + 0.3);
		};

		// Play two buzzes
		playBuzz(0);
		playBuzz(0.35);
	};

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
			<div className={`questionModal ${timedOut ? 'timedOut' : ''}`} onClick={(e) => e.stopPropagation()}>
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

							{!timedOut && (
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
							)}

							{timedOut && (
								<div className="timeoutMessage">
									TIME'S UP! Points deducted.
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

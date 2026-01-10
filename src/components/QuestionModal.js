import React, { useState, useEffect, useRef } from 'react';

const TIMER_DURATION = 5000; // 5 seconds in milliseconds

export default function QuestionModal({
	clue,
	value,
	category,
	players,
	activeQuestion,
	onBuzzIn,
	onCorrect,
	onIncorrect,
	onClose,
	isDailyDouble = false
}) {
	const [buzzState, setBuzzState] = useState('BUZZER_ACTIVE'); // BUZZER_ACTIVE, LOCKED_IN, JUDGING
	const [showAnswer, setShowAnswer] = useState(false);
	const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
	const [isTimerActive, setIsTimerActive] = useState(true);
	const [timedOut, setTimedOut] = useState(false);
	const [answerSubmitted, setAnswerSubmitted] = useState(false);
	const [correctSubmitted, setCorrectSubmitted] = useState(false);
	const [incorrectSubmitted, setIncorrectSubmitted] = useState(false);
	const [allWrong, setAllWrong] = useState(false);
	const [activeTimerDuration, setActiveTimerDuration] = useState(TIMER_DURATION); // Track current timer duration
	const timerRef = useRef(null);
	const startTimeRef = useRef(Date.now());

	// Timer effect - pause when someone buzzes but hasn't shown answer yet
	useEffect(() => {
		// Pause timer ONLY if someone buzzed but hasn't shown answer yet
		// Once answer is shown, judgment timer should run
		if (activeQuestion && activeQuestion.isLocked && !showAnswer) {
			if (timerRef.current) {
				cancelAnimationFrame(timerRef.current);
			}
			setIsTimerActive(false);
			return;
		}

		// Start or resume timer
		startTimeRef.current = Date.now();
		setIsTimerActive(true);

		const updateTimer = () => {
			const elapsed = Date.now() - startTimeRef.current;
			const remaining = Math.max(0, activeTimerDuration - elapsed);
			setTimeRemaining(remaining);

			if (remaining > 0) {
				timerRef.current = requestAnimationFrame(updateTimer);
			} else {
				// Timer expired
				setIsTimerActive(false);

				// If answer already shown (judgment phase timeout)
				if (showAnswer) {
					// Judgment timer expired - treat as incorrect
					setTimedOut(true);
					playBuzzer();
					const playerId = isDailyDouble ? players[0].id : (activeQuestion?.currentBuzzer || players[0].id);
					setTimeout(() => {
						onIncorrect(playerId);
					}, 2000);
				}
				// If someone buzzed but didn't show answer yet
				else if (activeQuestion && activeQuestion.currentBuzzer) {
					setTimedOut(true);
					setShowAnswer(true);
					playBuzzer();
					setTimeout(() => {
						onIncorrect(activeQuestion.currentBuzzer);
					}, 3000);
				}
				// Nobody buzzed - just close
				else {
					onClose();
				}
			}
		};

		timerRef.current = requestAnimationFrame(updateTimer);

		return () => {
			if (timerRef.current) {
				cancelAnimationFrame(timerRef.current);
			}
		};
	}, [activeQuestion, isDailyDouble, onIncorrect, onClose, showAnswer, activeTimerDuration]);

	// Keyboard listener for buzz-ins
	useEffect(() => {
		// Don't allow buzz-in for Daily Doubles
		if (isDailyDouble) return;
		if (buzzState !== 'BUZZER_ACTIVE') return;
		if (!activeQuestion) return;

		const handleKeyPress = (e) => {
			// Prevent default browser actions
			if (e.key === ' ' || e.key === 'Enter' || e.key === 'Shift') {
				e.preventDefault();
			}

			const canPlayerBuzz = (playerId) => {
				return activeQuestion.remainingPlayers.includes(playerId);
			};

			// Player 1: Left Shift
			if (e.key === 'Shift' && e.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT && canPlayerBuzz(1)) {
				onBuzzIn(1);
			}
			// Player 2: Space Bar
			else if (e.key === ' ' && canPlayerBuzz(2)) {
				onBuzzIn(2);
			}
			// Player 3: Enter
			else if (e.key === 'Enter' && canPlayerBuzz(3)) {
				onBuzzIn(3);
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [buzzState, activeQuestion, isDailyDouble, onBuzzIn]);

	// Update buzz state based on activeQuestion
	useEffect(() => {
		if (isDailyDouble) {
			setBuzzState('LOCKED_IN');
			return;
		}

		if (!activeQuestion) return;

		if (activeQuestion.isLocked && !showAnswer) {
			setBuzzState('LOCKED_IN');
		} else if (showAnswer) {
			setBuzzState('JUDGING');
		} else {
			setBuzzState('BUZZER_ACTIVE');
		}
	}, [activeQuestion, showAnswer, isDailyDouble]);

	const playBuzzer = () => {
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();

		const playBuzz = (delay) => {
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			oscillator.type = 'sawtooth';
			oscillator.frequency.value = 200;

			gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
			gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + delay + 0.01);
			gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + delay + 0.3);

			oscillator.start(audioContext.currentTime + delay);
			oscillator.stop(audioContext.currentTime + delay + 0.3);
		};

		playBuzz(0);
		playBuzz(0.35);
	};

	const playCorrectSound = () => {
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		oscillator.type = 'sine';
		oscillator.frequency.value = 800;

		gainNode.gain.setValueAtTime(0, audioContext.currentTime);
		gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

		oscillator.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + 0.4);
	};

	const handleShowAnswer = () => {
		setShowAnswer(true);

		// Calculate time remaining for judgment
		// Give them remaining time or at least 3 seconds to judge
		const MIN_JUDGMENT_TIME = 3000;
		const judgmentTime = Math.max(timeRemaining, MIN_JUDGMENT_TIME);

		// Restart timer for judgment period with new duration
		setActiveTimerDuration(judgmentTime);
		setTimeRemaining(judgmentTime);
		startTimeRef.current = Date.now();
		setIsTimerActive(true);
	};

	const handleCorrect = () => {
		setAnswerSubmitted(true);
		setCorrectSubmitted(true);
		setIsTimerActive(false);
		if (timerRef.current) {
			cancelAnimationFrame(timerRef.current);
		}
		playCorrectSound();

		const playerId = isDailyDouble
			? players[0].id // For Daily Double, use current player
			: activeQuestion.currentBuzzer;

		setTimeout(() => {
			onCorrect(playerId);
		}, 1000);
	};

	const handleIncorrect = () => {
		setAnswerSubmitted(true);
		setIncorrectSubmitted(true);
		setIsTimerActive(false);
		if (timerRef.current) {
			cancelAnimationFrame(timerRef.current);
		}
		playBuzzer();

		const playerId = isDailyDouble
			? players[0].id // For Daily Double, use current player
			: activeQuestion.currentBuzzer;

		onIncorrect(playerId);
	};

	const timerPercentage = (timeRemaining / activeTimerDuration) * 100;
	const currentBuzzer = activeQuestion && activeQuestion.currentBuzzer
		? players.find(p => p.id === activeQuestion.currentBuzzer)
		: null;

	return (
		<div className="modalOverlay" onClick={onClose}>
			<div className={`questionModal ${timedOut ? 'timedOut' : ''} ${correctSubmitted ? 'correctSubmitted' : ''} ${incorrectSubmitted ? 'incorrectSubmitted' : ''} ${allWrong ? 'allWrong' : ''}`} onClick={(e) => e.stopPropagation()}>
				<button className="modalCloseButton" onClick={onClose}>
					×
				</button>

				<div className="modalHeader">
					<div className="modalCategory">{category}</div>
					<div className="modalValue">${value}</div>
				</div>

				<div className="modalContent">
					{/* Current Player or Buzzer Status */}
					{isDailyDouble ? (
						<div className="modalCurrentPlayer">
							{players[0].name}'s Turn (Daily Double!)
						</div>
					) : currentBuzzer ? (
						<div className="modalCurrentPlayer">
							{currentBuzzer.name} Buzzed In!
						</div>
					) : (
						<div className="modalCurrentPlayer">
							Press your buzzer!
						</div>
					)}

					{/* Timer Bar */}
					{!answerSubmitted && !timedOut && (
						<div className="timerContainer">
							<div className="timerBar">
								<div
									className="timerProgress"
									style={{ transform: `scaleX(${timerPercentage / 100})` }}
								/>
							</div>
						</div>
					)}

					{/* Player Status Cards (only for buzz-in mode) */}
					{!isDailyDouble && activeQuestion && (
						<div className="playerBuzzStatus">
							{players.map(player => {
								const attempted = activeQuestion.attemptedAnswers[player.id];
								const canBuzz = activeQuestion.remainingPlayers.includes(player.id);
								const isBuzzing = activeQuestion.currentBuzzer === player.id;

								return (
									<div
										key={player.id}
										className={`playerStatusCard ${isBuzzing ? 'active-buzzer' : ''} ${attempted?.correct === false ? 'attempted-wrong' : ''} ${attempted?.correct === true ? 'attempted-right' : ''} ${!canBuzz && !attempted ? 'locked-out' : ''}`}
									>
										<div className="playerStatusName">{player.name}</div>
										<div className="playerStatusIndicator">
											{isBuzzing && '🔔 BUZZED IN'}
											{attempted?.correct === true && '✓ CORRECT'}
											{attempted?.correct === false && '✗ WRONG'}
											{canBuzz && !isBuzzing && '⏱ WAITING'}
											{!canBuzz && !attempted && '🔒 OUT'}
										</div>
									</div>
								);
							})}
						</div>
					)}

					{/* Question Text */}
					<div className="modalQuestion">
						{clue.question}
					</div>

					{/* Buzz-In Buttons (only shown when buzzer active) */}
					{!isDailyDouble && buzzState === 'BUZZER_ACTIVE' && activeQuestion && !showAnswer && (
						<div className="buzzInButtons">
							{activeQuestion.remainingPlayers.map(playerId => {
								const player = players.find(p => p.id === playerId);
								return (
									<button
										key={playerId}
										className={`buzzInButton player-${playerId}`}
										onClick={() => onBuzzIn(playerId)}
									>
										🔔 BUZZ IN - {player.name}
									</button>
								);
							})}
						</div>
					)}

					{/* Show Answer Button or Answer + Buttons */}
					{!showAnswer ? (
						<>
							{(buzzState === 'LOCKED_IN' || isDailyDouble) && (
								<button
									className="modalButton showAnswerButton"
									onClick={handleShowAnswer}
								>
									Show Answer
								</button>
							)}
						</>
					) : (
						<>
							<div className="modalAnswer">
								{clue.answer}
							</div>

							{!timedOut && !allWrong && (
								<div className="modalActions">
									<button
										className="modalButton correctButton"
										onClick={handleCorrect}
										disabled={answerSubmitted}
									>
										✓ Correct
									</button>
									<button
										className="modalButton incorrectButton"
										onClick={handleIncorrect}
										disabled={answerSubmitted}
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

							{allWrong && (
								<div className="allWrongMessage">
									NOBODY GOT IT RIGHT!
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

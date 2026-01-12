import React, { useState, useEffect, useRef } from 'react';
import { playHoverSound, playClickSound } from '../utils/audioEffects';

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
	const [noBuzzedIn, setNoBuzzedIn] = useState(false);
	const [answerSubmitted, setAnswerSubmitted] = useState(false);
	const [correctSubmitted, setCorrectSubmitted] = useState(false);
	const [incorrectSubmitted, setIncorrectSubmitted] = useState(false);
	const [allWrong, setAllWrong] = useState(false);
	const [activeTimerDuration, setActiveTimerDuration] = useState(TIMER_DURATION); // Track current timer duration
	const [buzzInTimeRemaining, setBuzzInTimeRemaining] = useState(null); // Track time remaining when player buzzed
	const hasBuzzedInRef = useRef(false); // Track if someone has buzzed in (useRef to avoid stale closures)
	const localBuzzerPlayerIdRef = useRef(null); // Store buzzer's ID locally (useRef to avoid stale closures)
	const timerRef = useRef(null);
	const startTimeRef = useRef(Date.now());

	// Timer effect - runs continuously, resets at key moments
	useEffect(() => {
		// Don't start timer if answer is already shown (judgment phase - unlimited time)
		if (showAnswer) {
			setIsTimerActive(false);
			if (timerRef.current) {
				cancelAnimationFrame(timerRef.current);
			}
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

				console.log('🔴 TIMER EXPIRED - DEBUG INFO:');
				console.log('  showAnswer:', showAnswer);
				console.log('  hasBuzzedInRef.current:', hasBuzzedInRef.current);
				console.log('  localBuzzerPlayerIdRef.current:', localBuzzerPlayerIdRef.current);
				console.log('  activeQuestion:', activeQuestion);
				console.log('  activeQuestion?.currentBuzzer:', activeQuestion?.currentBuzzer);
				console.log('  activeQuestion?.isLocked:', activeQuestion?.isLocked);

				// If answer already shown (judgment phase timeout)
				if (showAnswer) {
					console.log('✅ Branch: JUDGMENT PHASE TIMEOUT');
					// Judgment timer expired - treat as incorrect
					setTimedOut(true);
					playBuzzer();
					const playerId = isDailyDouble ? players[0].id : (activeQuestion?.currentBuzzer || players[0].id);

					// Immediate visual feedback, reduced delay
					setTimeout(() => {
						onIncorrect(playerId);
					}, 1500);
				}
				// If someone buzzed in (use ref to get current value)
				else if (hasBuzzedInRef.current && localBuzzerPlayerIdRef.current) {
					console.log('✅ Branch: BUZZED IN TIMEOUT - Calling onIncorrect(' + localBuzzerPlayerIdRef.current + ')');
					playBuzzer();
					// Mark as incorrect immediately - this will trigger auto-reset if players remain
					onIncorrect(localBuzzerPlayerIdRef.current);
				}
				// Daily Double timeout before showing answer
				else if (isDailyDouble) {
					console.log('✅ Branch: DAILY DOUBLE TIMEOUT - Calling onIncorrect(' + players[0].id + ')');
					setTimedOut(true);
					playBuzzer();
					// Immediate visual feedback, reduced delay
					setTimeout(() => {
						onIncorrect(players[0].id);
					}, 1500);
				}
				// Nobody buzzed - show answer briefly then close
				else {
					console.log('❌ Branch: NOBODY BUZZED - Showing answer then closing');
					setNoBuzzedIn(true);
					setShowAnswer(true);
					// Show answer for 3 seconds then close
					setTimeout(() => {
						onClose();
					}, 3000);
				}
			}
		};

		timerRef.current = requestAnimationFrame(updateTimer);

		return () => {
			if (timerRef.current) {
				cancelAnimationFrame(timerRef.current);
			}
		};
	}, [activeQuestion, isDailyDouble, onIncorrect, onClose, showAnswer, activeTimerDuration, players]);


	// Auto-reset timer when buzzer unlocks after incorrect answer (Phase 1)
	const prevRemainingPlayersRef = useRef(null);
	useEffect(() => {
		if (!activeQuestion) return;

		const currentRemainingCount = activeQuestion.remainingPlayers.length;

		// Only reset if:
		// 1. Buzzer is unlocked (!isLocked)
		// 2. Players remain (length > 0)
		// 3. Player count DECREASED (someone was removed after getting it wrong)
		if (!activeQuestion.isLocked &&
		    currentRemainingCount > 0 &&
		    prevRemainingPlayersRef.current !== null &&
		    currentRemainingCount < prevRemainingPlayersRef.current) {

			console.log('🔄 AUTO-RESET TRIGGERED: Player was removed, resetting for remaining players');
			console.log('  Clearing hasBuzzedIn and localBuzzerPlayerId');

			// Reset to full 5 seconds for remaining players
			setActiveTimerDuration(TIMER_DURATION);
			setTimeRemaining(TIMER_DURATION);
			setShowAnswer(false);
			setAnswerSubmitted(false);
			setCorrectSubmitted(false);
			setIncorrectSubmitted(false);
			hasBuzzedInRef.current = false; // Reset buzz-in flag for next player
			localBuzzerPlayerIdRef.current = null; // Reset local buzzer ID
			setBuzzState('BUZZER_ACTIVE');
			startTimeRef.current = Date.now();
			setIsTimerActive(true);
		}

		// Update previous count
		prevRemainingPlayersRef.current = currentRemainingCount;
	}, [activeQuestion?.isLocked, activeQuestion?.remainingPlayers.length]);

	// Restart timer when player buzzes in (Phase 2)
	const buzzInTriggered = useRef(false);
	useEffect(() => {
		if (!activeQuestion) return;
		if (isDailyDouble) return; // Daily Double uses different logic

		// When player buzzes in, give them fresh 5 seconds to answer
		if (activeQuestion.isLocked && !showAnswer && !answerSubmitted) {
			// Only trigger once per buzz-in
			if (!buzzInTriggered.current) {
				buzzInTriggered.current = true;

				// Cancel current timer animation frame
				if (timerRef.current) {
					cancelAnimationFrame(timerRef.current);
				}

				// Mark that someone has buzzed in (local state for timeout check)
				console.log('🟢 PLAYER BUZZED IN:');
				console.log('  Setting hasBuzzedIn = true');
				console.log('  Setting localBuzzerPlayerId =', activeQuestion.currentBuzzer);
				hasBuzzedInRef.current = true;
				localBuzzerPlayerIdRef.current = activeQuestion.currentBuzzer;

				// Reset to full 5 seconds for answering
				setActiveTimerDuration(TIMER_DURATION);
				setTimeRemaining(TIMER_DURATION);
				startTimeRef.current = Date.now();
				setIsTimerActive(true);
			}
		} else {
			// Reset flag when not locked
			buzzInTriggered.current = false;
		}
	}, [activeQuestion?.isLocked, activeQuestion?.currentBuzzer, showAnswer, answerSubmitted, isDailyDouble]);

	// Watch for all players wrong (Phase 6)
	useEffect(() => {
		if (activeQuestion && activeQuestion.remainingPlayers.length === 0 && !allWrong && !isDailyDouble) {
			setAllWrong(true);
			setShowAnswer(true); // Show answer immediately
			setIsTimerActive(false);
			if (timerRef.current) {
				cancelAnimationFrame(timerRef.current);
			}
		}
	}, [activeQuestion?.remainingPlayers.length, allWrong, isDailyDouble]);

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
		playClickSound();
		setShowAnswer(true);

		// Stop timer completely - unlimited time to judge right/wrong
		setIsTimerActive(false);
		if (timerRef.current) {
			cancelAnimationFrame(timerRef.current);
		}
	};

	const handleCorrect = () => {
		playClickSound();
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
		playClickSound();
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
			<div className={`questionModal ${timedOut ? 'timedOut' : ''} ${noBuzzedIn ? 'noBuzzedIn' : ''} ${correctSubmitted ? 'correctSubmitted' : ''} ${incorrectSubmitted ? 'incorrectSubmitted' : ''} ${allWrong ? 'allWrong' : ''}`} onClick={(e) => e.stopPropagation()}>
				<button className="modalCloseButton" onClick={() => { playClickSound(); onClose(); }} onMouseEnter={playHoverSound}>
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
					{!timedOut && !correctSubmitted && (
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
										onClick={() => { playClickSound(); onBuzzIn(playerId); }}
										onMouseEnter={playHoverSound}
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
									onMouseEnter={playHoverSound}
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

							{!timedOut && !allWrong && !noBuzzedIn && (
								<div className="modalActions">
									<button
										className="modalButton correctButton"
										onClick={handleCorrect}
										disabled={answerSubmitted}
										onMouseEnter={playHoverSound}
									>
										<span className="buttonTextSmall">i got it</span>
										<span className="buttonTextLarge">Correct</span>
									</button>
									<button
										className="modalButton incorrectButton"
										onClick={handleIncorrect}
										disabled={answerSubmitted}
										onMouseEnter={playHoverSound}
									>
										<span className="buttonTextSmall">i didn't get it</span>
										<span className="buttonTextLarge">Incorrect</span>
									</button>
								</div>
							)}

							{timedOut && (
								<div className="timeoutMessage">
									TIME'S UP! Points deducted.
								</div>
							)}

							{noBuzzedIn && (
								<div className="noBuzzMessage">
									NO ONE BUZZED IN
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

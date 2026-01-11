import React, { useState } from 'react';
import { playHoverSound, playClickSound } from '../utils/audioEffects';

const STEPS = {
	INTRO: 'intro',
	WAGERS: 'wagers',
	QUESTION: 'question',
	ANSWERS: 'answers',
	RESULTS: 'results'
};

export default function FinalJeopardyModal({
	category,
	clue,
	players,
	onComplete
}) {
	const [step, setStep] = useState(STEPS.INTRO);
	const [wagers, setWagers] = useState({});
	const [currentWagerPlayer, setCurrentWagerPlayer] = useState(0);
	const [wagerInput, setWagerInput] = useState('');
	const [wagerError, setWagerError] = useState('');
	const [showQuestion, setShowQuestion] = useState(false);
	const [showAnswer, setShowAnswer] = useState(false);
	const [currentAnswerPlayer, setCurrentAnswerPlayer] = useState(0);
	const [results, setResults] = useState({});

	// Filter players with positive scores for Final Jeopardy
	const eligiblePlayers = players.filter(p => p.score > 0);

	const handleStartWagers = () => {
		playClickSound();
		setStep(STEPS.WAGERS);
	};

	const handleWagerSubmit = () => {
		playClickSound();
		const player = eligiblePlayers[currentWagerPlayer];
		const wagerAmount = parseInt(wagerInput, 10);
		const maxWager = player.score;

		if (isNaN(wagerAmount)) {
			setWagerError('Please enter a valid number');
			return;
		}

		if (wagerAmount < 0) {
			setWagerError('Minimum wager is $0');
			return;
		}

		if (wagerAmount > maxWager) {
			setWagerError(`Maximum wager is $${maxWager}`);
			return;
		}

		// Save wager for this player
		setWagers({
			...wagers,
			[player.id]: wagerAmount
		});
		setWagerInput('');
		setWagerError('');

		// Move to next player or show question
		if (currentWagerPlayer < eligiblePlayers.length - 1) {
			setCurrentWagerPlayer(currentWagerPlayer + 1);
		} else {
			setStep(STEPS.QUESTION);
		}
	};

	const handleShowQuestion = () => {
		playClickSound();
		setShowQuestion(true);
	};

	const handleShowAnswer = () => {
		playClickSound();
		setShowAnswer(true);
		setStep(STEPS.ANSWERS);
	};

	const handlePlayerAnswer = (isCorrect) => {
		playClickSound();
		const player = eligiblePlayers[currentAnswerPlayer];
		const wager = wagers[player.id];

		// Save result for this player
		setResults({
			...results,
			[player.id]: {
				wager,
				isCorrect,
				scoreChange: isCorrect ? wager : -wager
			}
		});

		// Move to next player or show final results
		if (currentAnswerPlayer < eligiblePlayers.length - 1) {
			setCurrentAnswerPlayer(currentAnswerPlayer + 1);
		} else {
			onComplete(results, wager, isCorrect, eligiblePlayers, currentAnswerPlayer);
		}
	};

	const currentPlayer = eligiblePlayers[step === STEPS.WAGERS ? currentWagerPlayer : currentAnswerPlayer];

	if (step === STEPS.INTRO) {
		return (
			<div className="modalOverlay">
				<div className="finalJeopardyModal">
					<div className="finalJeopardyHeader">
						<h1 className="finalJeopardyTitle">FINAL JEOPARDY!</h1>
					</div>
					<div className="finalJeopardyContent">
						<div className="finalJeopardyIntro">
							<p className="fjIntroText">
								The final round! All players will wager and answer one question.
							</p>
							<div className="fjPlayerList">
								{eligiblePlayers.map(player => (
									<div key={player.id} className="fjPlayerInfo">
										<span className="fjPlayerName">{player.name}</span>
										<span className="fjPlayerScore">${player.score}</span>
									</div>
								))}
							</div>
						</div>
						<button
							className="modalButton fjContinueButton"
							onClick={handleStartWagers}
							onMouseEnter={playHoverSound}
						>
							Begin Final Jeopardy
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (step === STEPS.WAGERS && currentPlayer) {
		return (
			<div className="modalOverlay">
				<div className="finalJeopardyModal">
					<div className="finalJeopardyHeader">
						<h2 className="fjStepTitle">Final Jeopardy Wager</h2>
					</div>
					<div className="finalJeopardyContent">
						<div className="fjCurrentPlayer">
							{currentPlayer.name}'s Wager
						</div>
						<div className="fjPlayerScore">
							Current Score: ${currentPlayer.score}
						</div>
						<div className="wagerSection">
							<label className="wagerLabel">
								Enter Your Wager:
							</label>
							<input
								type="number"
								className="wagerInput"
								value={wagerInput}
								onChange={(e) => {
									setWagerInput(e.target.value);
									setWagerError('');
								}}
								onKeyPress={(e) => e.key === 'Enter' && handleWagerSubmit()}
								min={0}
								max={currentPlayer.score}
								placeholder={`$0 - $${currentPlayer.score}`}
								autoFocus
							/>
							<div className="wagerHint">
								Min: $0 | Max: ${currentPlayer.score}
							</div>
							{wagerError && (
								<div className="wagerError">{wagerError}</div>
							)}
						</div>
						<button
							className="modalButton submitWagerButton"
							onClick={handleWagerSubmit}
							onMouseEnter={playHoverSound}
						>
							Submit Wager
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (step === STEPS.QUESTION) {
		return (
			<div className="modalOverlay">
				<div className="finalJeopardyModal">
					<div className="finalJeopardyHeader">
						<h2 className="fjCategoryTitle">{category}</h2>
					</div>
					<div className="finalJeopardyContent">
						{!showQuestion ? (
							<>
								<div className="fjCategoryMessage">
									All wagers are in. Here is your Final Jeopardy category:
								</div>
								<button
									className="modalButton showAnswerButton"
									onClick={handleShowQuestion}
									onMouseEnter={playHoverSound}
								>
									Show Question
								</button>
							</>
						) : (
							<>
								<div className="modalQuestion">
									{clue.question}
								</div>
								{!showAnswer ? (
									<button
										className="modalButton showAnswerButton"
										onClick={handleShowAnswer}
										onMouseEnter={playHoverSound}
									>
										Show Answer
									</button>
								) : (
									<div className="modalAnswer">
										{clue.answer}
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		);
	}

	if (step === STEPS.ANSWERS && currentPlayer && showAnswer) {
		return (
			<div className="modalOverlay">
				<div className="finalJeopardyModal">
					<div className="finalJeopardyHeader">
						<h2 className="fjStepTitle">{currentPlayer.name}'s Answer</h2>
					</div>
					<div className="finalJeopardyContent">
						<div className="fjPlayerInfo">
							<div className="fjInfoRow">
								<span>Current Score:</span>
								<span className="fjValue">${currentPlayer.score}</span>
							</div>
							<div className="fjInfoRow">
								<span>Wager:</span>
								<span className="fjValue">${wagers[currentPlayer.id]}</span>
							</div>
						</div>
						<div className="fjAnswerPrompt">
							Did {currentPlayer.name} answer correctly?
						</div>
						<div className="modalActions">
							<button
								className="modalButton correctButton"
								onClick={() => handlePlayerAnswer(true)}
								onMouseEnter={playHoverSound}
							>
								✓ Correct
							</button>
							<button
								className="modalButton incorrectButton"
								onClick={() => handlePlayerAnswer(false)}
								onMouseEnter={playHoverSound}
							>
								✗ Incorrect
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return null;
}

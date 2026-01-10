import React, { useState } from 'react';

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

	const handleShowAnswer = () => {
		setShowAnswer(true);
	};

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

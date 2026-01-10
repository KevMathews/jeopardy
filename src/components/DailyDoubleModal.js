import React, { useState } from 'react';

export default function DailyDoubleModal({
	category,
	currentPlayer,
	currentRound,
	onWagerSubmit,
	onClose
}) {
	const [wager, setWager] = useState('');
	const [error, setError] = useState('');

	// Calculate min and max wager based on Jeopardy rules
	const minWager = 5;

	// Maximum clue value on the board
	const boardMaxValue = currentRound === 1 ? 1000 : 2000;

	// If player has positive score: can wager up to their score OR board max, whichever is greater
	// If player has zero or negative score: can wager up to board max
	const maxWager = currentPlayer.score > 0
		? Math.max(currentPlayer.score, boardMaxValue)
		: boardMaxValue;

	const handleWagerChange = (e) => {
		const value = e.target.value;
		setWager(value);
		setError('');
	};

	const handleSubmit = () => {
		const wagerAmount = parseInt(wager, 10);

		if (isNaN(wagerAmount)) {
			setError('Please enter a valid number');
			return;
		}

		if (wagerAmount < minWager) {
			setError(`Minimum wager is $${minWager}`);
			return;
		}

		if (wagerAmount > maxWager) {
			setError(`Maximum wager is $${maxWager}`);
			return;
		}

		onWagerSubmit(wagerAmount);
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleSubmit();
		}
	};

	return (
		<div className="modalOverlay" onClick={onClose}>
			<div className="dailyDoubleModal" onClick={(e) => e.stopPropagation()}>
				<button className="modalCloseButton" onClick={onClose}>
					×
				</button>

				<div className="dailyDoubleHeader">
					<div className="dailyDoubleAnnouncement">
						DAILY DOUBLE!
					</div>
					<div className="dailyDoubleCategory">{category}</div>
				</div>

				<div className="dailyDoubleContent">
					<div className="dailyDoublePlayer">
						{currentPlayer.name}'s Turn
					</div>

					<div className="dailyDoubleScore">
						Current Score: ${currentPlayer.score}
					</div>

					<div className="wagerSection">
						<label className="wagerLabel">
							Enter Your Wager:
						</label>
						<input
							type="number"
							className="wagerInput"
							value={wager}
							onChange={handleWagerChange}
							onKeyPress={handleKeyPress}
							min={minWager}
							max={maxWager}
							placeholder={`$${minWager} - $${maxWager}`}
							autoFocus
						/>
						<div className="wagerHint">
							Min: ${minWager} | Max: ${maxWager}
						</div>
						{error && (
							<div className="wagerError">{error}</div>
						)}
					</div>

					<button
						className="modalButton submitWagerButton"
						onClick={handleSubmit}
					>
						Submit Wager
					</button>
				</div>
			</div>
		</div>
	);
}

import React from 'react';

export default function RoundTransition({
	currentRound,
	players,
	onContinue
}) {
	// Sort players by score descending
	const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
	const nextRound = currentRound === 1 ? 2 : 'Final Jeopardy';

	return (
		<div className="transitionOverlay">
			<div className="transitionCard">
				<div className="transitionHeader">
					<h1 className="transitionTitle">
						Round {currentRound} Complete!
					</h1>
				</div>

				<div className="transitionContent">
					<div className="transitionScores">
						<h2 className="scoresTitle">Current Standings</h2>
						<div className="scoresList">
							{sortedPlayers.map((player, index) => (
								<div
									key={player.id}
									className={`transitionPlayerCard ${index === 0 ? 'leading' : ''}`}
								>
									<span className="playerRank">
										{index === 1 ? '🥈' : index === 2 ? '🥉' : index === 0 ? '🥇' : ''}
									</span>
									<span className="playerName">{player.name}</span>
									<span className="playerScore">${player.score}</span>
								</div>
							))}
						</div>
					</div>

					<div className="transitionMessage">
						Get ready for {nextRound}!
					</div>

					<button
						className="continueButton"
						onClick={onContinue}
					>
						Continue to {nextRound}
					</button>
				</div>
			</div>
		</div>
	);
}

import React from 'react';
import { getWinners } from '../utils/gameStateManager';
import { playHoverSound, playClickSound } from '../utils/audioEffects';

export default function GameComplete({ gameState, onNewGame }) {
	const handlePlayAgain = () => {
		playClickSound();
		onNewGame();
	};
	const winners = getWinners(gameState);
	const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
	const isMultiWinner = winners.length > 1;

	// Calculate some game statistics
	const totalCellsAnswered = gameState.answeredCells ? gameState.answeredCells.size : 0;

	return (
		<div className="gameBoardContainer">
			<div className="gameCompleteCard">
				<div className="gameCompleteHeader">
					<h1 className="gameCompleteTitle">
						{isMultiWinner ? "It's a Tie!" : "We Have a Winner!"}
					</h1>
				</div>

				<div className="gameCompleteContent">
					{/* Winner(s) Display */}
					<div className="winnerSection">
						{isMultiWinner ? (
							<div className="winnerAnnouncement">
								{winners.map((winner, index) => (
									<span key={winner.id}>
										{winner.name}
										{index < winners.length - 1 ? ' & ' : ''}
									</span>
								))}
							</div>
						) : (
							<div className="winnerAnnouncement">
								{winners[0].name}
							</div>
						)}
						<div className="winnerScore">
							${winners[0].score}
						</div>
						<div className="winnerTrophy">
							🏆
						</div>
					</div>

					{/* Final Scoreboard */}
					<div className="finalScoreboard">
						<h2 className="finalScoresTitle">Final Standings</h2>
						<div className="finalScoresList">
							{sortedPlayers.map((player, index) => (
								<div
									key={player.id}
									className={`finalPlayerCard ${index === 0 ? 'winner' : ''}`}
								>
									<span className="finalRank">
										{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
									</span>
									<span className="finalPlayerName">{player.name}</span>
									<span className="finalPlayerScore">${player.score}</span>
								</div>
							))}
						</div>
					</div>

					{/* Game Stats */}
					<div className="gameStats">
						<div className="statItem">
							<span className="statLabel">Rounds Played:</span>
							<span className="statValue">3</span>
						</div>
						<div className="statItem">
							<span className="statLabel">Questions Answered:</span>
							<span className="statValue">{totalCellsAnswered}</span>
						</div>
						<div className="statItem">
							<span className="statLabel">Players:</span>
							<span className="statValue">{gameState.players.length}</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="gameCompleteActions">
						<button
							className="playAgainButton"
							onClick={handlePlayAgain}
							onMouseEnter={playHoverSound}
						>
							Play Again
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

import React from 'react';

export default function PlayerScoreboard({ players, currentPlayerIndex }) {
	return (
		<div className="playerScoreboard">
			<div className="scoreboardTitle">Players</div>
			<div className="playerList">
				{players.map((player, index) => {
					const isCurrentPlayer = index === currentPlayerIndex;
					const scoreClass = player.score < 0 ? 'negative' : player.score > 0 ? 'positive' : 'zero';

					return (
						<div
							key={player.id}
							className={`playerCard ${isCurrentPlayer ? 'active' : ''}`}
						>
							<div className="playerName">
								{player.name}
								{isCurrentPlayer && (
									<span className="turnIndicator"> ◄</span>
								)}
							</div>
							<div className={`playerScore ${scoreClass}`}>
								${player.score.toLocaleString()}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

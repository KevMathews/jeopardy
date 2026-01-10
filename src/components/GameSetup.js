import React, { useState } from 'react';
import { PLAYER_CONFIG } from '../constants/gameConfig';

export default function GameSetup({ onStartGame }) {
	const [playerCount, setPlayerCount] = useState(1);
	const [playerNames, setPlayerNames] = useState(['']);

	const handlePlayerCountChange = (count) => {
		setPlayerCount(count);
		const newNames = Array(count).fill('').map((_, i) =>
			playerNames[i] || ''
		);
		setPlayerNames(newNames);
	};

	const handleNameChange = (index, name) => {
		const newNames = [...playerNames];
		newNames[index] = name;
		setPlayerNames(newNames);
	};

	const handleStartGame = () => {
		const names = playerNames.map((name, index) =>
			name.trim() || `Player ${index + 1}`
		);
		onStartGame(names);
	};

	const canStartGame = playerNames.some(name => name.trim().length > 0);

	return (
		<div className="gameSetupContainer">
			<div className="gameSetupCard">
				<h1 className="setupTitle">This is JEOPARDY!</h1>

				<div className="setupSection">
					<h2 className="sectionTitle">Number of Players</h2>
					<div className="playerCountButtons">
						{[1, 2, 3].map(count => (
							<button
								key={count}
								className={`playerCountButton ${playerCount === count ? 'active' : ''}`}
								onClick={() => handlePlayerCountChange(count)}
							>
								{count} Player{count > 1 ? 's' : ''}
							</button>
						))}
					</div>
				</div>

				<div className="setupSection">
					<h2 className="sectionTitle">Player Names</h2>
					<div className="playerInputs">
						{playerNames.map((name, index) => (
							<div key={index} className="playerInputGroup">
								<label className="playerLabel">
									Player {index + 1}:
								</label>
								<input
									type="text"
									className="playerInput"
									value={name}
									onChange={(e) => handleNameChange(index, e.target.value)}
									placeholder={`Player ${index + 1}`}
									maxLength={20}
								/>
							</div>
						))}
					</div>
				</div>

				<div className="setupSection">
					<button
						className="startGameButton"
						onClick={handleStartGame}
						disabled={!canStartGame}
					>
						<h2>Start Game</h2>
					</button>
					<p className="setupHint">
						Leave names blank to use default player names
					</p>
				</div>
			</div>
		</div>
	);
}

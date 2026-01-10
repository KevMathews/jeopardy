import React from 'react';
import CategoryHeader from './CategoryHeader';
import BoardCell from './BoardCell';
import PlayerScoreboard from './PlayerScoreboard';
import { getRoundValues, getCellId, parseCellId } from '../constants/gameConfig';

export default function GameBoard({
	gameState,
	onCellClick
}) {
	const { categories, players, currentPlayerIndex, currentRound, answeredCells, dailyDoubleLocations } = gameState;
	const roundValues = getRoundValues(currentRound);

	const handleCellClick = (cellId) => {
		const { categoryIndex, valueIndex } = parseCellId(cellId);
		const category = categories[categoryIndex];
		const clue = category.clues[valueIndex];
		const value = roundValues[valueIndex];

		onCellClick({
			cellId,
			clue,
			value,
			categoryIndex,
			valueIndex,
			isDailyDouble: dailyDoubleLocations.includes(cellId)
		});
	};

	return (
		<div className="gameBoardContainer">
			<div className="gameBoardHeader">
				<img
					className="jeopardyLogoSmall"
					src="https://i.imgur.com/aDK80QC.png"
					alt="Jeopardy Logo"
				/>
			</div>

			<PlayerScoreboard
				players={players}
				currentPlayerIndex={currentPlayerIndex}
			/>

			<div className="gameBoard">
				<div className="categoryHeaders">
					{categories.map((category, index) => (
						<CategoryHeader
							key={category.id}
							title={category.title}
						/>
					))}
				</div>

				<div className="boardGrid">
					{roundValues.map((value, valueIndex) => (
						<div key={valueIndex} className="boardRow">
							{categories.map((category, categoryIndex) => {
								const cellId = getCellId(categoryIndex, valueIndex);
								const isAnswered = answeredCells.has(cellId);
								const isDailyDouble = dailyDoubleLocations.includes(cellId);

								return (
									<BoardCell
										key={cellId}
										cellId={cellId}
										value={value}
										isAnswered={isAnswered}
										isDailyDouble={isDailyDouble}
										onClick={handleCellClick}
									/>
								);
							})}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

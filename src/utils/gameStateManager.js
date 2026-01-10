import {
	GAME_PHASES,
	BOARD_CONFIG,
	INITIAL_GAME_STATE,
	getInitialPlayer,
	getCellId,
	getDailyDoubleCount
} from '../constants/gameConfig';
import { selectRandomCategories, selectFinalJeopardyCategory } from './apiService';
import { saveGameState, saveUsedCategories } from './localStorageService';

/**
 * Initialize game state with players
 * @param {Array} playerNames - Array of player names
 * @returns {Object} Initial game state with players
 */
export function initializeGame(playerNames) {
	const players = playerNames.map((name, index) =>
		getInitialPlayer(index + 1, name)
	);

	return {
		...INITIAL_GAME_STATE,
		players,
		currentPlayerIndex: 0,
		phase: GAME_PHASES.SETUP,
		usedCategoryIds: new Set()
	};
}

/**
 * Start Round 1 by fetching categories and placing Daily Doubles
 * @param {Object} currentState - Current game state
 * @returns {Promise<Object>} Updated game state for Round 1
 */
export async function startRound1(currentState) {
	const categories = await selectRandomCategories(
		BOARD_CONFIG.CATEGORIES_PER_ROUND,
		currentState.usedCategoryIds
	);

	const categoryIds = categories.map(cat => cat.id);
	const updatedUsedIds = new Set([
		...currentState.usedCategoryIds,
		...categoryIds
	]);

	const dailyDoubleLocations = generateDailyDoubleLocations(1);

	const newState = {
		...currentState,
		phase: GAME_PHASES.ROUND_1,
		currentRound: 1,
		categories,
		answeredCells: new Set(),
		dailyDoubleLocations,
		usedCategoryIds: updatedUsedIds
	};

	saveGameState(newState);
	saveUsedCategories(updatedUsedIds);

	return newState;
}

/**
 * Start Round 2 by fetching new categories and placing Daily Doubles
 * @param {Object} currentState - Current game state
 * @returns {Promise<Object>} Updated game state for Round 2
 */
export async function startRound2(currentState) {
	const categories = await selectRandomCategories(
		BOARD_CONFIG.CATEGORIES_PER_ROUND,
		currentState.usedCategoryIds
	);

	const categoryIds = categories.map(cat => cat.id);
	const updatedUsedIds = new Set([
		...currentState.usedCategoryIds,
		...categoryIds
	]);

	const dailyDoubleLocations = generateDailyDoubleLocations(2);

	const newState = {
		...currentState,
		phase: GAME_PHASES.ROUND_2,
		currentRound: 2,
		categories,
		answeredCells: new Set(),
		dailyDoubleLocations,
		usedCategoryIds: updatedUsedIds
	};

	saveGameState(newState);
	saveUsedCategories(updatedUsedIds);

	return newState;
}

/**
 * Start Final Jeopardy by selecting category
 * @param {Object} currentState - Current game state
 * @returns {Promise<Object>} Updated game state for Final Jeopardy
 */
export async function startFinalJeopardy(currentState) {
	const finalCategory = await selectFinalJeopardyCategory(
		currentState.usedCategoryIds
	);

	const newState = {
		...currentState,
		phase: GAME_PHASES.FINAL_JEOPARDY,
		categories: [finalCategory],
		answeredCells: new Set(),
		dailyDoubleLocations: []
	};

	saveGameState(newState);

	return newState;
}

/**
 * Generate random Daily Double locations for a round
 * @param {number} round - Round number (1 or 2)
 * @returns {Array} Array of cell IDs for Daily Doubles
 */
export function generateDailyDoubleLocations(round) {
	const count = getDailyDoubleCount(round);
	const locations = [];
	const usedPositions = new Set();

	while (locations.length < count) {
		const categoryIndex = Math.floor(
			Math.random() * BOARD_CONFIG.CATEGORIES_PER_ROUND
		);
		const valueIndex = Math.floor(
			Math.random() * BOARD_CONFIG.VALUES_PER_CATEGORY
		);
		const cellId = getCellId(categoryIndex, valueIndex);

		if (!usedPositions.has(cellId)) {
			locations.push(cellId);
			usedPositions.add(cellId);
		}
	}

	return locations;
}

/**
 * Handle cell selection
 * @param {Object} currentState - Current game state
 * @param {string} cellId - Selected cell ID
 * @returns {Object} Updated game state with selected cell
 */
export function selectCell(currentState, cellId) {
	if (currentState.answeredCells.has(cellId)) {
		return currentState;
	}

	const newState = {
		...currentState,
		selectedCell: cellId
	};

	return newState;
}

/**
 * Handle answer submission (correct or incorrect)
 * @param {Object} currentState - Current game state
 * @param {boolean} isCorrect - Whether answer was correct
 * @param {number} value - Question value
 * @param {number} wager - Wager amount (for Daily Doubles)
 * @returns {Object} Updated game state with new scores and turn
 */
export function submitAnswer(currentState, isCorrect, value, wager = null) {
	const players = [...currentState.players];
	const currentPlayer = players[currentState.currentPlayerIndex];

	const pointChange = wager !== null ? wager : value;
	currentPlayer.score += isCorrect ? pointChange : -pointChange;

	const answeredCells = new Set(currentState.answeredCells);
	if (currentState.selectedCell) {
		answeredCells.add(currentState.selectedCell);
	}

	const shouldKeepTurn = isCorrect;
	const nextPlayerIndex = shouldKeepTurn
		? currentState.currentPlayerIndex
		: (currentState.currentPlayerIndex + 1) % players.length;

	const newState = {
		...currentState,
		players,
		answeredCells,
		currentPlayerIndex: nextPlayerIndex,
		selectedCell: null
	};

	saveGameState(newState);

	return newState;
}

/**
 * Register a player buzz-in
 * @param {Object} currentState - Current game state
 * @param {number} playerId - ID of player who buzzed
 * @returns {Object} Updated game state with buzz recorded
 */
export function registerBuzzIn(currentState, playerId) {
	const activeQuestion = {
		...currentState.activeQuestion,
		currentBuzzer: playerId,
		buzzedPlayers: [...currentState.activeQuestion.buzzedPlayers, playerId],
		isLocked: true,
		timerPausedAt: Date.now()
	};

	const newState = {
		...currentState,
		activeQuestion,
		currentPlayerIndex: currentState.players.findIndex(p => p.id === playerId)
	};

	saveGameState(newState);
	return newState;
}

/**
 * Submit answer from a specific player in buzz-in mode
 * @param {Object} currentState - Current game state
 * @param {number} playerId - ID of player answering
 * @param {boolean} isCorrect - Whether answer was correct
 * @param {number} value - Question value
 * @param {number} wager - Wager amount (for Daily Doubles)
 * @returns {Object} Updated game state
 */
export function submitBuzzAnswer(currentState, playerId, isCorrect, value, wager = null) {
	const players = [...currentState.players];
	const playerIndex = players.findIndex(p => p.id === playerId);
	const player = players[playerIndex];

	const pointChange = wager !== null ? wager : value;
	player.score += isCorrect ? pointChange : -pointChange;

	const attemptedAnswers = {
		...currentState.activeQuestion.attemptedAnswers,
		[playerId]: {
			correct: isCorrect,
			timestamp: Date.now(),
			pointChange: isCorrect ? pointChange : -pointChange
		}
	};

	// If correct, close question
	if (isCorrect) {
		const answeredCells = new Set(currentState.answeredCells);
		answeredCells.add(currentState.activeQuestion.cellId);

		const newState = {
			...currentState,
			players,
			answeredCells,
			currentPlayerIndex: playerIndex,
			activeQuestion: null,
			selectedCell: null
		};

		saveGameState(newState);
		return newState;
	}

	// If incorrect, remove from remaining players, reopen buzzer
	const remainingPlayers = currentState.activeQuestion.remainingPlayers
		.filter(id => id !== playerId);

	const newState = {
		...currentState,
		players,
		activeQuestion: {
			...currentState.activeQuestion,
			attemptedAnswers,
			remainingPlayers,
			currentBuzzer: null,
			isLocked: false,
			timerStartTime: Date.now()
		}
	};

	saveGameState(newState);
	return newState;
}

/**
 * Close active question (all wrong or timeout)
 * @param {Object} currentState - Current game state
 * @returns {Object} Updated game state with question closed
 */
export function closeQuestion(currentState) {
	const answeredCells = new Set(currentState.answeredCells);
	answeredCells.add(currentState.activeQuestion.cellId);

	const newState = {
		...currentState,
		answeredCells,
		activeQuestion: null,
		selectedCell: null,
		currentPlayerIndex: currentState.activeQuestion.originalSelector
	};

	saveGameState(newState);
	return newState;
}

/**
 * Check if round is complete
 * @param {Object} currentState - Current game state
 * @returns {boolean} True if all cells answered
 */
export function isRoundComplete(currentState) {
	return (
		currentState.answeredCells.size === BOARD_CONFIG.TOTAL_CELLS_PER_ROUND
	);
}

/**
 * Complete game and return final state
 * @param {Object} currentState - Current game state
 * @returns {Object} Final game state
 */
export function completeGame(currentState) {
	const newState = {
		...currentState,
		phase: GAME_PHASES.COMPLETE
	};

	saveGameState(newState);

	return newState;
}

/**
 * Get winner(s) from current game state
 * @param {Object} gameState - Current game state
 * @returns {Array} Array of winning player(s)
 */
export function getWinners(gameState) {
	const maxScore = Math.max(...gameState.players.map(p => p.score));
	return gameState.players.filter(p => p.score === maxScore);
}

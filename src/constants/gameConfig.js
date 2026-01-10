export const GAME_PHASES = {
	SETUP: 'setup',
	ROUND_1: 'round1',
	ROUND_2: 'round2',
	FINAL_JEOPARDY: 'final',
	COMPLETE: 'complete'
};

export const ROUND_VALUES = {
	ROUND_1: [200, 400, 600, 800, 1000],
	ROUND_2: [400, 800, 1200, 1600, 2000]
};

export const BOARD_CONFIG = {
	CATEGORIES_PER_ROUND: 6,
	VALUES_PER_CATEGORY: 5,
	TOTAL_CELLS_PER_ROUND: 30
};

export const DAILY_DOUBLE_CONFIG = {
	ROUND_1_COUNT: 1,
	ROUND_2_COUNT: 2,
	MIN_WAGER: 5
};

export const PLAYER_CONFIG = {
	MIN_PLAYERS: 1,
	MAX_PLAYERS: 3
};

export const GAME_RULES = {
	MIN_FINAL_JEOPARDY_WAGER: 0,
	CORRECT_ANSWER_KEEPS_TURN: true,
	INCORRECT_ANSWER_NEXT_PLAYER: true
};

export const API_CONFIG = {
	BASE_URL: 'https://rithm-jeopardy.herokuapp.com/api',
	TOTAL_CATEGORIES_AVAILABLE: 14,
	CATEGORIES_FOR_GAME: 13
};

export const STORAGE_KEYS = {
	GAME_STATE: 'jeopardy_game_state',
	USED_CATEGORIES: 'jeopardy_used_categories'
};

export const INITIAL_GAME_STATE = {
	phase: GAME_PHASES.SETUP,
	players: [],
	currentPlayerIndex: 0,
	currentRound: 1,
	categories: [],
	answeredCells: new Set(),
	dailyDoubleLocations: [],
	usedCategoryIds: new Set(),
	selectedCell: null,
	modalType: null
};

export function getInitialPlayer(id, name) {
	return {
		id,
		name: name || `Player ${id}`,
		score: 0,
		isActive: id === 1
	};
}

export function getCellId(categoryIndex, valueIndex) {
	return `${categoryIndex}-${valueIndex}`;
}

export function parseCellId(cellId) {
	const [categoryIndex, valueIndex] = cellId.split('-').map(Number);
	return { categoryIndex, valueIndex };
}

export function getRoundValues(round) {
	return round === 1 ? ROUND_VALUES.ROUND_1 : ROUND_VALUES.ROUND_2;
}

export function getDailyDoubleCount(round) {
	return round === 1
		? DAILY_DOUBLE_CONFIG.ROUND_1_COUNT
		: DAILY_DOUBLE_CONFIG.ROUND_2_COUNT;
}

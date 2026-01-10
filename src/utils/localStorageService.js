const GAME_STATE_KEY = 'jeopardy_game_state';
const USED_CATEGORIES_KEY = 'jeopardy_used_categories';

/**
 * Save game state to localStorage
 * @param {Object} gameState - Current game state object
 * @returns {boolean} Success status
 */
export function saveGameState(gameState) {
	try {
		const stateToSave = {
			...gameState,
			answeredCells: Array.from(gameState.answeredCells || []),
			usedCategoryIds: Array.from(gameState.usedCategoryIds || []),
			dailyDoubleLocations: gameState.dailyDoubleLocations || [],
			timestamp: Date.now()
		};

		localStorage.setItem(GAME_STATE_KEY, JSON.stringify(stateToSave));
		return true;
	} catch (error) {
		console.error('Error saving game state:', error);
		return false;
	}
}

/**
 * Load game state from localStorage
 * @returns {Object|null} Saved game state or null if not found
 */
export function loadGameState() {
	try {
		const saved = localStorage.getItem(GAME_STATE_KEY);
		if (!saved) {
			return null;
		}

		const parsed = JSON.parse(saved);

		return {
			...parsed,
			answeredCells: new Set(parsed.answeredCells || []),
			usedCategoryIds: new Set(parsed.usedCategoryIds || [])
		};
	} catch (error) {
		console.error('Error loading game state:', error);
		return null;
	}
}

/**
 * Clear saved game state from localStorage
 */
export function clearGameState() {
	try {
		localStorage.removeItem(GAME_STATE_KEY);
	} catch (error) {
		console.error('Error clearing game state:', error);
	}
}

/**
 * Save used category IDs to localStorage
 * @param {Set} usedCategoryIds - Set of category IDs
 * @returns {boolean} Success status
 */
export function saveUsedCategories(usedCategoryIds) {
	try {
		const idsArray = Array.from(usedCategoryIds);
		localStorage.setItem(USED_CATEGORIES_KEY, JSON.stringify(idsArray));
		return true;
	} catch (error) {
		console.error('Error saving used categories:', error);
		return false;
	}
}

/**
 * Load used category IDs from localStorage
 * @returns {Set} Set of used category IDs
 */
export function loadUsedCategories() {
	try {
		const saved = localStorage.getItem(USED_CATEGORIES_KEY);
		if (!saved) {
			return new Set();
		}

		const parsed = JSON.parse(saved);
		return new Set(parsed);
	} catch (error) {
		console.error('Error loading used categories:', error);
		return new Set();
	}
}

/**
 * Clear used category IDs from localStorage
 */
export function clearUsedCategories() {
	try {
		localStorage.removeItem(USED_CATEGORIES_KEY);
	} catch (error) {
		console.error('Error clearing used categories:', error);
	}
}

/**
 * Reset all game data (state + used categories)
 */
export function resetAllGameData() {
	clearGameState();
	clearUsedCategories();
}

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
export function isLocalStorageAvailable() {
	try {
		const testKey = '__jeopardy_test__';
		localStorage.setItem(testKey, 'test');
		localStorage.removeItem(testKey);
		return true;
	} catch {
		return false;
	}
}

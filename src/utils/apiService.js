const API_BASE = 'https://rithm-jeopardy.herokuapp.com/api';

/**
 * Fetch all available categories from the Jeopardy API
 * @returns {Promise<Array>} Array of category objects with id and title
 */
export async function fetchAllCategories() {
	try {
		const response = await fetch(`${API_BASE}/categories?count=100`);
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}
		const categories = await response.json();
		return categories;
	} catch (error) {
		console.error('Error fetching categories:', error);
		throw error;
	}
}

/**
 * Fetch full details for a specific category including all clues
 * @param {number} categoryId - The category ID to fetch
 * @returns {Promise<Object>} Category object with clues array
 */
export async function fetchCategoryById(categoryId) {
	try {
		const response = await fetch(`${API_BASE}/category?id=${categoryId}`);
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}
		const category = await response.json();
		return category;
	} catch (error) {
		console.error(`Error fetching category ${categoryId}:`, error);
		throw error;
	}
}

/**
 * Select random categories excluding already used ones
 * @param {number} count - Number of categories to select
 * @param {Set} usedCategoryIds - Set of already used category IDs
 * @returns {Promise<Array>} Array of category objects with full details
 */
export async function selectRandomCategories(count, usedCategoryIds = new Set()) {
	const allCategories = await fetchAllCategories();

	const availableCategories = allCategories.filter(
		cat => !usedCategoryIds.has(cat.id)
	);

	if (availableCategories.length < count) {
		throw new Error(`Not enough categories available. Need ${count}, have ${availableCategories.length}`);
	}

	const shuffled = [...availableCategories].sort(() => Math.random() - 0.5);
	const selected = shuffled.slice(0, count);

	const categoriesWithDetails = await Promise.all(
		selected.map(cat => fetchCategoryById(cat.id))
	);

	return categoriesWithDetails;
}

/**
 * Select category for Final Jeopardy (picks hardest clue from remaining categories)
 * @param {Set} usedCategoryIds - Set of already used category IDs
 * @returns {Promise<Object>} Category object with selected clue
 */
export async function selectFinalJeopardyCategory(usedCategoryIds = new Set()) {
	const allCategories = await fetchAllCategories();

	const availableCategories = allCategories.filter(
		cat => !usedCategoryIds.has(cat.id)
	);

	if (availableCategories.length === 0) {
		throw new Error('No categories available for Final Jeopardy');
	}

	const randomCategory = availableCategories[
		Math.floor(Math.random() * availableCategories.length)
	];

	const categoryDetails = await fetchCategoryById(randomCategory.id);

	const hardestClue = categoryDetails.clues.reduce((hardest, current) => {
		return (current.value || 0) > (hardest.value || 0) ? current : hardest;
	}, categoryDetails.clues[0]);

	return {
		...categoryDetails,
		finalJeopardyClue: hardestClue
	};
}

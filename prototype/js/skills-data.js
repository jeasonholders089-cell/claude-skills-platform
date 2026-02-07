// skills-data.js - Data loading and caching module

const CACHE_KEY = 'skills_data';
const CACHE_VERSION_KEY = 'skills_data_version';
const CACHE_VERSION = '3.0';

let skillsData = null;

/**
 * Load skills data from JSON file or cache
 * @returns {Promise<Object>} Skills data object
 */
export async function loadSkills() {
  // Check if already loaded in memory
  if (skillsData) {
    return skillsData;
  }

  // Check localStorage cache
  const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
  const cachedData = localStorage.getItem(CACHE_KEY);

  if (cachedVersion === CACHE_VERSION && cachedData) {
    try {
      skillsData = JSON.parse(cachedData);
      console.log('Loaded skills from cache');
      return skillsData;
    } catch (e) {
      console.warn('Failed to parse cached data', e);
    }
  }

  // Fetch from JSON file
  try {
    const response = await fetch('data/skills.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    skillsData = await response.json();

    // Cache in localStorage
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(skillsData));
      localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
      console.log('Cached skills data');
    } catch (e) {
      console.warn('Failed to cache data', e);
    }

    console.log(`Loaded ${skillsData.totalSkills} skills`);
    return skillsData;
  } catch (error) {
    console.error('Failed to load skills:', error);
    throw error;
  }
}

/**
 * Get all skills
 * @returns {Array} Array of skill objects
 */
export function getAllSkills() {
  return skillsData ? skillsData.skills : [];
}

/**
 * Get skills by original category
 * @param {string} category - Original category name (e.g., "Web & Frontend Development")
 * @returns {Array} Filtered array of skills
 */
export function getSkillsByCategory(category) {
  if (!skillsData) return [];
  if (!category || category === 'all') return skillsData.skills;

  return skillsData.skills.filter(skill => skill.category === category);
}

/**
 * Search skills by query (searches in name, author, English and Chinese descriptions)
 * @param {string} query - Search query
 * @returns {Array} Filtered array of skills
 */
export function searchSkills(query) {
  if (!skillsData || !query) return skillsData ? skillsData.skills : [];

  const lowerQuery = query.toLowerCase();
  return skillsData.skills.filter(skill =>
    skill.name.toLowerCase().includes(lowerQuery) ||
    skill.author.toLowerCase().includes(lowerQuery) ||
    skill.description.toLowerCase().includes(lowerQuery) ||
    (skill.descriptionCn && skill.descriptionCn.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get skill by ID
 * @param {string} id - Skill ID
 * @returns {Object|null} Skill object or null
 */
export function getSkillById(id) {
  if (!skillsData) return null;
  return skillsData.skills.find(skill => skill.id === id) || null;
}

/**
 * Get all categories with counts
 * @returns {Array} Array of category objects from skills.json
 */
export function getCategories() {
  if (!skillsData || !skillsData.categories) return [];
  return skillsData.categories;
}

/**
 * Get category counts (legacy function for compatibility)
 * @returns {Object} Object with category names as keys and counts as values
 */
export function getCategoryCounts() {
  if (!skillsData) return {};

  const counts = {};
  for (const skill of skillsData.skills) {
    counts[skill.category] = (counts[skill.category] || 0) + 1;
  }
  return counts;
}

/**
 * Clear cache
 */
export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_VERSION_KEY);
  skillsData = null;
  console.log('Cache cleared');
}

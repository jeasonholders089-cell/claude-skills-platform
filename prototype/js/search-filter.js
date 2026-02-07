// search-filter.js - Search and filter logic

/**
 * Filter skills by category and search query
 * @param {Array} skills - Array of skill objects
 * @param {Object} filters - Filter options
 * @param {string} filters.category - Category to filter by
 * @param {string} filters.query - Search query
 * @returns {Array} Filtered array of skills
 */
export function filterSkills(skills, filters = {}) {
  let filtered = [...skills];

  // Filter by category (using original category)
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(skill => skill.category === filters.category);
  }

  // Filter by search query (search in both EN and CN descriptions)
  if (filters.query && filters.query.trim()) {
    const lowerQuery = filters.query.toLowerCase().trim();
    filtered = filtered.filter(skill =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.author.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      (skill.descriptionCn && skill.descriptionCn.toLowerCase().includes(lowerQuery))
    );
  }

  return filtered;
}

/**
 * Sort skills
 * @param {Array} skills - Array of skill objects
 * @param {string} sortBy - Sort field ('name', 'author', 'category')
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array of skills
 */
export function sortSkills(skills, sortBy = 'name', order = 'asc') {
  const sorted = [...skills];

  sorted.sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'author':
        aVal = a.author.toLowerCase();
        bVal = b.author.toLowerCase();
        break;
      case 'category':
        aVal = a.category.toLowerCase();
        bVal = b.category.toLowerCase();
        break;
      default:
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
    }

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

/**
 * Paginate skills
 * @param {Array} skills - Array of skill objects
 * @param {number} page - Page number (1-indexed)
 * @param {number} perPage - Number of skills per page
 * @returns {Object} Object with paginated skills and metadata
 */
export function paginateSkills(skills, page = 1, perPage = 24) {
  const totalSkills = skills.length;
  const totalPages = Math.ceil(totalSkills / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedSkills = skills.slice(startIndex, endIndex);

  return {
    skills: paginatedSkills,
    currentPage,
    totalPages,
    totalSkills,
    perPage,
    startIndex,
    endIndex: Math.min(endIndex, totalSkills)
  };
}

/**
 * Create a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Get URL parameters
 * @returns {Object} Object with URL parameters
 */
export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    category: params.get('category') || 'all',
    query: params.get('q') || '',
    page: parseInt(params.get('page')) || 1
  };
}

/**
 * Update URL parameters
 * @param {Object} params - Parameters to update
 */
export function updateUrlParams(params) {
  const url = new URL(window.location);

  if (params.category && params.category !== 'all') {
    url.searchParams.set('category', params.category);
  } else {
    url.searchParams.delete('category');
  }

  if (params.query && params.query.trim()) {
    url.searchParams.set('q', params.query);
  } else {
    url.searchParams.delete('q');
  }

  if (params.page && params.page > 1) {
    url.searchParams.set('page', params.page);
  } else {
    url.searchParams.delete('page');
  }

  window.history.pushState({}, '', url);
}

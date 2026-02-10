// app.js - Main application entry point

import { loadSkills, getAllSkills, getCategories } from './skills-data.js';
import {
  renderSkillCard,
  renderPagination,
  renderSidebar,
  showSkillModal,
  showLoading,
  hideLoading,
  showError,
  showEmptyState
} from './ui-components.js';
import {
  filterSkills,
  paginateSkills,
  debounce,
  getUrlParams,
  updateUrlParams
} from './search-filter.js';

// Application state
let appState = {
  allSkills: [],
  categories: [],
  filteredSkills: [],
  currentPage: 1,
  perPage: 24,
  filters: {
    category: 'all',
    query: ''
  }
};

/**
 * Initialize the application
 */
async function init() {
  try {
    showLoading();

    // Load skills data
    const data = await loadSkills();
    appState.allSkills = data.skills;
    appState.categories = data.categories || getCategories();

    // Get URL parameters
    const urlParams = getUrlParams();
    appState.filters.category = urlParams.category;
    appState.filters.query = urlParams.query;
    appState.currentPage = urlParams.page;

    // Render sidebar
    renderSidebarCategories();

    // Update hero statistics
    updateHeroStats(data.totalSkills);

    // Set up event listeners
    setupEventListeners();

    // Initial render
    renderSkills();

    hideLoading();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    hideLoading();
    showError('加载失败，请重试');

    // Add retry button listener
    document.getElementById('retry-btn')?.addEventListener('click', () => {
      window.location.reload();
    });
  }
}

/**
 * Update hero statistics
 * @param {number} totalSkills - Total number of skills
 */
function updateHeroStats(totalSkills) {
  const statsElements = document.querySelectorAll('.text-3xl.font-bold');
  if (statsElements.length > 0) {
    statsElements[0].textContent = `${totalSkills}+`;
  }
}

/**
 * Render sidebar categories
 */
function renderSidebarCategories() {
  const sidebarContainer = document.getElementById('sidebar-categories');
  if (!sidebarContainer) return;

  const sidebarHTML = renderSidebar(appState.categories, appState.filters.category);
  sidebarContainer.innerHTML = sidebarHTML;

  // Add click listeners to sidebar categories
  const categoryButtons = sidebarContainer.querySelectorAll('.sidebar-category');
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      handleCategoryClick(category);
    });
  });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Category filter
  const categoryCards = document.querySelectorAll('[data-category]');
  categoryCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const category = card.getAttribute('data-category');
      handleCategoryClick(category);
    });
  });

  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    const debouncedSearch = debounce((query) => {
      handleSearch(query);
    }, 300);

    searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });

    // Set initial value from URL
    if (appState.filters.query) {
      searchInput.value = appState.filters.query;
    }
  }

  // Hero search input
  const heroSearchInput = document.querySelector('.hero-search');
  if (heroSearchInput) {
    const debouncedSearch = debounce((query) => {
      handleSearch(query);
      // Scroll to skills section
      document.getElementById('skills-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);

    heroSearchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });
  }
}

/**
 * Handle category click
 * @param {string} category - Category name
 */
function handleCategoryClick(category) {
  appState.filters.category = category;
  appState.currentPage = 1;
  updateUrlParams({
    category: category,
    query: appState.filters.query,
    page: 1
  });

  // Update sidebar highlighting
  renderSidebarCategories();

  // Render skills
  renderSkills();

  // Scroll to skills section
  document.getElementById('skills-section')?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Handle search
 * @param {string} query - Search query
 */
function handleSearch(query) {
  appState.filters.query = query;
  appState.currentPage = 1;
  updateUrlParams({
    category: appState.filters.category,
    query: query,
    page: 1
  });
  renderSkills();
}

/**
 * Handle page change
 * @param {number} page - Page number
 */
function handlePageChange(page) {
  appState.currentPage = page;
  updateUrlParams({
    category: appState.filters.category,
    query: appState.filters.query,
    page: page
  });
  renderSkills();

  // Scroll to top of skills section
  document.getElementById('skills-section')?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Render skills
 */
function renderSkills() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  // Filter skills
  appState.filteredSkills = filterSkills(appState.allSkills, appState.filters);

  // Check if empty
  if (appState.filteredSkills.length === 0) {
    showEmptyState();
    document.getElementById('pagination-controls').innerHTML = '';
    return;
  }

  // Paginate skills
  const paginated = paginateSkills(
    appState.filteredSkills,
    appState.currentPage,
    appState.perPage
  );

  // Render skill cards
  container.innerHTML = paginated.skills.map(skill => renderSkillCard(skill, appState.categories)).join('');

  // Add click listeners to skill cards
  const skillCards = container.querySelectorAll('.skill-card');
  skillCards.forEach(card => {
    card.addEventListener('click', () => {
      const skillId = card.getAttribute('data-skill-id');
      const skill = appState.allSkills.find(s => s.id === skillId);
      if (skill) {
        showSkillModal(skill, appState.categories);
      }
    });
  });

  // Render pagination
  const paginationContainer = document.getElementById('pagination-controls');
  if (paginationContainer) {
    paginationContainer.innerHTML = renderPagination(
      paginated.currentPage,
      paginated.totalPages
    );

    // Add pagination event listeners
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (paginated.currentPage > 1) {
          handlePageChange(paginated.currentPage - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (paginated.currentPage < paginated.totalPages) {
          handlePageChange(paginated.currentPage + 1);
        }
      });
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

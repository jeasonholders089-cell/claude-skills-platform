// ui-components.js - UI rendering functions

/**
 * Render sidebar with all categories
 * @param {Array} categories - Array of category objects
 * @param {string} activeCategory - Currently active category
 * @returns {string} HTML string for sidebar
 */
export function renderSidebar(categories, activeCategory = 'all') {
  const allActive = activeCategory === 'all' ? 'bg-indigo-50 text-indigo-700 border-indigo-500' : 'text-gray-700 hover:bg-gray-50';

  let categoriesHTML = `
    <button
      class="sidebar-category w-full text-left px-4 py-3 rounded-lg transition-colors border-l-4 border-transparent ${allActive}"
      data-category="all"
    >
      <div class="flex items-center justify-between">
        <span class="font-medium"><i class="fas fa-cube mr-2"></i>所有 Skills</span>
        <span class="text-sm">${categories.reduce((sum, cat) => sum + cat.count, 0)}</span>
      </div>
    </button>
  `;

  categories.forEach(cat => {
    const isActive = activeCategory === cat.name;
    const activeClass = isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-500' : 'text-gray-700 hover:bg-gray-50';

    categoriesHTML += `
      <button
        class="sidebar-category w-full text-left px-4 py-3 rounded-lg transition-colors border-l-4 border-transparent ${activeClass}"
        data-category="${cat.name}"
        title="${cat.nameCn}"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium truncate"><i class="fas ${cat.icon} mr-2"></i>${cat.nameCn}</span>
          <span class="text-sm">${cat.count}</span>
        </div>
      </button>
    `;
  });

  return categoriesHTML;
}

/**
 * Get icon and gradient for a category
 * @param {string} category - Category name
 * @returns {Object} Object with icon and gradient
 */
function getCategoryStyle(category) {
  const styles = {
    'Web & Frontend Development': { icon: 'fa-globe', gradient: 'from-blue-500 to-cyan-600' },
    'Coding Agents & IDEs': { icon: 'fa-code', gradient: 'from-indigo-500 to-purple-600' },
    'Git & GitHub': { icon: 'fa-code-branch', gradient: 'from-gray-700 to-gray-900' },
    'Moltbook': { icon: 'fa-book', gradient: 'from-amber-500 to-orange-600' },
    'DevOps & Cloud': { icon: 'fa-cloud', gradient: 'from-sky-500 to-blue-600' },
    'Browser & Automation': { icon: 'fa-robot', gradient: 'from-purple-500 to-pink-600' },
    'Image & Video Generation': { icon: 'fa-image', gradient: 'from-pink-500 to-rose-600' },
    'Apple Apps & Services': { icon: 'fa-apple', gradient: 'from-gray-600 to-gray-800' },
    'Search & Research': { icon: 'fa-search', gradient: 'from-teal-500 to-cyan-600' },
    'Clawdbot Tools': { icon: 'fa-tools', gradient: 'from-orange-500 to-red-600' },
    'CLI Utilities': { icon: 'fa-terminal', gradient: 'from-green-600 to-emerald-700' },
    'Marketing & Sales': { icon: 'fa-chart-line', gradient: 'from-blue-500 to-indigo-600' },
    'Productivity & Tasks': { icon: 'fa-tasks', gradient: 'from-yellow-500 to-orange-600' },
    'AI & LLMs': { icon: 'fa-brain', gradient: 'from-purple-600 to-violet-700' },
    'Data & Analytics': { icon: 'fa-chart-bar', gradient: 'from-red-500 to-pink-600' },
    'Finance': { icon: 'fa-dollar-sign', gradient: 'from-green-500 to-emerald-600' },
    'Media & Streaming': { icon: 'fa-film', gradient: 'from-red-600 to-rose-700' },
    'Notes & PKM': { icon: 'fa-sticky-note', gradient: 'from-yellow-400 to-amber-500' },
    'iOS & macOS Development': { icon: 'fa-mobile-alt', gradient: 'from-blue-600 to-indigo-700' },
    'Transportation': { icon: 'fa-car', gradient: 'from-blue-500 to-sky-600' },
    'Personal Development': { icon: 'fa-user-graduate', gradient: 'from-indigo-500 to-purple-600' },
    'Health & Fitness': { icon: 'fa-heartbeat', gradient: 'from-red-500 to-pink-600' },
    'Communication': { icon: 'fa-comments', gradient: 'from-blue-500 to-cyan-600' },
    'Speech & Transcription': { icon: 'fa-microphone', gradient: 'from-purple-500 to-pink-600' },
    'Smart Home & IoT': { icon: 'fa-home', gradient: 'from-teal-500 to-cyan-600' },
    'Shopping & E-commerce': { icon: 'fa-shopping-cart', gradient: 'from-orange-500 to-red-600' },
    'Calendar & Scheduling': { icon: 'fa-calendar-alt', gradient: 'from-blue-500 to-indigo-600' },
    'PDF & Documents': { icon: 'fa-file-pdf', gradient: 'from-red-600 to-rose-700' },
    'Self-Hosted & Automation': { icon: 'fa-sync', gradient: 'from-green-500 to-teal-600' },
    'Security & Passwords': { icon: 'fa-lock', gradient: 'from-red-600 to-pink-700' },
    'Gaming': { icon: 'fa-gamepad', gradient: 'from-purple-600 to-pink-700' }
  };
  return styles[category] || { icon: 'fa-cube', gradient: 'from-gray-500 to-slate-600' };
}

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Render a skill card
 * @param {Object} skill - Skill object
 * @returns {string} HTML string for skill card
 */
export function renderSkillCard(skill) {
  const style = getCategoryStyle(skill.category);
  const description = truncateText(skill.descriptionCn || skill.description, 100);

  return `
    <div class="bg-white rounded-lg shadow-md p-6 card-hover cursor-pointer skill-card" data-skill-id="${skill.id}">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-br ${style.gradient} rounded-lg flex items-center justify-center">
            <i class="fas ${style.icon} text-white text-xl"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">${skill.name}</h3>
            <p class="text-sm text-gray-500">by @${skill.author}</p>
          </div>
        </div>
        <span class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">${skill.category}</span>
      </div>
      <p class="text-gray-600 text-sm mb-4">${description}</p>
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center space-x-4">
          <span class="flex items-center text-gray-500">
            <i class="fab fa-github mr-1"></i> GitHub
          </span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render pagination controls
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @returns {string} HTML string for pagination
 */
export function renderPagination(currentPage, totalPages) {
  if (totalPages <= 1) return '';

  const prevDisabled = currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700';
  const nextDisabled = currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700';

  return `
    <div class="flex items-center justify-center space-x-4">
      <button
        id="prev-page"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg ${prevDisabled} transition-colors"
        ${currentPage === 1 ? 'disabled' : ''}
      >
        <i class="fas fa-chevron-left mr-2"></i>上一页
      </button>
      <span class="text-gray-700">
        第 <span class="font-semibold">${currentPage}</span> 页，共 <span class="font-semibold">${totalPages}</span> 页
      </span>
      <button
        id="next-page"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg ${nextDisabled} transition-colors"
        ${currentPage === totalPages ? 'disabled' : ''}
      >
        下一页<i class="fas fa-chevron-right ml-2"></i>
      </button>
    </div>
  `;
}

/**
 * Show skill detail modal
 * @param {Object} skill - Skill object
 */
export function showSkillModal(skill) {
  const style = getCategoryStyle(skill.category);

  // Use Chinese description if available, otherwise use English
  const description = skill.descriptionCn || skill.description;

  const modalHTML = `
    <div id="skill-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <!-- Header -->
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-gradient-to-br ${style.gradient} rounded-lg flex items-center justify-center">
                <i class="fas ${style.icon} text-white text-2xl"></i>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">${skill.name}</h2>
                <p class="text-gray-500">by @${skill.author}</p>
              </div>
            </div>
            <button id="close-modal" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-2xl"></i>
            </button>
          </div>

          <!-- Category Badge -->
          <div class="mb-4">
            <span class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">${skill.category}</span>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">描述</h3>
            <p class="text-gray-700 leading-relaxed">${description}</p>
          </div>

          <!-- Install Command -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">安装命令</h3>
            <div class="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
              <code class="text-sm text-gray-800">${skill.installCommand}</code>
              <button id="copy-command" class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm">
                <i class="fas fa-copy mr-1"></i>复制
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-4">
            <a
              href="${skill.githubUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-center"
            >
              <i class="fab fa-github mr-2"></i>在 GitHub 查看
            </a>
            <button
              id="close-modal-btn"
              class="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById('skill-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add event listeners
  const modal = document.getElementById('skill-modal');
  const closeBtn = document.getElementById('close-modal');
  const closeBtnBottom = document.getElementById('close-modal-btn');
  const copyBtn = document.getElementById('copy-command');

  const closeModal = () => modal.remove();

  closeBtn.addEventListener('click', closeModal);
  closeBtnBottom.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC key to close
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  // Copy command
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(skill.installCommand);
      copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i>已复制';
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy mr-1"></i>复制';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
}

/**
 * Update category counts in the UI
 * @param {Object} counts - Object with category names as keys and counts as values
 */
export function updateCategoryCounts(counts) {
  const categoryCards = document.querySelectorAll('[data-category]');
  categoryCards.forEach(card => {
    const category = card.getAttribute('data-category');
    const countElement = card.querySelector('.text-2xl');
    if (countElement && counts[category]) {
      countElement.textContent = counts[category];
    }
  });
}

/**
 * Show loading spinner
 */
export function showLoading() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    spinner.classList.remove('hidden');
  }
}

/**
 * Hide loading spinner
 */
export function hideLoading() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    spinner.classList.add('hidden');
  }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
export function showError(message) {
  const container = document.getElementById('skills-container');
  if (container) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <p class="text-gray-700 text-lg mb-4">${message}</p>
        <button id="retry-btn" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          重试
        </button>
      </div>
    `;
  }
}

/**
 * Show empty state
 * @param {string} message - Message to display
 */
export function showEmptyState(message = '未找到相关 Skill') {
  const container = document.getElementById('skills-container');
  if (container) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-search text-gray-400 text-5xl mb-4"></i>
        <p class="text-gray-600 text-lg">${message}</p>
      </div>
    `;
  }
}

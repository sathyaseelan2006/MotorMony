// ==================== STATE MANAGEMENT ====================
let allCars = [];
let filteredCars = [];
let displayedCars = [];
let currentSort = 'score';
let currentView = 'cards'; // 'cards', 'table', 'comparison'
let comparisonCars = [];
let radarChart = null;
let barChart = null;
let carsPerPage = 20;
let currentPage = 1;
let totalCarsAvailable = 0;
let selectedYear = 'all';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initializeCharacterCounter();
  initializeScrollEffects();
  initializeNavbar();
  initializeScrollToTop();
  console.log('✨ MotorMony initialized successfully!');
});

// ==================== MOBILE MENU ====================
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  mobileMenu.classList.toggle('active');
}

// ==================== FILL QUERY HELPER ====================
function fillQuery(text) {
  const queryInput = document.getElementById('queryInput');
  queryInput.value = text;
  queryInput.focus();
  // Auto-resize textarea
  queryInput.style.height = 'auto';
  queryInput.style.height = queryInput.scrollHeight + 'px';
}

// ==================== CHARACTER COUNTER ====================
function initializeCharacterCounter() {
  const queryInput = document.getElementById('queryInput');
  const charCount = document.getElementById('charCount');

  if (queryInput && charCount) {
    queryInput.addEventListener('input', () => {
      const count = queryInput.value.length;
      charCount.textContent = count;
      
      // Auto-resize textarea
      queryInput.style.height = 'auto';
      queryInput.style.height = Math.min(queryInput.scrollHeight, 120) + 'px';
    });

    // Limit to 500 characters
    queryInput.addEventListener('keydown', (e) => {
      if (queryInput.value.length >= 500 && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
        e.preventDefault();
      }
    });
  }
}

// ==================== NAVBAR SCROLL EFFECT ====================
function initializeNavbar() {
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ==================== SCROLL TO TOP ====================
function initializeScrollToTop() {
  const scrollBtn = document.getElementById('scrollToTop');
  
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    });
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// ==================== SCROLL EFFECTS ====================
function initializeScrollEffects() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe feature cards and step cards
  document.querySelectorAll('.feature-card, .step-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(card);
  });
}

// ==================== API FUNCTIONS ====================
async function fetchRecommendations(query, topK = 10) {
  try {
    const response = await fetch('http://127.0.0.1:5000/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        top_k: topK
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      results: data.results,
      carpilotSuggestion: data.carpilot_suggestion
    };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}

// ==================== CAR IMAGES ====================
async function fetchCarImage(carName, brand) {
  // Using Unsplash API for car images (free tier)
  const query = `${brand} ${carName} car`;
  try {
    const response = await fetch(`https://source.unsplash.com/400x300/?${encodeURIComponent(query)}`);
    return response.url;
  } catch (error) {
    console.error('Error fetching car image:', error);
    return null;
  }
}

function getCarImagePlaceholder(carName) {
  // Return a placeholder emoji based on car type
  const name = carName.toLowerCase();
  if (name.includes('suv')) return '🚙';
  if (name.includes('sedan')) return '🚗';
  if (name.includes('hatchback')) return '🚗';
  if (name.includes('electric') || name.includes('ev')) return '⚡';
  if (name.includes('sports')) return '🏎️';
  if (name.includes('mpv')) return '🚐';
  return '🚗';
}

// ==================== NEWS ARTICLES ====================
async function fetchCarArticles(carName, brand) {
  // Simulated articles - in production, you would use a news API like NewsAPI
  const articles = [
    {
      title: `${carName} Review: Everything You Need to Know`,
      description: `Comprehensive review of the ${brand} ${carName} covering performance, features, and value for money.`,
      source: 'CarDekho',
      date: '2 days ago',
      url: `https://www.cardekho.com/search?q=${encodeURIComponent(carName)}`,
      image: `https://source.unsplash.com/400x250/?${encodeURIComponent(brand + ' ' + carName)}`
    },
    {
      title: `${brand} ${carName} - Pros and Cons`,
      description: `Detailed analysis of the advantages and disadvantages of owning a ${carName}.`,
      source: 'Team-BHP',
      date: '5 days ago',
      url: `https://www.team-bhp.com/forum/search.php?searchid=${encodeURIComponent(carName)}`,
      image: `https://source.unsplash.com/400x250/?automobile,${encodeURIComponent(brand)}`
    },
    {
      title: `${carName} vs Competitors: Comparison`,
      description: `How does the ${brand} ${carName} stack up against its rivals in the segment?`,
      source: 'AutoCar India',
      date: '1 week ago',
      url: `https://www.autocarindia.com/search?q=${encodeURIComponent(carName)}`,
      image: `https://source.unsplash.com/400x250/?car,comparison`
    }
  ];

  return articles;
}

// ==================== SMART FEATURE DETECTION ====================
let currentQueryIntent = '';

function detectQueryIntent(query) {
  const q = query.toLowerCase();

  if (q.includes('family') || q.includes('kids') || q.includes('children') || q.includes('safe')) {
    return 'family';
  } else if (q.includes('performance') || q.includes('sport') || q.includes('fast') || q.includes('power')) {
    return 'performance';
  } else if (q.includes('budget') || q.includes('cheap') || q.includes('affordable') || q.includes('under')) {
    return 'budget';
  } else if (q.includes('electric') || q.includes('ev') || q.includes('hybrid') || q.includes('eco')) {
    return 'eco';
  } else if (q.includes('luxury') || q.includes('premium') || q.includes('comfort')) {
    return 'luxury';
  } else if (q.includes('suv') || q.includes('adventure') || q.includes('off-road')) {
    return 'adventure';
  }
  return 'general';
}

function getRelevantFeatures(intent) {
  const featureMap = {
    family: ['safety_rating', 'seats', 'mileage_kmpl', 'price_min_lakh', 'boot_space_l'],
    performance: ['power_bhp', 'acceleration_0_100', 'top_speed_kmph', 'transmission'],
    budget: ['price_min_lakh', 'mileage_kmpl', 'maintenance_cost_year', 'resale_value_5yr'],
    eco: ['mileage_kmpl', 'fuel_type', 'ev_range_km', 'emissions'],
    luxury: ['safety_rating', 'comfort', 'features', 'brand'],
    adventure: ['ground_clearance_mm', 'power_bhp', 'body_type', 'seats'],
    general: ['price_min_lakh', 'mileage_kmpl', 'safety_rating', 'power_bhp']
  };
  return featureMap[intent] || featureMap.general;
}

function generatePersonalizedOverview(car, intent) {
  const overviews = {
    family: `Perfect for families! With a ${car.safety_rating || 'good'}-star safety rating and ${car.seats} comfortable seats, the ${car.name} keeps your loved ones safe. Great ${car.mileage_kmpl} km/l mileage means more road trips without breaking the bank.`,

    performance: `Built for thrill-seekers! This ${car.name} packs ${car.power_bhp} BHP of pure power, reaching 0-100 km/h in just ${car.acceleration_0_100 || 'impressive'} seconds. ${car.transmission} transmission puts you in complete control.`,

    budget: `Smart choice for value! At just ₹${car.price_min_lakh}L, the ${car.name} delivers excellent ${car.mileage_kmpl} km/l efficiency. Low maintenance costs and strong ${car.resale_value_5yr}% resale value make it a wise investment.`,

    eco: car.fuel_type === 'EV' ?
      `Green driving champion! This electric ${car.name} offers ${car.ev_range_km || 'excellent'} km range with zero emissions. Save money on fuel while saving the planet.` :
      `Eco-conscious choice! Impressive ${car.mileage_kmpl} km/l efficiency means fewer stops at the pump. ${car.fuel_type} engine balances performance with environmental responsibility.`,

    luxury: `Premium experience awaits! The ${car.name} combines ${car.brand}'s legendary quality with ${car.safety_rating}-star safety. Every journey becomes a first-class experience with refined comfort and cutting-edge features.`,

    adventure: `Adventure ready! With ${car.ground_clearance_mm}mm ground clearance and ${car.power_bhp} BHP, this ${car.body_type} conquers any terrain. ${car.seats} seats mean you can bring the whole crew along.`,

    general: `Well-rounded performer! The ${car.name} offers ${car.power_bhp} BHP power, ${car.mileage_kmpl} km/l efficiency, and ${car.safety_rating}-star safety at ₹${car.price_min_lakh}L. A solid choice for everyday driving.`
  };

  return overviews[intent] || overviews.general;
}

// ==================== UI RENDERING ====================
function showLoading() {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p style="margin-top: 1rem; font-size: 1.125rem; color: var(--color-text-secondary);">
        <i class="fas fa-magic"></i> AI is analyzing your preferences...
      </p>
    </div>
  `;
  
  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(message) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3>Oops! Something went wrong</h3>
      <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">${message}</p>
      <p style="color: var(--color-text-muted); font-size: 0.875rem;">
        Make sure the Flask backend is running on http://127.0.0.1:5000
      </p>
    </div>
  `;
}

function showEmptyState() {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-search"></i>
      </div>
      <h3>No cars found</h3>
      <p>Try adjusting your search criteria or using different keywords</p>
    </div>
  `;
}

function getBadgeHTML(car) {
  let badges = '';
  if (car.price_min_lakh && car.price_min_lakh < 10) {
    badges += '<span class="badge badge-budget">💰 Budget</span>';
  }
  if (car.price_min_lakh && car.price_min_lakh > 50) {
    badges += '<span class="badge badge-premium">👑 Premium</span>';
  }
  if (car.name && car.name.toLowerCase().includes('ev')) {
    badges += '<span class="badge badge-ev">⚡ Electric</span>';
  }
  return badges;
}

function renderTableView(cars) {
  if (!cars || cars.length === 0) {
    showEmptyState();
    return;
  }

  const tableHTML = `
    <div class="table-container">
      <table class="car-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Brand</th>
            <th>Score</th>
            <th>Price (₹L)</th>
            <th>Seats</th>
            <th>Power (BHP)</th>
            <th>Mileage</th>
            <th>Safety</th>
            <th>Compare</th>
          </tr>
        </thead>
        <tbody>
          ${cars.map((car, index) => `
            <tr>
              <td class="rank-cell">${index + 1}</td>
              <td class="name-cell">${car.name}</td>
              <td class="brand-cell">${car.brand}</td>
              <td class="score-cell">${car.final_score.toFixed(3)}</td>
              <td class="price-cell">₹${car.price_min_lakh}</td>
              <td>${car.seats}</td>
              <td>${car.power_bhp || 'N/A'}</td>
              <td>${car.mileage_kmpl || 'N/A'} km/l</td>
              <td>${car.safety_rating || 'N/A'} ⭐</td>
              <td>
                <input 
                  type="checkbox" 
                  class="compare-checkbox" 
                  onchange="toggleComparison(${index}, this.checked)"
                  ${comparisonCars.some(c => c.name === car.name) ? 'checked' : ''}
                />
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  return tableHTML;
}

function renderResults(cars, isLoadMore = false) {
  const resultsContainer = document.getElementById('results');

  if (!cars || cars.length === 0) {
    showEmptyState();
    return;
  }

  const showingCount = currentPage * carsPerPage;
  const hasMore = showingCount < filteredCars.length;

  const resultsHTML = `
    <div class="results-header">
      <div class="results-title-wrapper">
        <h2 class="results-title">🎯 Top Recommendations</h2>
        <p class="results-count">Showing ${Math.min(showingCount, filteredCars.length)} of ${filteredCars.length} cars</p>
        <button class="score-info-badge" onclick="showScoreInfoPopup()" title="Learn how scores are calculated">
          <i class="fas fa-question-circle"></i>
          <span>How are scores calculated?</span>
        </button>
      </div>
      <div style="display: flex; gap: var(--spacing-md); align-items: center; flex-wrap: wrap;">
        <div class="view-toggle">
          <button class="view-toggle-btn ${currentView === 'cards' ? 'active' : ''}" onclick="switchView('cards')">
            <span>🎴</span> Cards
          </button>
          <button class="view-toggle-btn ${currentView === 'table' ? 'active' : ''}" onclick="switchView('table')">
            <span>📊</span> Table
          </button>
        </div>
        <div class="sort-controls">
          <span class="sort-label">Sort by:</span>
          <select id="sortSelect" class="filter-select" onchange="handleSort(this.value)">
            <option value="score">Best Match</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name (A-Z)</option>
            <option value="year-new">Year: Newest First</option>
            <option value="year-old">Year: Oldest First</option>
          </select>
        </div>
        <div class="filter-controls">
          <span class="filter-label">
            <i class="fas fa-filter"></i> Filter Year:
          </span>
          <select id="yearFilter" class="filter-select" onchange="handleYearFilter(this.value)">
            <option value="all">All Years</option>
            ${getYearOptions()}
          </select>
        </div>
      </div>
    </div>

    ${currentView === 'table' ? renderTableView(cars) : `
      <div class="car-grid" id="carGrid">
        ${cars.map((car, index) => renderCarCard(car, index)).join('')}
      </div>
    `}
    
    ${hasMore ? `
      <div class="load-more-container">
        <button class="btn-load-more" onclick="loadMoreCars()">
          <i class="fas fa-chevron-down"></i>
          <span>Load More Cars (${filteredCars.length - showingCount} remaining)</span>
        </button>
      </div>
    ` : `
      <div class="all-loaded-message">
        <i class="fas fa-check-circle"></i>
        <span>All ${filteredCars.length} cars displayed</span>
      </div>
    `}
  `;

  if (isLoadMore) {
    // Append new cars to existing grid
    const carGrid = document.getElementById('carGrid');
    if (carGrid) {
      const startIndex = (currentPage - 1) * carsPerPage;
      const newCars = filteredCars.slice(startIndex, startIndex + carsPerPage);
      carGrid.innerHTML += newCars.map((car, index) => renderCarCard(car, startIndex + index)).join('');
      
      // Update load more button
      const loadMoreContainer = document.querySelector('.load-more-container');
      if (loadMoreContainer) {
        if (hasMore) {
          loadMoreContainer.innerHTML = `
            <button class="btn-load-more" onclick="loadMoreCars()">
              <i class="fas fa-chevron-down"></i>
              <span>Load More Cars (${filteredCars.length - showingCount} remaining)</span>
            </button>
          `;
        } else {
          loadMoreContainer.outerHTML = `
            <div class="all-loaded-message">
              <i class="fas fa-check-circle"></i>
              <span>All ${filteredCars.length} cars displayed</span>
            </div>
          `;
        }
      }
    }
  } else {
    resultsContainer.innerHTML += resultsHTML;
  }
}

// ==================== VIEW SWITCHING ====================
function switchView(view) {
  currentView = view;
  renderResults(displayedCars, false);
}

// ==================== COMPARISON ====================
function addToComparison(index) {
  const car = filteredCars[index];
  if (comparisonCars.length >= 4) {
    alert('You can compare up to 4 cars at a time');
    return;
  }
  if (!comparisonCars.some(c => c.name === car.name)) {
    comparisonCars.push(car);
    updateComparisonPanel();
  }
}

function toggleComparison(index, checked) {
  const car = filteredCars[index];
  if (checked) {
    if (comparisonCars.length >= 4) {
      alert('You can compare up to 4 cars at a time');
      event.target.checked = false;
      return;
    }
    comparisonCars.push(car);
  } else {
    comparisonCars = comparisonCars.filter(c => c.name !== car.name);
  }
  updateComparisonPanel();
}

function removeFromComparison(index) {
  comparisonCars.splice(index, 1);
  updateComparisonPanel();
  // Refresh current view to update checkboxes
  renderResults(filteredCars);
}

function updateComparisonPanel() {
  const panel = document.getElementById('comparisonPanel');
  if (!panel) return;

  if (comparisonCars.length === 0) {
    panel.classList.remove('active');
    return;
  }

  panel.classList.add('active');

  const comparisonGrid = panel.querySelector('.comparison-grid');
  comparisonGrid.innerHTML = comparisonCars.map((car, index) => `
    <div class="comparison-card">
      <button class="comparison-remove" onclick="removeFromComparison(${index})">×</button>
      <div class="comparison-car-name">${car.name}</div>
      <div class="comparison-car-details">
        <div class="comparison-detail-row">
          <span class="comparison-detail-label">Brand:</span>
          <span class="comparison-detail-value">${car.brand}</span>
        </div>
        <div class="comparison-detail-row">
          <span class="comparison-detail-label">Score:</span>
          <span class="comparison-detail-value">${car.final_score.toFixed(3)}</span>
        </div>
        <div class="comparison-detail-row">
          <span class="comparison-detail-label">Price:</span>
          <span class="comparison-detail-value">₹${car.price_min_lakh}L</span>
        </div>
        <div class="comparison-detail-row">
          <span class="comparison-detail-label">Seats:</span>
          <span class="comparison-detail-value">${car.seats}</span>
        </div>
        <div class="comparison-detail-row">
          <span class="comparison-detail-label">Power:</span>
          <span class="comparison-detail-value">${car.power_bhp || 'N/A'} BHP</span>
        </div>
        <div class="comparison-detail-row">
          <span class="comparison-detail-label">Mileage:</span>
          <span class="comparison-detail-value">${car.mileage_kmpl || 'N/A'} km/l</span>
        </div>
      </div>
    </div>
    `).join('');
}

function closeComparison() {
  const panel = document.getElementById('comparisonPanel');
  panel.classList.remove('active');
}

// ==================== LOAD MORE ====================
function loadMoreCars() {
  currentPage++;
  const startIndex = (currentPage - 1) * carsPerPage;
  const endIndex = currentPage * carsPerPage;
  displayedCars = filteredCars.slice(0, endIndex);
  renderResults(displayedCars, true);
  
  // Smooth scroll to new content
  setTimeout(() => {
    const carGrid = document.getElementById('carGrid');
    if (carGrid) {
      const newCards = carGrid.querySelectorAll('.car-card');
      if (newCards.length > startIndex) {
        newCards[startIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, 100);
}

// ==================== YEAR FILTER ====================
function getYearOptions() {
  if (!allCars || allCars.length === 0) return '';
  
  const years = [...new Set(allCars.map(car => car.year).filter(year => year))];
  years.sort((a, b) => b - a); // Newest first
  
  return years.map(year => `<option value="${year}">${year}</option>`).join('');
}

function handleYearFilter(year) {
  selectedYear = year;
  
  if (year === 'all') {
    filteredCars = [...allCars];
  } else {
    filteredCars = allCars.filter(car => car.year && car.year.toString() === year);
  }
  
  // Re-apply current sort
  if (currentSort && currentSort !== 'score') {
    handleSort(currentSort);
  } else {
    currentPage = 1;
    displayedCars = filteredCars.slice(0, carsPerPage);
    renderResults(displayedCars, false);
  }
}

// ==================== SORTING ====================
function handleSort(sortType) {
  currentSort = sortType;
  let sortedCars = [...filteredCars];

  switch (sortType) {
    case 'score':
      sortedCars.sort((a, b) => b.final_score - a.final_score);
      break;
    case 'price-low':
      sortedCars.sort((a, b) => a.price_min_lakh - b.price_min_lakh);
      break;
    case 'price-high':
      sortedCars.sort((a, b) => b.price_min_lakh - a.price_min_lakh);
      break;
    case 'name':
      sortedCars.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'year-new':
      sortedCars.sort((a, b) => (b.year || 0) - (a.year || 0));
      break;
    case 'year-old':
      sortedCars.sort((a, b) => (a.year || 0) - (b.year || 0));
      break;
  }

  filteredCars = sortedCars;
  currentPage = 1;
  displayedCars = filteredCars.slice(0, carsPerPage);
  renderResults(displayedCars, false);
}

// ==================== CAR DETAILS MODAL ====================
function showCarDetails(index) {
  const car = filteredCars[index];
  const carEmoji = getCarImagePlaceholder(car.name);
  
  const modalContent = `
    <div class="modal-header">
      <div class="modal-car-image">
        ${carEmoji}
      </div>
      <div class="modal-car-brand">${car.brand}</div>
      <h2 class="modal-car-name">${car.name}</h2>
      <div class="modal-car-score">
        <i class="fas fa-star"></i>
        <span>Match Score: ${car.final_score.toFixed(3)}</span>
        <button class="score-info-btn" onclick="event.stopPropagation(); toggleScoreInfo()" title="How is this score calculated?">
          <i class="fas fa-info-circle"></i>
        </button>
      </div>
    </div>
    
    <div class="score-explanation" id="scoreExplanation" style="display: none;">
      <div class="score-explanation-header">
        <i class="fas fa-calculator"></i>
        <h3>How Match Score Works</h3>
      </div>
      <p class="score-explanation-intro">
        Our AI analyzes your query and calculates a personalized match score based on what matters most to you.
      </p>
      <div class="score-factors">
        <div class="score-factor">
          <div class="factor-icon"><i class="fas fa-shield-alt"></i></div>
          <div class="factor-content">
            <div class="factor-name">Safety Rating</div>
            <div class="factor-desc">Higher ratings mean better crash protection and safety features</div>
          </div>
        </div>
        <div class="score-factor">
          <div class="factor-icon"><i class="fas fa-gas-pump"></i></div>
          <div class="factor-content">
            <div class="factor-name">Fuel Efficiency</div>
            <div class="factor-desc">Better mileage saves money and reduces environmental impact</div>
          </div>
        </div>
        <div class="score-factor">
          <div class="factor-icon"><i class="fas fa-rupee-sign"></i></div>
          <div class="factor-content">
            <div class="factor-name">Price Value</div>
            <div class="factor-desc">Lower prices within your budget get higher scores</div>
          </div>
        </div>
        <div class="score-factor">
          <div class="factor-icon"><i class="fas fa-bolt"></i></div>
          <div class="factor-content">
            <div class="factor-name">Power & Performance</div>
            <div class="factor-desc">Engine power for acceleration and highway driving</div>
          </div>
        </div>
        <div class="score-factor">
          <div class="factor-icon"><i class="fas fa-chart-line"></i></div>
          <div class="factor-content">
            <div class="factor-name">Resale Value</div>
            <div class="factor-desc">Expected value retention after 5 years of ownership</div>
          </div>
        </div>
      </div>
      <div class="score-explanation-note">
        <i class="fas fa-lightbulb"></i>
        <span><strong>Pro Tip:</strong> The weight of each factor automatically adjusts based on your search query. Family-focused searches prioritize safety, while performance queries emphasize power!</span>
      </div>
    </div>
    
    <div class="modal-specs-grid">
      <div class="modal-spec-card">
        <div class="modal-spec-icon">
          <i class="fas fa-rupee-sign"></i>
        </div>
        <div class="modal-spec-label">Starting Price</div>
        <div class="modal-spec-value">₹${car.price_min_lakh}L</div>
      </div>
      
      <div class="modal-spec-card">
        <div class="modal-spec-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="modal-spec-label">Seating</div>
        <div class="modal-spec-value">${car.seats} Seats</div>
      </div>
      
      <div class="modal-spec-card">
        <div class="modal-spec-icon">
          <i class="fas fa-bolt"></i>
        </div>
        <div class="modal-spec-label">Power</div>
        <div class="modal-spec-value">${car.power_bhp ? Math.round(car.power_bhp) + ' BHP' : 'N/A'}</div>
      </div>
      
      <div class="modal-spec-card">
        <div class="modal-spec-icon">
          <i class="fas fa-gas-pump"></i>
        </div>
        <div class="modal-spec-label">Mileage</div>
        <div class="modal-spec-value">${car.mileage_kmpl ? car.mileage_kmpl + ' km/l' : 'N/A'}</div>
      </div>
      
      <div class="modal-spec-card">
        <div class="modal-spec-icon">
          <i class="fas fa-shield-alt"></i>
        </div>
        <div class="modal-spec-label">Safety Rating</div>
        <div class="modal-spec-value">${car.safety_rating ? car.safety_rating + ' ⭐' : 'N/A'}</div>
      </div>
      
      <div class="modal-spec-card">
        <div class="modal-spec-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="modal-spec-label">Resale Value</div>
        <div class="modal-spec-value">${car.resale_value_5yr ? Math.round(car.resale_value_5yr) + '%' : 'N/A'}</div>
      </div>
    </div>
    
    <div class="modal-details-section">
      <h3 class="modal-section-title">
        <i class="fas fa-info-circle"></i>
        Vehicle Details
      </h3>
      <ul class="modal-details-list">
        <li class="modal-detail-item">
          <span class="modal-detail-label">
            <i class="fas fa-car"></i> Body Type
          </span>
          <span class="modal-detail-value">${car.body_type || 'N/A'}</span>
        </li>
        <li class="modal-detail-item">
          <span class="modal-detail-label">
            <i class="fas fa-oil-can"></i> Fuel Type
          </span>
          <span class="modal-detail-value">${car.fuel_type || 'N/A'}</span>
        </li>
        <li class="modal-detail-item">
          <span class="modal-detail-label">
            <i class="fas fa-tag"></i> Brand
          </span>
          <span class="modal-detail-value">${car.brand}</span>
        </li>
        ${car.year ? `
        <li class="modal-detail-item">
          <span class="modal-detail-label">
            <i class="fas fa-calendar"></i> Model Year
          </span>
          <span class="modal-detail-value">${car.year}</span>
        </li>
        ` : ''}
      </ul>
    </div>
    
    ${car.reason ? `
    <div class="modal-details-section">
      <h3 class="modal-section-title">
        <i class="fas fa-lightbulb"></i>
        Why This Car?
      </h3>
      <div style="padding: 1rem; background: rgba(102, 126, 234, 0.1); border-radius: var(--radius-md); border: 1px solid rgba(102, 126, 234, 0.2);">
        <p style="color: var(--color-text-secondary); line-height: 1.8;">
          ${car.reason.split(';').map(r => `<span style="display: block; margin: 0.5rem 0;">• ${r.trim()}</span>`).join('')}
        </p>
      </div>
    </div>
    ` : ''}
    
    <div class="modal-actions">
      <button class="btn-modal-secondary" onclick="addToComparison(${index}); closeCarDetails();">
        <i class="fas fa-plus"></i> Add to Compare
      </button>
      <button class="btn-modal-primary" onclick="alert('Contact dealer feature coming soon!')">
        <i class="fas fa-phone"></i> Contact Dealer
      </button>
    </div>
  `;
  
  document.getElementById('carDetailsContent').innerHTML = modalContent;
  document.getElementById('carDetailsModal').classList.add('active');
  
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
}

function closeCarDetails() {
  document.getElementById('carDetailsModal').classList.remove('active');
  document.body.style.overflow = 'auto';
  // Reset score explanation visibility
  const scoreExplanation = document.getElementById('scoreExplanation');
  if (scoreExplanation) {
    scoreExplanation.style.display = 'none';
  }
}

function toggleScoreInfo() {
  const scoreExplanation = document.getElementById('scoreExplanation');
  if (scoreExplanation) {
    if (scoreExplanation.style.display === 'none') {
      scoreExplanation.style.display = 'block';
      // Smooth scroll to explanation
      setTimeout(() => {
        scoreExplanation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } else {
      scoreExplanation.style.display = 'none';
    }
  }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('carDetailsModal');
  if (e.target === modal) {
    closeCarDetails();
  }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('carDetailsModal');
    if (modal && modal.classList.contains('active')) {
      closeCarDetails();
    }
  }
});

// ==================== CARPILOT SUGGESTION ====================
function renderCarPilotSuggestion(suggestion, query) {
  const resultsContainer = document.getElementById('results');
  
  const carpilotHTML = `
    <div class="carpilot-suggestion" id="carpilotSuggestion">
      <div class="carpilot-header">
        <div class="carpilot-badge">
          <i class="fas fa-robot"></i>
          <span>CarPilot AI Recommendation</span>
        </div>
        <button class="carpilot-close" onclick="document.getElementById('carpilotSuggestion').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="carpilot-content">
        <div class="carpilot-car-info">
          <div class="carpilot-car-header">
            <div class="carpilot-car-icon">
              ${getCarImagePlaceholder(suggestion.car_name)}
            </div>
            <div class="carpilot-car-details">
              <div class="carpilot-car-brand">${suggestion.brand}</div>
              <h3 class="carpilot-car-name">${suggestion.car_name}</h3>
              <div class="carpilot-match-score">
                <i class="fas fa-star"></i>
                <span>${(suggestion.score * 100).toFixed(1)}% Match</span>
              </div>
            </div>
          </div>
          
          <div class="carpilot-specs-mini">
            <div class="carpilot-spec-mini">
              <i class="fas fa-rupee-sign"></i>
              <span>${suggestion.key_specs.price}</span>
            </div>
            <div class="carpilot-spec-mini">
              <i class="fas fa-users"></i>
              <span>${suggestion.key_specs.seats} Seats</span>
            </div>
            <div class="carpilot-spec-mini">
              <i class="fas fa-bolt"></i>
              <span>${suggestion.key_specs.power}</span>
            </div>
            <div class="carpilot-spec-mini">
              <i class="fas fa-gas-pump"></i>
              <span>${suggestion.key_specs.mileage}</span>
            </div>
            <div class="carpilot-spec-mini">
              <i class="fas fa-shield-alt"></i>
              <span>${suggestion.key_specs.safety}</span>
            </div>
          </div>
        </div>
        
        <div class="carpilot-analysis">
          <div class="carpilot-summary">
            <i class="fas fa-lightbulb"></i>
            <p>${suggestion.summary}</p>
          </div>
          
          <div class="carpilot-reasons">
            <h4><i class="fas fa-check-circle"></i> Why This Car?</h4>
            <ul class="carpilot-reasons-list">
              ${suggestion.reasons.map(reason => {
                // Extract emoji and text
                const parts = reason.split('**');
                if (parts.length >= 3) {
                  return `<li><strong>${parts[1]}</strong>${parts[2]}</li>`;
                }
                return `<li>${reason}</li>`;
              }).join('')}
            </ul>
          </div>
          
          <div class="carpilot-cta">
            <button class="btn-carpilot-primary" onclick="showCarDetails(0)">
              <i class="fas fa-info-circle"></i>
              View Full Details
            </button>
            <button class="btn-carpilot-secondary" onclick="addToComparison(0)">
              <i class="fas fa-plus"></i>
              Add to Compare
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  resultsContainer.innerHTML = carpilotHTML;
}

// ==================== SEARCH HANDLER ====================
async function handleSearch(event) {
  event.preventDefault();

  const queryInput = document.getElementById('queryInput');
  const query = queryInput.value.trim();

  if (!query) {
    showError('Please enter a search query to find your perfect car');
    return;
  }

  // Detect query intent for smart feature highlighting
  currentQueryIntent = detectQueryIntent(query);
  console.log('🎯 Detected intent:', currentQueryIntent);

  showLoading();

  try {
    const data = await fetchRecommendations(query, 100); // Request 100 cars initially
    const cars = data.results;
    const carpilotSuggestion = data.carpilotSuggestion;
    totalCarsAvailable = cars.length;
    
    if (!cars || cars.length === 0) {
      showEmptyState();
      return;
    }
    
    allCars = cars;
    filteredCars = cars;
    currentPage = 1;
    
    // Show CarPilot suggestion first
    if (carpilotSuggestion) {
      renderCarPilotSuggestion(carpilotSuggestion, query);
    }
    
    displayedCars = filteredCars.slice(0, carsPerPage);
    renderResults(displayedCars, false);
    
    // Show success notification
    console.log(`✅ Found ${cars.length} cars matching your criteria`);
  } catch (error) {
    console.error('❌ Error:', error);
    showError(error.message || 'Failed to fetch recommendations. Please ensure the backend is running.');
  }
}

// ==================== ENHANCED RENDER FUNCTIONS ====================
function renderCarCard(car, index) {
  const carEmoji = getCarImagePlaceholder(car.name);

  return `
    <div class="car-card" style="animation-delay: ${index * 0.05}s">
      <div class="car-image">
        <div class="car-rank">#${index + 1}</div>
        <span style="font-size: 4rem;">${carEmoji}</span>
      </div>
      <div class="car-content">
        <div class="car-header">
          <div class="car-brand">${car.brand}</div>
          <h3 class="car-name">${car.name}</h3>
          <div class="car-score">
            <i class="fas fa-star"></i>
            <span>${car.final_score.toFixed(3)}</span>
          </div>
        </div>

        <div class="car-specs">
          <div class="car-spec">
            <div class="spec-icon">
              <i class="fas fa-rupee-sign"></i>
            </div>
            <div class="spec-content">
              <div class="spec-label">Price</div>
              <div class="spec-value">₹${car.price_min_lakh}L</div>
            </div>
          </div>
          <div class="car-spec">
            <div class="spec-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="spec-content">
              <div class="spec-label">Seats</div>
              <div class="spec-value">${car.seats}</div>
            </div>
          </div>
          <div class="car-spec">
            <div class="spec-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="spec-content">
              <div class="spec-label">Power</div>
              <div class="spec-value">${car.power_bhp ? Math.round(car.power_bhp) + ' BHP' : 'N/A'}</div>
            </div>
          </div>
          <div class="car-spec">
            <div class="spec-icon">
              <i class="fas fa-gas-pump"></i>
            </div>
            <div class="spec-content">
              <div class="spec-label">Mileage</div>
              <div class="spec-value">${car.mileage_kmpl ? car.mileage_kmpl + ' km/l' : 'N/A'}</div>
            </div>
          </div>
          <div class="car-spec">
            <div class="spec-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <div class="spec-content">
              <div class="spec-label">Safety</div>
              <div class="spec-value">${car.safety_rating ? car.safety_rating + ' ⭐' : 'N/A'}</div>
            </div>
          </div>
          <div class="car-spec">
            <div class="spec-icon">
              <i class="fas fa-car"></i>
            </div>
            <div class="spec-content">
              <div class="spec-label">Body Type</div>
              <div class="spec-value">${car.body_type || 'N/A'}</div>
            </div>
          </div>
          <div class="car-spec">
            <div class="spec-icon">
              <i class="fas fa-oil-can"></i>
            </div>
            <div class="spec-content">
              <div class="spec-label">Fuel</div>
              <div class="spec-value">${car.fuel_type || 'N/A'}</div>
            </div>
          </div>
          ${car.year ? `
          <div class="car-spec">
            <div class="spec-icon">
              <i class="fas fa-calendar"></i>
            </div>
            <div class="spec-content">
              <div class="spec-label">Year</div>
              <div class="spec-value">${car.year}</div>
            </div>
          </div>
          ` : ''}
        </div>

        <div class="car-actions">
          <button class="btn-compare" onclick="addToComparison(${index})">
            <i class="fas fa-plus"></i> Compare
          </button>
          <button class="btn-details" onclick="showCarDetails(${index})">
            <i class="fas fa-info-circle"></i> Details
          </button>
        </div>
      </div>
    </div>
  `;
}

// ==================== SETUP EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
  // Set up search form
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
});

// ==================== UTILITY FUNCTIONS ====================
function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num);
}

function formatCurrency(amount) {
  return '₹' + formatNumber(amount);
}

// Make functions globally available
window.handleSearch = handleSearch;
window.handleSort = handleSort;
window.switchView = switchView;
window.addToComparison = addToComparison;
window.toggleComparison = toggleComparison;
window.removeFromComparison = removeFromComparison;
window.closeComparison = closeComparison;
window.showCarDetails = showCarDetails;
window.closeCarDetails = closeCarDetails;
window.toggleMobileMenu = toggleMobileMenu;
window.fillQuery = fillQuery;
window.scrollToTop = scrollToTop;
window.toggleScoreInfo = toggleScoreInfo;
window.showScoreInfoPopup = showScoreInfoPopup;
window.loadMoreCars = loadMoreCars;
window.handleYearFilter = handleYearFilter;
window.getYearOptions = getYearOptions;

function showScoreInfoPopup() {
  const popup = document.createElement('div');
  popup.className = 'score-info-popup';
  popup.innerHTML = `
    <div class="score-info-popup-content">
      <button class="score-info-popup-close" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
      <div class="score-info-popup-header">
        <i class="fas fa-calculator"></i>
        <h3>Understanding Match Scores</h3>
      </div>
      <div class="score-info-popup-body">
        <p class="score-popup-intro">
          Your match score (0-1 scale) shows how well each car fits your needs based on AI analysis of your search query.
        </p>
        <div class="score-popup-factors">
          <div class="score-popup-factor">
            <div class="popup-factor-header">
              <i class="fas fa-shield-alt" style="color: #4ade80;"></i>
              <strong>Safety Rating (0-5 stars)</strong>
            </div>
            <p>Crash test ratings and active safety features</p>
          </div>
          <div class="score-popup-factor">
            <div class="popup-factor-header">
              <i class="fas fa-gas-pump" style="color: #3b82f6;"></i>
              <strong>Fuel Efficiency (km/l)</strong>
            </div>
            <p>Higher mileage means lower running costs</p>
          </div>
          <div class="score-popup-factor">
            <div class="popup-factor-header">
              <i class="fas fa-rupee-sign" style="color: #f59e0b;"></i>
              <strong>Price Value (₹ Lakhs)</strong>
            </div>
            <p>Best value within your budget constraints</p>
          </div>
          <div class="score-popup-factor">
            <div class="popup-factor-header">
              <i class="fas fa-bolt" style="color: #ec4899;"></i>
              <strong>Power & Performance (BHP)</strong>
            </div>
            <p>Engine power for acceleration and overtaking</p>
          </div>
          <div class="score-popup-factor">
            <div class="popup-factor-header">
              <i class="fas fa-chart-line" style="color: #8b5cf6;"></i>
              <strong>Resale Value (%)</strong>
            </div>
            <p>Expected value retention after 5 years</p>
          </div>
        </div>
        <div class="score-popup-intelligence">
          <div class="intelligence-badge">
            <i class="fas fa-brain"></i>
            <span>Smart Weight Adjustment</span>
          </div>
          <p>
            Our AI automatically adjusts the importance of each factor based on your search:
          </p>
          <ul>
            <li><strong>"Family car"</strong> → Prioritizes safety (30%) and mileage (25%)</li>
            <li><strong>"Sports car"</strong> → Emphasizes power (50%) and performance</li>
            <li><strong>"Budget car"</strong> → Focuses on price (45%) and efficiency (30%)</li>
            <li><strong>"Electric"</strong> → Highlights mileage/range (35%) and safety (30%)</li>
          </ul>
        </div>
        <div class="score-popup-example">
          <i class="fas fa-lightbulb"></i>
          <strong>Example:</strong> A car scoring 0.85 is an excellent match for your needs, while 0.60 is still good but may compromise on some factors.
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.classList.add('active'), 10);
  
  // Close on backdrop click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });
}

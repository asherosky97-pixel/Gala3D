import { CATEGORIES, CATALOG_ITEMS } from '../assets/Catalog.js';
import { getIcon } from './Icons.js';
import { formatCurrency } from '../utils/MathUtils.js';

export class CatalogDrawer {
  constructor(container, store, engine) {
    this.container = container;
    this.store = store;
    this.engine = engine;

    this.activeCategory = 'tables';
    this.searchQuery = '';
    this.isCollapsed = false;

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="catalog-panel">
        <div class="catalog-header">
          <div class="catalog-title-row">
            <h2 class="panel-title">${getIcon('cube')} Event Catalog</h2>
            <button class="btn btn-icon collapse-toggle-btn" id="btn-toggle-catalog" title="Collapse / Expand Catalog">
              ${getIcon('chevronLeft')}
            </button>
          </div>

          <!-- Search Bar -->
          <div class="search-box">
            <span class="search-icon">${getIcon('search')}</span>
            <input type="text" id="catalog-search-input" placeholder="Search tables, chairs, tents..." />
          </div>

          <!-- Category Pills -->
          <div class="category-pills" id="category-pills">
            ${CATEGORIES.map(cat => `
              <button class="cat-pill ${cat.id === this.activeCategory ? 'active' : ''}" data-cat="${cat.id}">
                ${getIcon(cat.icon)} <span>${cat.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Catalog Items Grid -->
        <div class="catalog-items-grid" id="catalog-items-grid">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;

    this.renderItems();
  }

  renderItems() {
    const grid = this.container.querySelector('#catalog-items-grid');
    if (!grid) return;

    let items = CATALOG_ITEMS;

    // Filter by active category
    if (this.activeCategory && !this.searchQuery) {
      items = items.filter(i => i.category === this.activeCategory);
    }

    // Filter by search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="empty-catalog-state">
          <p>No catalog items found matching "${this.searchQuery}".</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(item => `
      <div class="catalog-card" draggable="true" data-id="${item.id}" title="${item.description}">
        <div class="card-icon-wrapper">
          ${getIcon(item.icon || 'cube')}
        </div>
        <div class="card-content">
          <h4 class="card-title">${item.name}</h4>
          <div class="card-meta">
            ${item.hasSeats ? `<span class="badge badge-seats">${getIcon('users')} ${item.defaultSeats} Seats</span>` : ''}
            <span class="card-price">${formatCurrency(item.defaultPrice)}</span>
          </div>
        </div>
        <button class="btn btn-icon add-btn" title="Add to Floor Center">${getIcon('plus')}</button>
      </div>
    `).join('');

    // Attach drag & click events to new cards
    grid.querySelectorAll('.catalog-card').forEach(card => {
      const itemId = card.dataset.id;
      const meta = CATALOG_ITEMS.find(i => i.id === itemId);

      // HTML5 Drag & Drop data
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/gala3d-item', JSON.stringify(meta));
        e.dataTransfer.effectAllowed = 'copy';
      });

      // Click to add at room center
      card.querySelector('.add-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.store.addItem(meta, { x: 0, y: 0, z: 0 });
      });

      // Clicking card also places item at center or selected position
      card.addEventListener('click', () => {
        this.store.addItem(meta, { x: 0, y: 0, z: 0 });
      });
    });
  }

  bindEvents() {
    // Search input
    const searchInput = this.container.querySelector('#catalog-search-input');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim();
      this.renderItems();
    });

    // Category pills
    const pills = this.container.querySelectorAll('.cat-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeCategory = pill.dataset.cat;
        this.searchQuery = '';
        searchInput.value = '';
        this.renderItems();
      });
    });

    // Collapse / Expand Toggle
    const toggleBtn = this.container.querySelector('#btn-toggle-catalog');
    toggleBtn.addEventListener('click', () => {
      this.isCollapsed = !this.isCollapsed;
      this.container.classList.toggle('collapsed', this.isCollapsed);
      toggleBtn.innerHTML = this.isCollapsed ? getIcon('chevronRight') : getIcon('chevronLeft');
      // Trigger engine resize for canvas responsiveness
      setTimeout(() => this.engine.onWindowResize(), 250);
    });
  }
}

import { getIcon } from './Icons.js';
import { formatCurrency, formatDimension } from '../utils/MathUtils.js';
import { getItemById } from '../assets/Catalog.js';

export class Inspector {
  constructor(container, store, engine, modals) {
    this.container = container;
    this.store = store;
    this.engine = engine;
    this.modals = modals;

    this.isCollapsed = false;

    this.render();
    this.bindEvents();
  }

  render() {
    const selected = this.store.getSelectedItem();

    if (!selected) {
      this.renderVenueSummary();
      return;
    }

    const meta = getItemById(selected.catalogId) || {};
    const [px, py, pz] = selected.position || [0, 0, 0];
    const rotYDeg = Math.round(((selected.rotation ? selected.rotation[1] : 0) * 180) / Math.PI) % 360;

    this.container.innerHTML = `
      <div class="inspector-panel">
        <div class="inspector-header">
          <div class="inspector-title-row">
            <span class="badge badge-cat">${selected.category || 'Item'}</span>
            <button class="btn btn-icon btn-danger" id="btn-delete-item" title="Delete Item (Delete Key)">
              ${getIcon('trash')}
            </button>
          </div>
          <input type="text" id="item-name-input" class="item-name-input" value="${selected.name || 'Event Item'}" />
        </div>

        <div class="inspector-body">
          <!-- Transform Controls -->
          <div class="inspector-section">
            <h4 class="section-title">${getIcon('move')} Position & Rotation</h4>
            
            <div class="input-grid">
              <div class="input-field">
                <label>X (m)</label>
                <input type="number" step="0.5" id="inp-pos-x" value="${px.toFixed(2)}" />
              </div>
              <div class="input-field">
                <label>Z (m)</label>
                <input type="number" step="0.5" id="inp-pos-z" value="${pz.toFixed(2)}" />
              </div>
            </div>

            <!-- Rotation Slider & Quick Turns -->
            <div class="control-row">
              <label>Rotation: <span id="rot-value-label">${rotYDeg}°</span></label>
              <input type="range" min="0" max="360" step="15" id="inp-rot-y" value="${(rotYDeg + 360) % 360}" />
            </div>

            <div class="quick-turn-buttons">
              <button class="btn btn-secondary btn-sm" id="btn-rot-45">+45°</button>
              <button class="btn btn-secondary btn-sm" id="btn-rot-90">+90°</button>
              <button class="btn btn-secondary btn-sm" id="btn-rot-180">180°</button>
            </div>
          </div>

          <!-- Material / Colors -->
          <div class="inspector-section">
            <h4 class="section-title">${getIcon('sparkles')} Style & Colors</h4>

            ${meta.hasSeats || selected.linenColor ? `
              <div class="control-row">
                <label>Linen / Tablecloth Color</label>
                <div class="color-picker-row">
                  <input type="color" id="inp-linen-color" value="${selected.linenColor || '#ffffff'}" />
                  <div class="color-swatches">
                    <button class="swatch" style="background:#ffffff;" data-color="#ffffff" title="Classic White"></button>
                    <button class="swatch" style="background:#fef3c7;" data-color="#fef3c7" title="Ivory Cream"></button>
                    <button class="swatch" style="background:#1e293b;" data-color="#1e293b" title="Midnight Navy"></button>
                    <button class="swatch" style="background:#881337;" data-color="#881337" title="Royal Burgundy"></button>
                    <button class="swatch" style="background:#14532d;" data-color="#14532d" title="Emerald Forest"></button>
                  </div>
                </div>
              </div>
            ` : ''}

            ${selected.uplightColor || meta.isLightSource ? `
              <div class="control-row">
                <label>Uplight Wash Color</label>
                <div class="color-picker-row">
                  <input type="color" id="inp-uplight-color" value="${selected.uplightColor || '#c026d3'}" />
                  <div class="color-swatches">
                    <button class="swatch" style="background:#c026d3;" data-uplight="#c026d3" title="Vibrant Magenta"></button>
                    <button class="swatch" style="background:#0284c7;" data-uplight="#0284c7" title="Sapphire Blue"></button>
                    <button class="swatch" style="background:#f59e0b;" data-uplight="#f59e0b" title="Warm Amber"></button>
                    <button class="swatch" style="background:#8b5cf6;" data-uplight="#8b5cf6" title="Royal Purple"></button>
                    <button class="swatch" style="background:#10b981;" data-uplight="#10b981" title="Mint Glow"></button>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Seating Configuration (if Table) -->
          ${meta.hasSeats ? `
            <div class="inspector-section">
              <h4 class="section-title">${getIcon('users')} Seating & Guests</h4>
              
              <div class="input-grid">
                <div class="input-field">
                  <label>Table Number</label>
                  <input type="text" id="inp-table-number" value="${selected.tableNumber || ''}" placeholder="e.g. Table 1" />
                </div>
                <div class="input-field">
                  <label>Seat Count</label>
                  <input type="number" min="2" max="16" id="inp-seat-count" value="${selected.seats || meta.defaultSeats || 8}" />
                </div>
              </div>

              <button class="btn btn-secondary btn-block mt-2" id="btn-open-table-guests">
                ${getIcon('users')} Manage Guests for this Table
              </button>
            </div>
          ` : ''}

          <!-- Quick Actions & Array Multiplier -->
          <div class="inspector-section">
            <h4 class="section-title">${getIcon('copy')} Fast Actions</h4>
            
            <div class="action-buttons-stack">
              <button class="btn btn-secondary btn-block" id="btn-duplicate-item">
                ${getIcon('copy')} Duplicate Item (Ctrl+D)
              </button>

              ${meta.hasSeats ? `
                <div class="array-generator-box">
                  <label class="sublabel">Quick Table Grid Generator</label>
                  <div class="array-grid-inputs">
                    <div class="array-field">
                      <span>Rows:</span>
                      <input type="number" id="inp-array-rows" min="1" max="8" value="2" />
                    </div>
                    <div class="array-field">
                      <span>Cols:</span>
                      <input type="number" id="inp-array-cols" min="1" max="8" value="3" />
                    </div>
                    <div class="array-field">
                      <span>Spacing:</span>
                      <input type="number" id="inp-array-spacing" min="2" max="6" step="0.5" value="3.0" />
                    </div>
                  </div>
                  <button class="btn btn-secondary btn-sm btn-block mt-1" id="btn-generate-array">
                    Generate Grid of Tables
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindSelectedItemEvents(selected);
  }

  renderVenueSummary() {
    const venue = this.store.project.venue;
    const stats = this.store.getCapacityStats();
    const bom = this.store.getBillOfMaterials();

    this.container.innerHTML = `
      <div class="inspector-panel">
        <div class="inspector-header">
          <h2 class="panel-title">${getIcon('settings')} Event Overview</h2>
        </div>

        <div class="inspector-body">
          <div class="stat-card">
            <div class="stat-row">
              <span class="stat-label">Venue Dimensions:</span>
              <span class="stat-val">${formatDimension(venue.width)} × ${formatDimension(venue.length)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Floor Space:</span>
              <span class="stat-val">${venue.width * venue.length} m² (${Math.round(venue.width * venue.length * 10.7639)} sq ft)</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Theme / Style:</span>
              <span class="stat-val capitalize">${venue.theme}</span>
            </div>
          </div>

          <div class="stat-card mt-3">
            <h4 class="stat-card-title">${getIcon('users')} Seating Capacity</h4>
            <div class="stat-grid">
              <div class="stat-box">
                <span class="stat-number">${stats.totalSeats}</span>
                <span class="stat-sub">Total Seats</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">${stats.seatedGuests}</span>
                <span class="stat-sub">Assigned</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">${stats.unseatedGuests}</span>
                <span class="stat-sub">Unassigned</span>
              </div>
            </div>
          </div>

          <div class="stat-card mt-3">
            <h4 class="stat-card-title">${getIcon('dollarSign')} Rental Budget Estimate</h4>
            <div class="budget-highlight">
              <span class="budget-total">${formatCurrency(bom.total, bom.currency)}</span>
              <span class="budget-items-count">${this.store.project.items.length} items placed</span>
            </div>
          </div>

          <div class="quick-hints mt-4">
            <p class="hint-text">💡 <strong>Tip:</strong> Drag any item from the left catalog and drop it onto the 3D floor. Click an item to move, rotate, or customize its linens!</p>
          </div>
        </div>
      </div>
    `;
  }

  bindSelectedItemEvents(item) {
    // Name change
    const nameInput = this.container.querySelector('#item-name-input');
    if (nameInput) {
      nameInput.addEventListener('change', () => {
        this.store.updateItem(item.id, { name: nameInput.value });
      });
    }

    // Delete
    const deleteBtn = this.container.querySelector('#btn-delete-item');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.store.removeItem(item.id);
      });
    }

    // Position inputs
    const posX = this.container.querySelector('#inp-pos-x');
    const posZ = this.container.querySelector('#inp-pos-z');
    const updatePos = () => {
      const nx = parseFloat(posX.value) || 0;
      const nz = parseFloat(posZ.value) || 0;
      this.store.updateItem(item.id, { position: [nx, item.position[1], nz] });
    };
    if (posX && posZ) {
      posX.addEventListener('change', updatePos);
      posZ.addEventListener('change', updatePos);
    }

    // Rotation slider
    const rotSlider = this.container.querySelector('#inp-rot-y');
    const rotLabel = this.container.querySelector('#rot-value-label');
    if (rotSlider) {
      rotSlider.addEventListener('input', () => {
        const deg = parseInt(rotSlider.value, 10);
        rotLabel.textContent = `${deg}°`;
        const rad = (deg * Math.PI) / 180;
        this.store.updateItem(item.id, { rotation: [0, rad, 0] });
      });
    }

    // Quick turns
    const addTurn = (deg) => {
      const curRad = item.rotation ? item.rotation[1] : 0;
      const newRad = curRad + (deg * Math.PI) / 180;
      this.store.updateItem(item.id, { rotation: [0, newRad, 0] });
      this.render();
    };
    const b45 = this.container.querySelector('#btn-rot-45');
    const b90 = this.container.querySelector('#btn-rot-90');
    const b180 = this.container.querySelector('#btn-rot-180');
    if (b45) b45.addEventListener('click', () => addTurn(45));
    if (b90) b90.addEventListener('click', () => addTurn(90));
    if (b180) b180.addEventListener('click', () => addTurn(180));

    // Linen color
    const linenColorInp = this.container.querySelector('#inp-linen-color');
    if (linenColorInp) {
      linenColorInp.addEventListener('input', (e) => {
        this.store.updateItem(item.id, { linenColor: e.target.value });
      });
      this.container.querySelectorAll('.swatch[data-color]').forEach(sw => {
        sw.addEventListener('click', () => {
          const color = sw.dataset.color;
          linenColorInp.value = color;
          this.store.updateItem(item.id, { linenColor: color });
        });
      });
    }

    // Uplight color
    const uplightInp = this.container.querySelector('#inp-uplight-color');
    if (uplightInp) {
      uplightInp.addEventListener('input', (e) => {
        this.store.updateItem(item.id, { uplightColor: e.target.value });
      });
      this.container.querySelectorAll('.swatch[data-uplight]').forEach(sw => {
        sw.addEventListener('click', () => {
          const color = sw.dataset.uplight;
          uplightInp.value = color;
          this.store.updateItem(item.id, { uplightColor: color });
        });
      });
    }

    // Seat count
    const seatInp = this.container.querySelector('#inp-seat-count');
    if (seatInp) {
      seatInp.addEventListener('change', () => {
        this.store.updateItem(item.id, { seats: parseInt(seatInp.value, 10) || 8 });
      });
    }

    // Table number
    const tableNumInp = this.container.querySelector('#inp-table-number');
    if (tableNumInp) {
      tableNumInp.addEventListener('change', () => {
        this.store.updateItem(item.id, { tableNumber: tableNumInp.value.trim() });
      });
    }

    // Open table guests
    const guestBtn = this.container.querySelector('#btn-open-table-guests');
    if (guestBtn) {
      guestBtn.addEventListener('click', () => {
        this.modals.seating.open(item.id);
      });
    }

    // Duplicate
    const dupBtn = this.container.querySelector('#btn-duplicate-item');
    if (dupBtn) {
      dupBtn.addEventListener('click', () => {
        this.store.duplicateItem(item.id);
      });
    }

    // Array generator
    const genArrayBtn = this.container.querySelector('#btn-generate-array');
    if (genArrayBtn) {
      genArrayBtn.addEventListener('click', () => {
        const rows = parseInt(this.container.querySelector('#inp-array-rows').value, 10) || 2;
        const cols = parseInt(this.container.querySelector('#inp-array-cols').value, 10) || 3;
        const spacing = parseFloat(this.container.querySelector('#inp-array-spacing').value) || 3.0;
        this.store.generateArray(item.id, rows, cols, spacing, spacing);
      });
    }
  }

  bindEvents() {
    this.store.on('selection-changed', () => this.render());
    this.store.on('item-updated', (item) => {
      if (this.store.selectedItemId === item.id) {
        // Sync position fields if changed by 3D gizmo
        const posX = this.container.querySelector('#inp-pos-x');
        const posZ = this.container.querySelector('#inp-pos-z');
        if (posX && posZ) {
          posX.value = item.position[0].toFixed(2);
          posZ.value = item.position[2].toFixed(2);
        }
      }
    });
    this.store.on('change', () => {
      if (!this.store.selectedItemId) {
        this.renderVenueSummary();
      }
    });
  }
}

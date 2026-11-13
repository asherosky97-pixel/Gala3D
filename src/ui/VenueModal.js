import { getIcon } from './Icons.js';
import { VENUE_THEMES, FLOOR_FINISHES } from '../core/Venue.js';

export class VenueModal {
  constructor(store, engine) {
    this.store = store;
    this.engine = engine;

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.id = 'modal-venue';
    document.body.appendChild(this.modalEl);

    this.render();
  }

  render() {
    const v = this.store.project.venue;

    this.modalEl.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">${getIcon('settings')} Venue Architecture & Themes</h3>
          <button class="btn btn-icon btn-close-modal">${getIcon('x')}</button>
        </div>

        <div class="modal-body">
          <!-- Room Dimensions -->
          <div class="form-section">
            <h4 class="form-section-title">Room Dimensions (Meters)</h4>
            <div class="dimension-inputs-row">
              <div class="input-field">
                <label>Width (m):</label>
                <input type="number" id="inp-venue-width" min="6" max="100" step="1" value="${v.width}" />
                <span class="unit-helper">~${Math.round(v.width * 3.28084)} ft</span>
              </div>
              <div class="input-field">
                <label>Length (m):</label>
                <input type="number" id="inp-venue-length" min="6" max="100" step="1" value="${v.length}" />
                <span class="unit-helper">~${Math.round(v.length * 3.28084)} ft</span>
              </div>
              <div class="input-field">
                <label>Ceiling Height (m):</label>
                <input type="number" id="inp-venue-height" min="3" max="15" step="0.5" value="${v.height}" />
                <span class="unit-helper">~${Math.round(v.height * 3.28084)} ft</span>
              </div>
            </div>
            <p class="section-note">Total Floor Area: <strong><span id="venue-area-label">${v.width * v.length}</span> m²</strong> (${Math.round(v.width * v.length * 10.7639)} sq ft)</p>
          </div>

          <!-- Venue Theme Styles -->
          <div class="form-section mt-4">
            <h4 class="form-section-title">Venue Style / Theme</h4>
            <div class="theme-selection-grid">
              ${VENUE_THEMES.map(theme => `
                <div class="theme-card ${theme.id === v.theme ? 'selected' : ''}" data-theme="${theme.id}">
                  <div class="theme-icon">${getIcon(theme.id === 'garden' ? 'flower' : (theme.id === 'tent' ? 'tent' : 'cube'))}</div>
                  <span class="theme-name">${theme.name}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Floor Finish Selection -->
          <div class="form-section mt-4">
            <h4 class="form-section-title">Floor Finish</h4>
            <div class="finish-selection-grid">
              ${FLOOR_FINISHES.map(f => `
                <div class="finish-card ${f.id === v.floorFinish ? 'selected' : ''}" data-finish="${f.id}">
                  <span class="finish-name">${f.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary btn-close-modal">Cancel</button>
          <button class="btn btn-primary" id="btn-apply-venue">Apply Changes</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.modalEl.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Theme selection cards
    const themeCards = this.modalEl.querySelectorAll('.theme-card');
    themeCards.forEach(c => {
      c.addEventListener('click', () => {
        themeCards.forEach(tc => tc.classList.remove('selected'));
        c.classList.add('selected');
        // Auto-select recommended floor finish for this theme
        const t = VENUE_THEMES.find(item => item.id === c.dataset.theme);
        if (t) {
          const fc = this.modalEl.querySelector(`.finish-card[data-finish="${t.defaultFloor}"]`);
          if (fc) {
            this.modalEl.querySelectorAll('.finish-card').forEach(f => f.classList.remove('selected'));
            fc.classList.add('selected');
          }
        }
      });
    });

    // Floor finish cards
    const finishCards = this.modalEl.querySelectorAll('.finish-card');
    finishCards.forEach(c => {
      c.addEventListener('click', () => {
        finishCards.forEach(fc => fc.classList.remove('selected'));
        c.classList.add('selected');
      });
    });

    // Area calculation on input
    const wInput = this.modalEl.querySelector('#inp-venue-width');
    const lInput = this.modalEl.querySelector('#inp-venue-length');
    const areaLabel = this.modalEl.querySelector('#venue-area-label');
    const updateArea = () => {
      const w = parseFloat(wInput.value) || 16;
      const l = parseFloat(lInput.value) || 24;
      areaLabel.textContent = `${Math.round(w * l)}`;
    };
    wInput.addEventListener('input', updateArea);
    lInput.addEventListener('input', updateArea);

    // Apply
    this.modalEl.querySelector('#btn-apply-venue').addEventListener('click', () => {
      const selectedTheme = this.modalEl.querySelector('.theme-card.selected');
      const selectedFinish = this.modalEl.querySelector('.finish-card.selected');

      const config = {
        width: parseFloat(wInput.value) || 16,
        length: parseFloat(lInput.value) || 24,
        height: parseFloat(this.modalEl.querySelector('#inp-venue-height').value) || 4.5,
        theme: selectedTheme ? selectedTheme.dataset.theme : 'ballroom',
        floorFinish: selectedFinish ? selectedFinish.dataset.finish : 'marble_light'
      };

      this.store.updateVenue(config);
      this.engine.venue.updateConfig(config);
      this.engine.lighting.onVenueResize();
      this.engine.onWindowResize();
      this.close();
    });
  }

  open() {
    this.render();
    this.modalEl.classList.add('open');
  }

  close() {
    this.modalEl.classList.remove('open');
  }
}

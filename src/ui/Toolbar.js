import { getIcon } from './Icons.js';
import { LIGHTING_MODES } from '../core/Lighting.js';
import { Exporters } from '../utils/Exporters.js';

export class Toolbar {
  constructor(container, engine, store, modals) {
    this.container = container;
    this.engine = engine;
    this.store = store;
    this.modals = modals;

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="toolbar-left">
        <!-- Logo & Branding -->
        <div class="brand">
          <div class="brand-icon">${getIcon('sparkles')}</div>
          <span class="brand-name">Gala3D</span>
        </div>

        <!-- Project Name Input -->
        <div class="project-title-wrapper">
          <input type="text" id="project-name-input" class="project-name-input" value="${this.store.project.name || 'Grand Gala Event'}" title="Rename Event Project" />
          <span id="save-status-badge" class="save-badge">${getIcon('check')} Saved</span>
        </div>

        <!-- File Menu Dropdown -->
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-btn" id="file-menu-btn" title="Project File Actions">
            ${getIcon('folder')} <span>Project</span>
          </button>
          <div class="dropdown-menu" id="file-dropdown-menu">
            <button class="dropdown-item" id="action-new-project">${getIcon('plus')} New Event Plan</button>
            <button class="dropdown-item" id="action-save-project">${getIcon('check')} Save Project</button>
            <button class="dropdown-item" id="action-open-project">${getIcon('folder')} Open Saved Projects...</button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" id="action-export-gala">${getIcon('download')} Export .gala3d File</button>
            <label class="dropdown-item file-upload-label">
              ${getIcon('upload')} Import .gala3d File
              <input type="file" id="action-import-file" accept=".gala3d,.json" style="display:none;" />
            </label>
          </div>
        </div>

        <!-- Venue Config Button -->
        <button class="btn btn-secondary" id="btn-venue-modal" title="Change Room Dimensions & Theme">
          ${getIcon('settings')} <span>Venue</span>
        </button>
      </div>

      <!-- Center: View Mode Segmented Switcher -->
      <div class="toolbar-center">
        <div class="segmented-control">
          <button class="segment-btn active" data-view="3d" id="btn-view-3d" title="3D Orbit View">
            ${getIcon('cube')} <span>3D Orbit</span>
          </button>
          <button class="segment-btn" data-view="2d" id="btn-view-2d" title="2D CAD Top-Down Blueprint">
            ${getIcon('grid')} <span>2D Blueprint</span>
          </button>
          <button class="segment-btn" data-view="walkthrough" id="btn-view-walkthrough" title="1st-Person Guest Walkthrough (WASD)">
            ${getIcon('footprints')} <span>Walkthrough</span>
          </button>
        </div>
      </div>

      <!-- Right: Atmosphere, Feature Modals & Export Tools -->
      <div class="toolbar-right">
        <!-- Atmosphere / Lighting Selector -->
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-btn" id="lighting-menu-btn" title="Lighting & Atmosphere">
            ${getIcon('sun')} <span id="current-lighting-label">Gala Night</span>
          </button>
          <div class="dropdown-menu" id="lighting-dropdown-menu">
            ${LIGHTING_MODES.map(m => `
              <button class="dropdown-item lighting-item" data-mode="${m.id}">
                ${getIcon(m.icon)} <span>${m.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Seating & Guests -->
        <button class="btn btn-secondary" id="btn-seating-modal" title="Seating Chart & Guest Management">
          ${getIcon('users')} <span>Guests</span>
        </button>

        <!-- Bill of Materials / Quote -->
        <button class="btn btn-secondary" id="btn-budget-modal" title="Bill of Materials & Rental Quote">
          ${getIcon('dollarSign')} <span>Quote</span>
        </button>

        <!-- Export Dropdown -->
        <div class="dropdown">
          <button class="btn btn-primary dropdown-btn" id="export-menu-btn" title="Export & Renders">
            ${getIcon('download')} <span>Export</span>
          </button>
          <div class="dropdown-menu dropdown-menu-right" id="export-dropdown-menu">
            <button class="dropdown-item" id="action-snapshot-modal">${getIcon('camera')} 4K Snapshot Render</button>
            <button class="dropdown-item" id="action-export-blueprint">${getIcon('fileText')} 2D CAD Floor Plan (PNG)</button>
            <button class="dropdown-item" id="action-export-glb">${getIcon('cube')} 3D Scene Model (.glb)</button>
            <button class="dropdown-item" id="action-export-csv">${getIcon('download')} Bill of Materials (CSV)</button>
          </div>
        </div>

        <div class="toolbar-separator"></div>

        <!-- Undo / Redo -->
        <button class="btn btn-icon" id="btn-undo" title="Undo (Ctrl+Z)">${getIcon('undo')}</button>
        <button class="btn btn-icon" id="btn-redo" title="Redo (Ctrl+Y)">${getIcon('redo')}</button>

        <!-- Grid Snapping -->
        <button class="btn btn-icon active" id="btn-snap-toggle" title="Toggle Grid Snapping">${getIcon('magnet')}</button>
      </div>
    `;
  }

  bindEvents() {
    // Project Name change
    const nameInput = this.container.querySelector('#project-name-input');
    nameInput.addEventListener('change', () => {
      this.store.project.name = nameInput.value;
      this.store.isDirty = true;
      this.store.scheduleAutoSave();
    });

    // View Mode Switcher
    const viewButtons = this.container.querySelectorAll('.segment-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.view;
        this.engine.setViewMode(mode);
        this.store.viewMode = mode;
      });
    });

    // Dropdown Toggles
    this.setupDropdown('file-menu-btn', 'file-dropdown-menu');
    this.setupDropdown('lighting-menu-btn', 'lighting-dropdown-menu');
    this.setupDropdown('export-menu-btn', 'export-dropdown-menu');

    // Lighting Mode selection
    const lightingItems = this.container.querySelectorAll('.lighting-item');
    lightingItems.forEach(item => {
      item.addEventListener('click', () => {
        const mode = item.dataset.mode;
        this.engine.lighting.setMode(mode);
        this.store.setLightingMode(mode);
        const label = this.container.querySelector('#current-lighting-label');
        if (label) {
          const match = LIGHTING_MODES.find(m => m.id === mode);
          if (match) label.textContent = match.name;
        }
        this.closeAllDropdowns();
      });
    });

    // Modals
    this.container.querySelector('#btn-venue-modal').addEventListener('click', () => this.modals.venue.open());
    this.container.querySelector('#btn-seating-modal').addEventListener('click', () => this.modals.seating.open());
    this.container.querySelector('#btn-budget-modal').addEventListener('click', () => this.modals.budget.open());
    this.container.querySelector('#action-snapshot-modal').addEventListener('click', () => {
      this.closeAllDropdowns();
      this.modals.snapshot.open();
    });
    this.container.querySelector('#action-open-project').addEventListener('click', () => {
      this.closeAllDropdowns();
      this.modals.project.open();
    });

    // Export Actions
    this.container.querySelector('#action-export-blueprint').addEventListener('click', () => {
      this.closeAllDropdowns();
      Exporters.export2DBlueprint(this.engine, this.store);
    });

    this.container.querySelector('#action-export-glb').addEventListener('click', () => {
      this.closeAllDropdowns();
      Exporters.exportGLB(this.engine, `${this.store.project.name || 'Gala3D'}.glb`);
    });

    this.container.querySelector('#action-export-csv').addEventListener('click', () => {
      this.closeAllDropdowns();
      const bom = this.store.getBillOfMaterials();
      Exporters.exportBOMToCSV(bom, this.store.project.name);
    });

    this.container.querySelector('#action-export-gala').addEventListener('click', () => {
      this.closeAllDropdowns();
      Exporters.exportProjectFile(this.store.project);
    });

    // Import file
    const fileInput = this.container.querySelector('#action-import-file');
    fileInput.addEventListener('change', async (e) => {
      if (e.target.files.length > 0) {
        try {
          const projectData = await Exporters.importProjectFile(e.target.files[0]);
          this.store.loadProject(projectData);
          this.closeAllDropdowns();
        } catch (err) {
          alert('Failed to import project: ' + err.message);
        }
      }
    });

    // New Project
    this.container.querySelector('#action-new-project').addEventListener('click', () => {
      this.closeAllDropdowns();
      if (confirm('Create a new event plan? Unsaved changes will be cleared.')) {
        this.store.newProject();
      }
    });

    // Save Project
    this.container.querySelector('#action-save-project').addEventListener('click', async () => {
      this.closeAllDropdowns();
      await this.store.saveToStorage();
      this.showSavedIndicator();
    });

    // Undo / Redo
    this.container.querySelector('#btn-undo').addEventListener('click', () => this.store.undo());
    this.container.querySelector('#btn-redo').addEventListener('click', () => this.store.redo());

    // Grid Snap Toggle
    const snapBtn = this.container.querySelector('#btn-snap-toggle');
    snapBtn.addEventListener('click', () => {
      this.store.gridSnap = !this.store.gridSnap;
      snapBtn.classList.toggle('active', this.store.gridSnap);
      this.engine.setGizmoSnap(this.store.gridSnap, this.store.snapStep);
    });

    // Listen for store save event to flash badge
    this.store.on('saved', () => this.showSavedIndicator());
    this.store.on('project-loaded', (proj) => {
      nameInput.value = proj.name;
    });
  }

  showSavedIndicator() {
    const badge = this.container.querySelector('#save-status-badge');
    if (badge) {
      badge.classList.add('flash');
      setTimeout(() => badge.classList.remove('flash'), 1800);
    }
  }

  setupDropdown(btnId, menuId) {
    const btn = this.container.querySelector(`#${btnId}`);
    const menu = this.container.querySelector(`#${menuId}`);
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('show');
      this.closeAllDropdowns();
      if (!isOpen) {
        menu.classList.add('show');
      }
    });

    window.addEventListener('click', () => {
      menu.classList.remove('show');
    });
  }

  closeAllDropdowns() {
    this.container.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
  }
}

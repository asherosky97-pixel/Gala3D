import { Store } from './state/Store.js';
import { Engine } from './core/Engine.js';
import { RaycasterHandler } from './core/Raycaster.js';
import { AssetFactory } from './assets/AssetFactory.js';
import { getItemById } from './assets/Catalog.js';

import { Toolbar } from './ui/Toolbar.js';
import { CatalogDrawer } from './ui/CatalogDrawer.js';
import { Inspector } from './ui/Inspector.js';

import { VenueModal } from './ui/VenueModal.js';
import { SeatingModal } from './ui/SeatingModal.js';
import { BudgetModal } from './ui/BudgetModal.js';
import { SnapshotModal } from './ui/SnapshotModal.js';
import { ProjectModal } from './ui/ProjectModal.js';

class Gala3DApp {
  constructor() {
    this.store = new Store();
    this.meshMap = new Map(); // id -> THREE.Group

    this.init3D();
    this.initModals();
    this.initUI();
    this.bindStoreToScene();
    this.bindKeyboardShortcuts();
    this.registerServiceWorker();

    // Load sample luxury gala setup if starting fresh
    this.initDefaultDemoLayout();
  }

  init3D() {
    const container = document.getElementById('viewport-container');
    this.engine = new Engine(container);

    this.raycaster = new RaycasterHandler(
      this.engine,
      (selectedGroup) => {
        if (selectedGroup && selectedGroup.userData && selectedGroup.userData.id) {
          this.store.selectItem(selectedGroup.userData.id);
        } else {
          this.store.selectItem(null);
        }
      },
      (itemMeta, groundPos) => {
        this.store.addItem(itemMeta, groundPos);
      }
    );

    // Sync transform gizmo drag changes back to store
    this.engine.transformControls.addEventListener('change', () => {
      const obj = this.engine.transformControls.object;
      if (obj && obj.userData && obj.userData.id) {
        const item = this.store.project.items.find(i => i.id === obj.userData.id);
        if (item) {
          item.position = [obj.position.x, obj.position.y, obj.position.z];
          item.rotation = [obj.rotation.x, obj.rotation.y, obj.rotation.z];
          item.scale = [obj.scale.x, obj.scale.y, obj.scale.z];
          this.store.emit('item-updated', item);
        }
      }
    });

    this.engine.transformControls.addEventListener('dragging-changed', (e) => {
      // When dragging finishes, record history snapshot
      if (!e.value) {
        this.store.recordHistory();
        this.store.isDirty = true;
        this.store.scheduleAutoSave();
      }
    });
  }

  initModals() {
    this.modals = {
      venue: new VenueModal(this.store, this.engine),
      seating: new SeatingModal(this.store),
      budget: new BudgetModal(this.store),
      snapshot: new SnapshotModal(this.engine, this.store),
      project: new ProjectModal(this.store)
    };
  }

  initUI() {
    const toolbarEl = document.getElementById('toolbar');
    this.toolbar = new Toolbar(toolbarEl, this.engine, this.store, this.modals);

    const catalogEl = document.getElementById('catalog-drawer');
    this.catalogDrawer = new CatalogDrawer(catalogEl, this.store, this.engine);

    const inspectorEl = document.getElementById('inspector-drawer');
    this.inspector = new Inspector(inspectorEl, this.store, this.engine, this.modals);
  }

  bindStoreToScene() {
    // 1. Item Added
    this.store.on('item-added', (item) => {
      this.spawn3DMesh(item);
    });

    // 2. Item Updated
    this.store.on('item-updated', (item) => {
      this.update3DMesh(item);
    });

    // 3. Item Removed
    this.store.on('item-removed', (item) => {
      this.remove3DMesh(item.id);
    });

    // 4. Selection Changed
    this.store.on('selection-changed', (item) => {
      if (item && this.meshMap.has(item.id)) {
        this.engine.attachGizmo(this.meshMap.get(item.id));
      } else {
        this.engine.detachGizmo();
      }
    });

    // 5. Venue Updated
    this.store.on('venue-updated', (venue) => {
      this.engine.venue.updateConfig(venue);
      this.engine.lighting.onVenueResize();
    });

    // 6. Lighting Updated
    this.store.on('lighting-updated', (mode) => {
      this.engine.lighting.setMode(mode);
    });

    // 7. Full Scene Restoration (Undo, Redo, Load Project)
    this.store.on('state-restored', () => this.syncAllMeshes());
    this.store.on('project-loaded', () => this.syncAllMeshes());
  }

  spawn3DMesh(item) {
    if (this.meshMap.has(item.id)) return this.meshMap.get(item.id);

    const meta = getItemById(item.catalogId);
    if (!meta) return null;

    const group = AssetFactory.createItem(meta, {
      instanceId: item.id,
      customName: item.name,
      customPrice: item.price,
      seats: item.seats,
      seatList: item.seatList,
      tableNumber: item.tableNumber,
      color: item.color,
      linenColor: item.linenColor,
      uplightColor: item.uplightColor
    });

    group.position.set(item.position[0], item.position[1], item.position[2]);
    if (item.rotation) {
      group.rotation.set(item.rotation[0], item.rotation[1], item.rotation[2]);
    }
    if (item.scale) {
      group.scale.set(item.scale[0], item.scale[1], item.scale[2]);
    }

    this.engine.itemsGroup.add(group);
    this.meshMap.set(item.id, group);

    return group;
  }

  update3DMesh(item) {
    let group = this.meshMap.get(item.id);
    if (!group) return;

    // Check if visual parameters like linen color or seat count changed requiring recreation
    const prevSeats = group.userData.seats;
    const prevLinen = group.userData.linenColor;
    const prevUplight = group.userData.uplightColor;

    if (item.seats !== prevSeats || item.linenColor !== prevLinen || item.uplightColor !== prevUplight) {
      // Re-create mesh with updated parameters
      this.remove3DMesh(item.id);
      group = this.spawn3DMesh(item);
      if (this.store.selectedItemId === item.id) {
        this.engine.attachGizmo(group);
      }
      return;
    }

    // Direct transform update
    group.position.set(item.position[0], item.position[1], item.position[2]);
    if (item.rotation) {
      group.rotation.set(item.rotation[0], item.rotation[1], item.rotation[2]);
    }
    if (item.scale) {
      group.scale.set(item.scale[0], item.scale[1], item.scale[2]);
    }
  }

  remove3DMesh(id) {
    const group = this.meshMap.get(id);
    if (!group) return;

    if (this.engine.transformControls.object === group) {
      this.engine.detachGizmo();
    }

    this.engine.itemsGroup.remove(group);
    group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    });

    this.meshMap.delete(id);
  }

  syncAllMeshes() {
    // 1. Clear existing
    this.engine.detachGizmo();
    this.meshMap.forEach((_, id) => this.remove3DMesh(id));
    this.meshMap.clear();

    // 2. Re-create all items from project state
    this.store.project.items.forEach(item => {
      this.spawn3DMesh(item);
    });

    // 3. Update venue and lighting
    this.engine.venue.updateConfig(this.store.project.venue);
    this.engine.lighting.setMode(this.store.project.lightingMode || 'gala');
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      // Delete key -> Remove selected item
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.store.selectedItemId) {
          e.preventDefault();
          this.store.removeItem(this.store.selectedItemId);
        }
      }

      // Ctrl+D / Cmd+D -> Duplicate
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        if (this.store.selectedItemId) {
          e.preventDefault();
          this.store.duplicateItem(this.store.selectedItemId);
        }
      }

      // Ctrl+Z / Cmd+Z -> Undo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        e.preventDefault();
        this.store.undo();
      }

      // Ctrl+Y or Ctrl+Shift+Z -> Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y' || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
        e.preventDefault();
        this.store.redo();
      }

      // Escape -> Deselect
      if (e.key === 'Escape') {
        this.store.selectItem(null);
        // Also close any open modals
        Object.values(this.modals).forEach(m => m.close());
      }
    });
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.log('SW registration note:', err);
        });
      });
    }
  }

  /**
   * Initializes a sample luxury gala layout upon first load
   */
  initDefaultDemoLayout() {
    if (this.store.project.items.length > 0) return;

    // 1. Elevated Stage at -Z end with Lectern & Backdrop
    const stageMeta = getItemById('stage_modular_block');
    this.store.addItem(stageMeta, { x: 0, y: 0, z: -8.5 }, { name: 'Main Stage' });

    const backdropMeta = getItemById('photo_backdrop_wall');
    this.store.addItem(backdropMeta, { x: 0, y: 0, z: -10.2 }, { name: 'Stage Floral Backdrop' });

    const podiumMeta = getItemById('podium_lectern');
    this.store.addItem(podiumMeta, { x: 0, y: 0.6, z: -8.5 }, { name: 'Speaker Lectern' });

    // 2. Checkered Dance Floor in front of stage
    const danceFloorMeta = getItemById('dance_floor_checkered');
    this.store.addItem(danceFloorMeta, { x: 0, y: 0, z: -3.5 }, { name: 'Central Dance Floor' });

    // 3. Banquet Tables (4 luxury round tables on sides)
    const roundTableMeta = getItemById('table_round_60');
    const tablePositions = [
      { x: -4.5, z: 2.0 },
      { x: 4.5, z: 2.0 },
      { x: -4.5, z: 6.5 },
      { x: 4.5, z: 6.5 }
    ];

    tablePositions.forEach((pos, idx) => {
      this.store.addItem(roundTableMeta, pos, {
        name: `Banquet Table ${idx + 1}`,
        tableNumber: `Table ${idx + 1}`,
        linenColor: idx % 2 === 0 ? '#ffffff' : '#fef3c7'
      });
    });

    // 4. Red Carpet VIP Entrance at +Z end
    const carpetMeta = getItemById('red_carpet_runner');
    this.store.addItem(carpetMeta, { x: 0, y: 0, z: 8.5 }, { name: 'Grand Entrance Red Carpet' });

    // 5. Perimeter Uplights
    const uplightMeta = getItemById('light_uplight');
    const uplightPositions = [
      { x: -7.5, z: -10 },
      { x: 7.5, z: -10 },
      { x: -7.5, z: 0 },
      { x: 7.5, z: 0 }
    ];
    uplightPositions.forEach(pos => {
      this.store.addItem(uplightMeta, pos, { uplightColor: '#c026d3' });
    });

    // 6. Pre-populate sample guest names for seating chart
    const sampleGuests = [
      { name: 'Alexander Wright', tableId: null, isVip: true, mealChoice: 'Standard' },
      { name: 'Elena Rostova', tableId: null, isVip: true, mealChoice: 'Vegetarian' },
      { name: 'Dr. Marcus Vance', tableId: null, isVip: false, mealChoice: 'Kosher' },
      { name: 'Sophia Chen', tableId: null, isVip: false, mealChoice: 'Vegan' },
      { name: 'Liam O’Connor', tableId: null, isVip: false, mealChoice: 'Standard' },
      { name: 'Amara Patel', tableId: null, isVip: true, mealChoice: 'Halal' },
      { name: 'Julian Morales', tableId: null, isVip: false, mealChoice: 'Standard' },
      { name: 'Claire Delacroix', tableId: null, isVip: false, mealChoice: 'Gluten-Free' }
    ];

    sampleGuests.forEach(g => this.store.addGuest(g));
  }
}

// Bootstrap application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.gala3d = new Gala3DApp();
});

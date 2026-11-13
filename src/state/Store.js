import { Storage } from './Storage.js';
import { History } from './History.js';
import { generateId, snap } from '../utils/MathUtils.js';
import { getItemById } from '../assets/Catalog.js';

export class Store {
  constructor() {
    this.listeners = new Map();
    this.history = new History();

    // Default Project State
    this.project = {
      id: generateId('proj'),
      name: 'Grand Gala Reception',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      venue: {
        width: 16,
        length: 24,
        height: 4.5,
        theme: 'ballroom',
        floorFinish: 'marble_light'
      },
      lightingMode: 'gala',
      items: [],
      guests: [],
      budget: {
        currency: 'USD',
        taxPercent: 8,
        discountPercent: 0
      }
    };

    this.selectedItemId = null;
    this.viewMode = '3d';
    this.gizmoMode = 'translate';
    this.gridSnap = true;
    this.snapStep = 0.5;
    this.unit = 'metric'; // 'metric' or 'imperial'

    this.autoSaveTimeout = null;
    this.isDirty = false;

    // Push initial state to history
    this.history.push(this.serializeState());
  }

  // --- EVENT SYSTEM ---
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event).filter(cb => cb !== callback);
    this.listeners.set(event, list);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in store listener for "${event}":`, e);
        }
      });
    }
    // Also emit catch-all change
    if (event !== 'change' && !event.startsWith('ui:')) {
      this.isDirty = true;
      this.scheduleAutoSave();
    }
  }

  scheduleAutoSave() {
    if (this.autoSaveTimeout) clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveToStorage();
    }, 2500);
  }

  async saveToStorage() {
    if (!this.isDirty) return;
    try {
      await Storage.saveProject(this.project);
      this.isDirty = false;
      this.emit('saved', { time: Date.now() });
    } catch (err) {
      console.warn('Auto-save error:', err);
    }
  }

  // --- STATE SNAPSHOT & HISTORY ---
  serializeState() {
    return {
      venue: { ...this.project.venue },
      lightingMode: this.project.lightingMode,
      items: JSON.parse(JSON.stringify(this.project.items)),
      guests: JSON.parse(JSON.stringify(this.project.guests)),
      budget: { ...this.project.budget }
    };
  }

  recordHistory() {
    this.history.push(this.serializeState());
  }

  undo() {
    const prevState = this.history.undo(this.serializeState());
    if (prevState) {
      this.applyStateSnapshot(prevState);
      this.emit('undo-redo', { action: 'undo' });
    }
  }

  redo() {
    const nextState = this.history.redo();
    if (nextState) {
      this.applyStateSnapshot(nextState);
      this.emit('undo-redo', { action: 'redo' });
    }
  }

  applyStateSnapshot(state) {
    this.project.venue = { ...state.venue };
    this.project.lightingMode = state.lightingMode;
    this.project.items = JSON.parse(JSON.stringify(state.items));
    this.project.guests = JSON.parse(JSON.stringify(state.guests));
    this.project.budget = { ...state.budget };

    this.selectedItemId = null;
    this.emit('state-restored', this.project);
    this.emit('change');
  }

  // --- ITEM ACTIONS ---
  addItem(itemMeta, position, config = {}) {
    const instanceId = generateId('inst');
    const catalogItem = getItemById(itemMeta.id) || itemMeta;

    const newItem = {
      id: instanceId,
      catalogId: catalogItem.id,
      name: config.name || catalogItem.name,
      category: catalogItem.category,
      position: [position.x, position.y || 0, position.z],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      price: catalogItem.defaultPrice || 0,
      seats: catalogItem.defaultSeats || 0,
      seatList: [],
      tableNumber: catalogItem.hasSeats ? `${this.getNextTableNumber()}` : '',
      color: catalogItem.color || null,
      linenColor: catalogItem.defaultLinen || null,
      uplightColor: catalogItem.lightColor || null,
      ...config
    };

    this.project.items.push(newItem);
    this.selectedItemId = instanceId;
    this.recordHistory();

    this.emit('item-added', newItem);
    this.emit('selection-changed', newItem);
    this.emit('change');
    return newItem;
  }

  updateItem(id, updates, record = true) {
    const item = this.project.items.find(i => i.id === id);
    if (!item) return;

    Object.assign(item, updates);

    if (record) {
      this.recordHistory();
    }

    this.emit('item-updated', item);
    this.emit('change');
  }

  removeItem(id) {
    const idx = this.project.items.findIndex(i => i.id === id);
    if (idx === -1) return;

    const removed = this.project.items.splice(idx, 1)[0];

    // Unassign any guests attached to this table
    this.project.guests.forEach(g => {
      if (g.tableId === id) {
        g.tableId = null;
        g.seatIndex = null;
      }
    });

    if (this.selectedItemId === id) {
      this.selectedItemId = null;
      this.emit('selection-changed', null);
    }

    this.recordHistory();
    this.emit('item-removed', removed);
    this.emit('change');
  }

  duplicateItem(id) {
    const original = this.project.items.find(i => i.id === id);
    if (!original) return null;

    const meta = getItemById(original.catalogId);
    if (!meta) return null;

    const newPos = {
      x: original.position[0] + 1.5,
      y: original.position[1],
      z: original.position[2] + 1.5
    };

    return this.addItem(meta, newPos, {
      name: `${original.name} (Copy)`,
      color: original.color,
      linenColor: original.linenColor,
      uplightColor: original.uplightColor,
      seats: original.seats,
      price: original.price
    });
  }

  /**
   * Fast Array Generator (Duplicate in MxN Grid)
   */
  generateArray(id, rows = 3, cols = 3, spacingX = 3.0, spacingZ = 3.0) {
    const original = this.project.items.find(i => i.id === id);
    if (!original) return [];

    const meta = getItemById(original.catalogId);
    if (!meta) return [];

    const startX = original.position[0];
    const startZ = original.position[2];
    const created = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === 0 && c === 0) continue; // Skip original
        const pos = {
          x: snap(startX + (c * spacingX), this.snapStep),
          y: original.position[1],
          z: snap(startZ + (r * spacingZ), this.snapStep)
        };
        const item = this.addItem(meta, pos, {
          color: original.color,
          linenColor: original.linenColor,
          uplightColor: original.uplightColor,
          seats: original.seats,
          price: original.price
        });
        created.push(item);
      }
    }
    return created;
  }

  selectItem(id) {
    if (this.selectedItemId === id) return;
    this.selectedItemId = id;
    const item = this.project.items.find(i => i.id === id) || null;
    this.emit('selection-changed', item);
  }

  getSelectedItem() {
    return this.project.items.find(i => i.id === this.selectedItemId) || null;
  }

  getNextTableNumber() {
    const tables = this.project.items.filter(i => {
      const meta = getItemById(i.catalogId);
      return meta && meta.hasSeats;
    });
    return tables.length + 1;
  }

  // --- VENUE ACTIONS ---
  updateVenue(venueConfig) {
    Object.assign(this.project.venue, venueConfig);
    this.recordHistory();
    this.emit('venue-updated', this.project.venue);
    this.emit('change');
  }

  setLightingMode(mode) {
    this.project.lightingMode = mode;
    this.emit('lighting-updated', mode);
    this.emit('change');
  }

  // --- GUEST MANAGEMENT ---
  addGuest(guest) {
    const newGuest = {
      id: generateId('guest'),
      name: guest.name || 'New Guest',
      tableId: guest.tableId || null,
      seatIndex: guest.seatIndex !== undefined ? guest.seatIndex : null,
      mealChoice: guest.mealChoice || 'Standard',
      isVip: !!guest.isVip,
      notes: guest.notes || ''
    };
    this.project.guests.push(newGuest);
    this.emit('guests-updated', this.project.guests);
    this.emit('change');
    return newGuest;
  }

  updateGuest(id, updates) {
    const guest = this.project.guests.find(g => g.id === id);
    if (!guest) return;
    Object.assign(guest, updates);
    this.emit('guests-updated', this.project.guests);
    this.emit('change');
  }

  removeGuest(id) {
    const idx = this.project.guests.findIndex(g => g.id === id);
    if (idx === -1) return;
    this.project.guests.splice(idx, 1);
    this.emit('guests-updated', this.project.guests);
    this.emit('change');
  }

  // --- PROJECT MANAGEMENT ---
  newProject() {
    this.project = {
      id: generateId('proj'),
      name: 'New Event Plan',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      venue: {
        width: 16,
        length: 24,
        height: 4.5,
        theme: 'ballroom',
        floorFinish: 'marble_light'
      },
      lightingMode: 'gala',
      items: [],
      guests: [],
      budget: {
        currency: 'USD',
        taxPercent: 8,
        discountPercent: 0
      }
    };
    this.selectedItemId = null;
    this.history.clear();
    this.recordHistory();
    this.emit('project-loaded', this.project);
    this.emit('change');
  }

  loadProject(projectData) {
    this.project = projectData;
    this.selectedItemId = null;
    this.history.clear();
    this.recordHistory();
    this.emit('project-loaded', this.project);
    this.emit('change');
  }

  // --- COMPUTED ANALYTICS & BOM ---
  getBillOfMaterials() {
    const map = new Map();

    this.project.items.forEach(item => {
      const cid = item.catalogId;
      if (!map.has(cid)) {
        map.set(cid, {
          catalogId: cid,
          name: item.name,
          category: item.category,
          quantity: 0,
          unitPrice: item.price,
          totalPrice: 0
        });
      }
      const entry = map.get(cid);
      entry.quantity += 1;
      entry.totalPrice = entry.quantity * entry.unitPrice;
    });

    const rows = Array.from(map.values()).sort((a, b) => b.totalPrice - a.totalPrice);
    const subtotal = rows.reduce((sum, r) => sum + r.totalPrice, 0);
    const tax = subtotal * (this.project.budget.taxPercent / 100);
    const discount = subtotal * (this.project.budget.discountPercent / 100);
    const total = subtotal + tax - discount;

    return {
      rows,
      subtotal,
      tax,
      discount,
      total,
      currency: this.project.budget.currency
    };
  }

  getCapacityStats() {
    let totalSeats = 0;
    this.project.items.forEach(item => {
      if (item.seats) {
        totalSeats += item.seats;
      }
    });

    const seatedGuests = this.project.guests.filter(g => g.tableId).length;
    const totalGuests = this.project.guests.length;

    return {
      totalSeats,
      totalGuests,
      seatedGuests,
      unseatedGuests: totalGuests - seatedGuests,
      occupancyRate: totalSeats > 0 ? Math.round((seatedGuests / totalSeats) * 100) : 0
    };
  }
}

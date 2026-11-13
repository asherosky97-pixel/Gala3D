import { getIcon } from './Icons.js';
import { getItemById } from '../assets/Catalog.js';

export class SeatingModal {
  constructor(store) {
    this.store = store;

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.id = 'modal-seating';
    document.body.appendChild(this.modalEl);

    this.selectedTableFilter = null;
    this.render();
  }

  render() {
    const stats = this.store.getCapacityStats();
    const tables = this.store.project.items.filter(i => {
      const meta = getItemById(i.catalogId);
      return meta && meta.hasSeats;
    });

    this.modalEl.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <div class="modal-title-group">
            <h3 class="modal-title">${getIcon('users')} Seating Chart & Guest Management</h3>
            <span class="modal-subtitle">${stats.seatedGuests} seated of ${stats.totalGuests} guests • Total Venue Capacity: ${stats.totalSeats} seats</span>
          </div>
          <button class="btn btn-icon btn-close-modal">${getIcon('x')}</button>
        </div>

        <div class="modal-body seating-body-layout">
          <!-- Left: Guest Roster -->
          <div class="seating-col-guests">
            <div class="guest-add-bar">
              <input type="text" id="inp-new-guest-name" placeholder="Guest Full Name..." />
              <select id="inp-new-guest-meal">
                <option value="Standard">Standard Meal</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Halal">Halal</option>
                <option value="Kosher">Kosher</option>
                <option value="Gluten-Free">Gluten-Free</option>
              </select>
              <label class="vip-checkbox-label">
                <input type="checkbox" id="inp-new-guest-vip" /> VIP
              </label>
              <button class="btn btn-primary btn-sm" id="btn-add-guest">${getIcon('plus')} Add</button>
            </div>

            <div class="guest-list-container" id="guest-list-items">
              ${this.renderGuestListRows()}
            </div>
          </div>

          <!-- Right: Table Seating Cards Grid -->
          <div class="seating-col-tables">
            <div class="tables-header-row">
              <h4 class="tables-section-title">Tables in Venue (${tables.length})</h4>
              <button class="btn btn-secondary btn-sm" id="btn-autoseat-all">
                ${getIcon('sparkles')} Auto-Seat Remaining
              </button>
            </div>

            <div class="table-cards-grid" id="seating-table-cards">
              ${this.renderTableCards(tables)}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary btn-close-modal">Close</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderGuestListRows() {
    const guests = this.store.project.guests;
    if (guests.length === 0) {
      return `<div class="empty-list-note"><p>No guests added yet. Type a name above to add guests to the roster.</p></div>`;
    }

    return guests.map(g => {
      const assignedTable = this.store.project.items.find(i => i.id === g.tableId);
      return `
        <div class="guest-row ${g.isVip ? 'vip-guest' : ''}">
          <div class="guest-info">
            <div class="guest-name-row">
              ${g.isVip ? `<span class="vip-star">★</span>` : ''}
              <strong>${g.name}</strong>
              <span class="meal-tag">${g.mealChoice}</span>
            </div>
            <div class="guest-assignment-tag">
              ${assignedTable ? `<span class="badge-seated">Seated at ${assignedTable.tableNumber || assignedTable.name}</span>` : `<span class="badge-unseated">Unassigned</span>`}
            </div>
          </div>
          <button class="btn btn-icon btn-sm btn-delete-guest" data-id="${g.id}" title="Remove Guest">${getIcon('trash')}</button>
        </div>
      `;
    }).join('');
  }

  renderTableCards(tables) {
    if (tables.length === 0) {
      return `<div class="empty-list-note"><p>No dining tables placed in the room yet. Drag tables from the catalog onto the floor.</p></div>`;
    }

    const unseatedGuests = this.store.project.guests.filter(g => !g.tableId);

    return tables.map(table => {
      const seatedAtThisTable = this.store.project.guests.filter(g => g.tableId === table.id);
      const capacity = table.seats || 8;
      const isFull = seatedAtThisTable.length >= capacity;

      return `
        <div class="table-seating-card ${isFull ? 'full' : ''}">
          <div class="table-card-head">
            <h5 class="table-card-title">${table.tableNumber || table.name}</h5>
            <span class="seat-badge ${isFull ? 'full' : ''}">${seatedAtThisTable.length} / ${capacity}</span>
          </div>

          <!-- Seated guest list -->
          <div class="seated-roster">
            ${seatedAtThisTable.map(guest => `
              <div class="seated-guest-pill">
                <span>${guest.isVip ? '★ ' : ''}${guest.name}</span>
                <button class="btn-unseat" data-guest="${guest.id}" title="Unseat Guest">${getIcon('x')}</button>
              </div>
            `).join('')}
          </div>

          <!-- Quick seat dropdown if space remains -->
          ${!isFull && unseatedGuests.length > 0 ? `
            <div class="quick-seat-row">
              <select class="seat-guest-select" data-table="${table.id}">
                <option value="">+ Assign Guest...</option>
                ${unseatedGuests.map(ug => `<option value="${ug.id}">${ug.isVip ? '★ ' : ''}${ug.name}</option>`).join('')}
              </select>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  bindEvents() {
    this.modalEl.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Add guest
    const addBtn = this.modalEl.querySelector('#btn-add-guest');
    const nameInp = this.modalEl.querySelector('#inp-new-guest-name');
    const mealInp = this.modalEl.querySelector('#inp-new-guest-meal');
    const vipInp = this.modalEl.querySelector('#inp-new-guest-vip');

    const handleAdd = () => {
      const name = nameInp.value.trim();
      if (!name) return;
      this.store.addGuest({
        name,
        mealChoice: mealInp.value,
        isVip: vipInp.checked
      });
      nameInp.value = '';
      vipInp.checked = false;
      this.render();
    };

    if (addBtn) addBtn.addEventListener('click', handleAdd);
    if (nameInp) nameInp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAdd();
    });

    // Delete guest
    this.modalEl.querySelectorAll('.btn-delete-guest').forEach(btn => {
      btn.addEventListener('click', () => {
        this.store.removeGuest(btn.dataset.id);
        this.render();
      });
    });

    // Unseat guest
    this.modalEl.querySelectorAll('.btn-unseat').forEach(btn => {
      btn.addEventListener('click', () => {
        this.store.updateGuest(btn.dataset.guest, { tableId: null, seatIndex: null });
        this.render();
      });
    });

    // Seat guest select dropdown
    this.modalEl.querySelectorAll('.seat-guest-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const guestId = sel.value;
        const tableId = sel.dataset.table;
        if (guestId && tableId) {
          this.store.updateGuest(guestId, { tableId: tableId });
          this.render();
        }
      });
    });

    // Auto-seat remaining
    const autoSeatBtn = this.modalEl.querySelector('#btn-autoseat-all');
    if (autoSeatBtn) {
      autoSeatBtn.addEventListener('click', () => {
        const tables = this.store.project.items.filter(i => {
          const meta = getItemById(i.catalogId);
          return meta && meta.hasSeats;
        });
        const unseated = this.store.project.guests.filter(g => !g.tableId);

        let uIdx = 0;
        tables.forEach(table => {
          const seated = this.store.project.guests.filter(g => g.tableId === table.id);
          const cap = table.seats || 8;
          const openSpots = cap - seated.length;
          for (let s = 0; s < openSpots && uIdx < unseated.length; s++) {
            this.store.updateGuest(unseated[uIdx].id, { tableId: table.id });
            uIdx++;
          }
        });
        this.render();
      });
    }
  }

  open(filterTableId = null) {
    this.selectedTableFilter = filterTableId;
    this.render();
    this.modalEl.classList.add('open');
  }

  close() {
    this.modalEl.classList.remove('open');
  }
}

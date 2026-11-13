import { getIcon } from './Icons.js';
import { formatCurrency } from '../utils/MathUtils.js';
import { Exporters } from '../utils/Exporters.js';

export class BudgetModal {
  constructor(store) {
    this.store = store;

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.id = 'modal-budget';
    document.body.appendChild(this.modalEl);

    this.render();
  }

  render() {
    const bom = this.store.getBillOfMaterials();
    const b = this.store.project.budget;

    this.modalEl.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <div class="modal-title-group">
            <h3 class="modal-title">${getIcon('dollarSign')} Bill of Materials & Rental Quote</h3>
            <span class="modal-subtitle">${this.store.project.name || 'Event Proposal'} • ${this.store.project.items.length} items on floor</span>
          </div>
          <button class="btn btn-icon btn-close-modal">${getIcon('x')}</button>
        </div>

        <div class="modal-body">
          <!-- Summary Header -->
          <div class="budget-settings-row">
            <div class="input-field-inline">
              <label>Currency:</label>
              <select id="inp-budget-currency">
                <option value="USD" ${b.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                <option value="EUR" ${b.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                <option value="GBP" ${b.currency === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                <option value="CAD" ${b.currency === 'CAD' ? 'selected' : ''}>CAD ($)</option>
                <option value="AUD" ${b.currency === 'AUD' ? 'selected' : ''}>AUD ($)</option>
                <option value="KES" ${b.currency === 'KES' ? 'selected' : ''}>KES (KSh)</option>
                <option value="AED" ${b.currency === 'AED' ? 'selected' : ''}>AED (د.إ)</option>
              </select>
            </div>

            <div class="input-field-inline">
              <label>Tax Rate (%):</label>
              <input type="number" id="inp-budget-tax" min="0" max="30" step="0.5" value="${b.taxPercent}" />
            </div>

            <div class="input-field-inline">
              <label>Discount (%):</label>
              <input type="number" id="inp-budget-discount" min="0" max="50" step="1" value="${b.discountPercent}" />
            </div>
          </div>

          <!-- Items Table -->
          <div class="bom-table-wrapper">
            <table class="bom-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Item Description</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Unit Rate</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${bom.rows.length === 0 ? `
                  <tr>
                    <td colspan="5" class="text-center py-4">No items placed in this event plan yet.</td>
                  </tr>
                ` : bom.rows.map(r => `
                  <tr>
                    <td><span class="badge badge-cat">${r.category}</span></td>
                    <td><strong>${r.name}</strong></td>
                    <td class="text-center"><strong>${r.quantity}</strong></td>
                    <td class="text-right">${formatCurrency(r.unitPrice, b.currency)}</td>
                    <td class="text-right font-mono">${formatCurrency(r.totalPrice, b.currency)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totals Calculation Card -->
          <div class="bom-totals-card">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span class="totals-val">${formatCurrency(bom.subtotal, b.currency)}</span>
            </div>
            <div class="totals-row">
              <span>Estimated Tax (${b.taxPercent}%):</span>
              <span class="totals-val">${formatCurrency(bom.tax, b.currency)}</span>
            </div>
            ${bom.discount > 0 ? `
              <div class="totals-row discount">
                <span>Discount (${b.discountPercent}%):</span>
                <span class="totals-val">-${formatCurrency(bom.discount, b.currency)}</span>
              </div>
            ` : ''}
            <div class="totals-row grand-total">
              <span>Estimated Grand Total:</span>
              <span class="totals-val">${formatCurrency(bom.total, b.currency)}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="btn-export-csv">${getIcon('download')} Export CSV</button>
          <button class="btn btn-secondary" id="btn-print-quote">${getIcon('fileText')} Print Proposal</button>
          <button class="btn btn-primary btn-close-modal">Done</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.modalEl.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Settings update
    const currSelect = this.modalEl.querySelector('#inp-budget-currency');
    const taxInp = this.modalEl.querySelector('#inp-budget-tax');
    const discInp = this.modalEl.querySelector('#inp-budget-discount');

    const updateBudget = () => {
      this.store.project.budget.currency = currSelect.value;
      this.store.project.budget.taxPercent = parseFloat(taxInp.value) || 0;
      this.store.project.budget.discountPercent = parseFloat(discInp.value) || 0;
      this.store.isDirty = true;
      this.render();
    };

    if (currSelect) currSelect.addEventListener('change', updateBudget);
    if (taxInp) taxInp.addEventListener('change', updateBudget);
    if (discInp) discInp.addEventListener('change', updateBudget);

    // Export CSV
    const csvBtn = this.modalEl.querySelector('#btn-export-csv');
    if (csvBtn) {
      csvBtn.addEventListener('click', () => {
        const bom = this.store.getBillOfMaterials();
        Exporters.exportBOMToCSV(bom, this.store.project.name);
      });
    }

    // Print
    const printBtn = this.modalEl.querySelector('#btn-print-quote');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  open() {
    this.render();
    this.modalEl.classList.add('open');
  }

  close() {
    this.modalEl.classList.remove('open');
  }
}

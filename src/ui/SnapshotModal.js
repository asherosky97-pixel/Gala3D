import { getIcon } from './Icons.js';
import { Exporters } from '../utils/Exporters.js';

export class SnapshotModal {
  constructor(engine, store) {
    this.engine = engine;
    this.store = store;

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.id = 'modal-snapshot';
    document.body.appendChild(this.modalEl);

    this.targetResolution = '1440p';
    this.includeWatermark = true;
    this.previewDataUrl = null;

    this.render();
  }

  getDimensions() {
    switch (this.targetResolution) {
      case '4K':
        return { w: 3840, h: 2160, label: '4K Ultra HD (3840 × 2160)' };
      case '1080p':
        return { w: 1920, h: 1080, label: 'Full HD (1920 × 1080)' };
      case '1440p':
      default:
        return { w: 2560, h: 1440, label: '2K QHD (2560 × 1440)' };
    }
  }

  generateSnapshot() {
    const dims = this.getDimensions();
    const rawUrl = this.engine.captureSnapshot(dims.w, dims.h);

    if (!this.includeWatermark) {
      this.previewDataUrl = rawUrl;
      this.updatePreviewImage();
      return;
    }

    // Add subtle luxury watermark in bottom-left
    const canvas = document.createElement('canvas');
    canvas.width = dims.w;
    canvas.height = dims.h;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, dims.w, dims.h);

      // Watermark text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('Gala3D', 40, dims.h - 40);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.font = '22px sans-serif';
      ctx.fillText(`• ${this.store.project.name || 'Event Design'}`, 170, dims.h - 40);

      this.previewDataUrl = canvas.toDataURL('image/png');
      this.updatePreviewImage();
    };
    img.src = rawUrl;
  }

  updatePreviewImage() {
    const previewImg = this.modalEl.querySelector('#snapshot-preview-img');
    if (previewImg && this.previewDataUrl) {
      previewImg.src = this.previewDataUrl;
    }
  }

  render() {
    const dims = this.getDimensions();

    this.modalEl.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <div class="modal-title-group">
            <h3 class="modal-title">${getIcon('camera')} High-Resolution 4K Snapshot Render</h3>
            <span class="modal-subtitle">Generate presentation-ready photo renders of your current view</span>
          </div>
          <button class="btn btn-icon btn-close-modal">${getIcon('x')}</button>
        </div>

        <div class="modal-body">
          <div class="snapshot-controls-row">
            <div class="input-field-inline">
              <label>Resolution Quality:</label>
              <select id="inp-snapshot-res">
                <option value="1080p" ${this.targetResolution === '1080p' ? 'selected' : ''}>Full HD (1920 × 1080)</option>
                <option value="1440p" ${this.targetResolution === '1440p' ? 'selected' : ''}>2K QHD (2560 × 1440) - Recommended</option>
                <option value="4K" ${this.targetResolution === '4K' ? 'selected' : ''}>4K Ultra HD (3840 × 2160)</option>
              </select>
            </div>

            <label class="checkbox-label">
              <input type="checkbox" id="inp-snapshot-watermark" ${this.includeWatermark ? 'checked' : ''} />
              Include Gala3D branding badge
            </label>

            <button class="btn btn-secondary btn-sm" id="btn-re-render">${getIcon('sparkles')} Re-render View</button>
          </div>

          <div class="snapshot-preview-viewport">
            <img id="snapshot-preview-img" alt="Snapshot Preview" src="" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary btn-close-modal">Cancel</button>
          <button class="btn btn-primary" id="btn-download-snapshot">${getIcon('download')} Download Render (PNG)</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.modalEl.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    const resSelect = this.modalEl.querySelector('#inp-snapshot-res');
    if (resSelect) {
      resSelect.addEventListener('change', () => {
        this.targetResolution = resSelect.value;
        this.generateSnapshot();
      });
    }

    const wmCheck = this.modalEl.querySelector('#inp-snapshot-watermark');
    if (wmCheck) {
      wmCheck.addEventListener('change', () => {
        this.includeWatermark = wmCheck.checked;
        this.generateSnapshot();
      });
    }

    const reRenderBtn = this.modalEl.querySelector('#btn-re-render');
    if (reRenderBtn) {
      reRenderBtn.addEventListener('click', () => {
        this.generateSnapshot();
      });
    }

    const downloadBtn = this.modalEl.querySelector('#btn-download-snapshot');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!this.previewDataUrl) return;
        const filename = `${(this.store.project.name || 'Gala3D_Snapshot').replace(/[^a-z0-9]/gi, '_')}_${this.targetResolution}.png`;
        const link = document.createElement('a');
        link.href = this.previewDataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.close();
      });
    }
  }

  open() {
    this.render();
    this.modalEl.classList.add('open');
    // Generate fresh snapshot upon opening
    setTimeout(() => this.generateSnapshot(), 50);
  }

  close() {
    this.modalEl.classList.remove('open');
  }
}

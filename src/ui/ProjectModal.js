import { getIcon } from './Icons.js';
import { Storage } from '../state/Storage.js';
import { Exporters } from '../utils/Exporters.js';

export class ProjectModal {
  constructor(store) {
    this.store = store;

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.id = 'modal-projects';
    document.body.appendChild(this.modalEl);

    this.projectsList = [];
    this.render();
  }

  async loadProjects() {
    this.projectsList = await Storage.listProjects();
    this.render();
  }

  render() {
    this.modalEl.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <div class="modal-title-group">
            <h3 class="modal-title">${getIcon('folder')} Saved Local Projects</h3>
            <span class="modal-subtitle">Stored securely on your device (works 100% offline)</span>
          </div>
          <button class="btn btn-icon btn-close-modal">${getIcon('x')}</button>
        </div>

        <div class="modal-body">
          <div class="projects-actions-bar">
            <button class="btn btn-primary btn-sm" id="btn-modal-new-proj">${getIcon('plus')} New Event Plan</button>
            <label class="btn btn-secondary btn-sm file-upload-label">
              ${getIcon('upload')} Import .gala3d File
              <input type="file" id="modal-import-file" accept=".gala3d,.json" style="display:none;" />
            </label>
          </div>

          <div class="projects-list-grid" id="projects-grid">
            ${this.projectsList.length === 0 ? `
              <div class="empty-list-note">
                <p>No saved projects found in local storage yet.</p>
              </div>
            ` : this.projectsList.map(proj => `
              <div class="project-card ${proj.id === this.store.project.id ? 'active-project' : ''}" data-id="${proj.id}">
                <div class="project-card-header">
                  <h4 class="project-card-title">${proj.name || 'Untitled Event'}</h4>
                  ${proj.id === this.store.project.id ? `<span class="badge badge-active">Current</span>` : ''}
                </div>
                <div class="project-card-meta">
                  <span>${proj.venue ? `${proj.venue.width}m × ${proj.venue.length}m (${proj.venue.theme})` : 'Custom Venue'}</span>
                  <span>${proj.items ? `${proj.items.length} items placed` : 'Draft'}</span>
                  <span>Modified: ${new Date(proj.updatedAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div class="project-card-actions">
                  <button class="btn btn-primary btn-sm btn-load-proj" data-id="${proj.id}">Open</button>
                  <button class="btn btn-secondary btn-sm btn-export-proj" data-id="${proj.id}" title="Export .gala3d file">${getIcon('download')}</button>
                  <button class="btn btn-icon btn-sm btn-delete-proj" data-id="${proj.id}" title="Delete">${getIcon('trash')}</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary btn-close-modal">Close</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.modalEl.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // New project
    const newBtn = this.modalEl.querySelector('#btn-modal-new-proj');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        this.store.newProject();
        this.close();
      });
    }

    // Load project
    this.modalEl.querySelectorAll('.btn-load-proj').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const proj = await Storage.getProject(id);
        if (proj) {
          this.store.loadProject(proj);
          this.close();
        }
      });
    });

    // Export single project
    this.modalEl.querySelectorAll('.btn-export-proj').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const proj = await Storage.getProject(id);
        if (proj) {
          Exporters.exportProjectFile(proj);
        }
      });
    });

    // Delete project
    this.modalEl.querySelectorAll('.btn-delete-proj').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this saved project?')) {
          await Storage.deleteProject(id);
          this.loadProjects();
        }
      });
    });

    // Import file
    const importInput = this.modalEl.querySelector('#modal-import-file');
    if (importInput) {
      importInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
          try {
            const projectData = await Exporters.importProjectFile(e.target.files[0]);
            this.store.loadProject(projectData);
            this.close();
          } catch (err) {
            alert('Failed to import project: ' + err.message);
          }
        }
      });
    }
  }

  async open() {
    await this.loadProjects();
    this.modalEl.classList.add('open');
  }

  close() {
    this.modalEl.classList.remove('open');
  }
}

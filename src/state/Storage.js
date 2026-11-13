/**
 * Gala3D - Local-First Offline Storage Engine
 * Uses IndexedDB with LocalStorage fallback for persistent storage of projects and settings.
 */

const DB_NAME = 'Gala3D_Database';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_SETTINGS = 'settings';

export class Storage {
  static dbPromise = null;

  static async getDB() {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => {
        console.warn('IndexedDB error, falling back to LocalStorage:', event.target.error);
        resolve(null);
      };
    });

    return this.dbPromise;
  }

  /**
   * Save a project to local database
   */
  static async saveProject(project) {
    const db = await this.getDB();
    project.updatedAt = Date.now();

    if (db) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PROJECTS, 'readwrite');
        const store = tx.objectStore(STORE_PROJECTS);
        store.put(project);
        tx.oncomplete = () => resolve(project);
        tx.onerror = (e) => reject(e.target.error);
      });
    } else {
      // LocalStorage fallback
      try {
        const key = `gala3d_proj_${project.id}`;
        localStorage.setItem(key, JSON.stringify(project));
        this.updateLocalStorageIndex(project.id, project.name, project.updatedAt);
        return project;
      } catch (err) {
        console.error('LocalStorage save error:', err);
        return project;
      }
    }
  }

  /**
   * Retrieve a project by ID
   */
  static async getProject(id) {
    const db = await this.getDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PROJECTS, 'readonly');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } else {
      const raw = localStorage.getItem(`gala3d_proj_${id}`);
      return raw ? JSON.parse(raw) : null;
    }
  }

  /**
   * List all stored projects
   */
  static async listProjects() {
    const db = await this.getDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PROJECTS, 'readonly');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          resolve(list);
        };
        req.onerror = () => resolve([]);
      });
    } else {
      try {
        const idx = JSON.parse(localStorage.getItem('gala3d_proj_index') || '[]');
        return idx;
      } catch (e) {
        return [];
      }
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(id) {
    const db = await this.getDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PROJECTS, 'readwrite');
        const store = tx.objectStore(STORE_PROJECTS);
        store.delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } else {
      localStorage.removeItem(`gala3d_proj_${id}`);
      try {
        let idx = JSON.parse(localStorage.getItem('gala3d_proj_index') || '[]');
        idx = idx.filter(p => p.id !== id);
        localStorage.setItem('gala3d_proj_index', JSON.stringify(idx));
      } catch (e) {}
      return true;
    }
  }

  static updateLocalStorageIndex(id, name, updatedAt) {
    try {
      let idx = JSON.parse(localStorage.getItem('gala3d_proj_index') || '[]');
      idx = idx.filter(p => p.id !== id);
      idx.unshift({ id, name, updatedAt });
      localStorage.setItem('gala3d_proj_index', JSON.stringify(idx.slice(0, 20)));
    } catch (e) {}
  }
}

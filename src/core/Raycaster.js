import * as THREE from 'three';
import { snapVector } from '../utils/MathUtils.js';

/**
 * Spatial Raycaster & Interaction Handler
 * Manages object selection, ground plane intersection, and drag-and-drop placement.
 */
export class RaycasterHandler {
  constructor(engine, onSelectCallback, onPlaceCallback) {
    this.engine = engine;
    this.onSelectCallback = onSelectCallback;
    this.onPlaceCallback = onPlaceCallback;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.planeIntersectPoint = new THREE.Vector3();

    this.isDraggingCatalogItem = false;
    this.catalogDragItemMeta = null;
    this.ghostMesh = null;
    this.gridSnapEnabled = true;
    this.gridSnapStep = 0.5;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const dom = this.engine.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    dom.addEventListener('pointermove', (e) => this.onPointerMove(e));

    // Drag-over from external HTML catalog cards
    dom.addEventListener('dragover', (e) => this.onDragOver(e));
    dom.addEventListener('drop', (e) => this.onDrop(e));
  }

  updateMouseCoords(clientX, clientY) {
    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  getGroundIntersection(clientX, clientY) {
    this.updateMouseCoords(clientX, clientY);
    this.raycaster.setFromCamera(this.mouse, this.engine.camera);
    const hit = this.raycaster.ray.intersectPlane(this.groundPlane, this.planeIntersectPoint);
    if (!hit) return null;

    const pt = this.planeIntersectPoint.clone();
    if (this.gridSnapEnabled) {
      snapVector(pt, this.gridSnapStep);
    }
    return pt;
  }

  onPointerDown(e) {
    // Left click only, and not when using transform gizmo
    if (e.button !== 0 || this.engine.transformControls.dragging) return;

    this.updateMouseCoords(e.clientX, e.clientY);
    this.raycaster.setFromCamera(this.mouse, this.engine.camera);

    // Raycast placed items
    const hits = this.raycaster.intersectObjects(this.engine.itemsGroup.children, true);

    if (hits.length > 0) {
      // Find top-level placed item group
      let selectedGroup = hits[0].object;
      while (selectedGroup.parent && selectedGroup.parent !== this.engine.itemsGroup) {
        selectedGroup = selectedGroup.parent;
      }
      if (this.onSelectCallback) {
        this.onSelectCallback(selectedGroup);
      }
    } else {
      // Clicked on empty floor or outside -> deselect
      if (this.onSelectCallback) {
        this.onSelectCallback(null);
      }
    }
  }

  onPointerMove(e) {
    if (this.ghostMesh) {
      const pt = this.getGroundIntersection(e.clientX, e.clientY);
      if (pt) {
        this.ghostMesh.position.copy(pt);
      }
    }
  }

  onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  onDrop(e) {
    e.preventDefault();
    const itemDataRaw = e.dataTransfer.getData('application/gala3d-item');
    if (!itemDataRaw) return;

    try {
      const itemMeta = JSON.parse(itemDataRaw);
      const groundPos = this.getGroundIntersection(e.clientX, e.clientY);
      if (groundPos && this.onPlaceCallback) {
        this.onPlaceCallback(itemMeta, groundPos);
      }
    } catch (err) {
      console.error('Failed to parse dropped item metadata:', err);
    }
  }

  setSnap(enabled, step = 0.5) {
    this.gridSnapEnabled = enabled;
    this.gridSnapStep = step;
  }
}

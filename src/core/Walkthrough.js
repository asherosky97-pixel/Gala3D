import * as THREE from 'three';

/**
 * First-Person Walkthrough ("Guest Eye" View)
 * Experience the venue layout at real human eye level (1.7m).
 */
export class Walkthrough {
  constructor(camera, domElement, venue) {
    this.camera = camera;
    this.domElement = domElement;
    this.venue = venue;

    this.enabled = false;
    this.eyeHeight = 1.7; // 1.7 meters
    this.moveSpeed = 4.0; // Meters per second

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };

    this.isDragging = false;
    this.prevPointerX = 0;
    this.prevPointerY = 0;

    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.enabled) return;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
      }
    });

    this.domElement.addEventListener('pointerdown', (e) => {
      if (!this.enabled) return;
      this.isDragging = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.enabled || !this.isDragging) return;
      const dx = e.clientX - this.prevPointerX;
      const dy = e.clientY - this.prevPointerY;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;

      const sensitivity = 0.0025;
      this.euler.y -= dx * sensitivity;
      this.euler.x -= dy * sensitivity;
      // Clamp pitch so camera doesn't flip
      this.euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.euler.x));

      this.camera.quaternion.setFromEuler(this.euler);
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });
  }

  start(initialPosition = null) {
    this.enabled = true;
    if (initialPosition) {
      this.camera.position.set(initialPosition.x, this.eyeHeight, initialPosition.z);
    } else {
      // Start near entrance (+Z end) looking into the ballroom (-Z)
      const bounds = this.venue.getBounds();
      this.camera.position.set(0, this.eyeHeight, bounds.maxZ - 2);
      this.euler.set(0, Math.PI, 0, 'YXZ');
      this.camera.quaternion.setFromEuler(this.euler);
    }
  }

  stop() {
    this.enabled = false;
    this.keys.forward = false;
    this.keys.backward = false;
    this.keys.left = false;
    this.keys.right = false;
  }

  update(delta) {
    if (!this.enabled) return;

    this.direction.z = Number(this.keys.forward) - Number(this.keys.backward);
    this.direction.x = Number(this.keys.right) - Number(this.keys.left);
    this.direction.normalize();

    // Move in camera look direction on XZ plane
    if (this.keys.forward || this.keys.backward) {
      const forwardVec = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.euler.y, 0));
      this.camera.position.addScaledVector(forwardVec, this.direction.z * this.moveSpeed * delta);
    }
    if (this.keys.left || this.keys.right) {
      const rightVec = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, this.euler.y, 0));
      this.camera.position.addScaledVector(rightVec, this.direction.x * this.moveSpeed * delta);
    }

    // Keep camera at exact human eye height
    this.camera.position.y = this.eyeHeight;

    // Room boundary constraint
    const bounds = this.venue.getBounds();
    const margin = 0.6;
    this.camera.position.x = Math.max(bounds.minX + margin, Math.min(bounds.maxX - margin, this.camera.position.x));
    this.camera.position.z = Math.max(bounds.minZ + margin, Math.min(bounds.maxZ - margin, this.camera.position.z));
  }
}

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { Venue } from './Venue.js';
import { Lighting } from './Lighting.js';
import { Walkthrough } from './Walkthrough.js';

export const VIEW_MODES = {
  MODE_3D: '3d',
  MODE_2D: '2d',
  MODE_WALKTHROUGH: 'walkthrough'
};

export class Engine {
  constructor(container) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true // Required for 4K snapshot and canvas capture
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // 3. Dual Cameras
    const aspect = this.container.clientWidth / this.container.clientHeight;

    // Perspective Camera (3D Orbit & Walkthrough)
    this.perspectiveCamera = new THREE.PerspectiveCamera(50, aspect, 0.1, 200);
    this.perspectiveCamera.position.set(0, 18, 26);

    // Orthographic Camera (2D CAD Blueprint top-down view)
    const frustumSize = 30;
    this.orthographicCamera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      200
    );
    this.orthographicCamera.position.set(0, 50, 0);
    this.orthographicCamera.lookAt(0, 0, 0);

    // Active Camera reference
    this.camera = this.perspectiveCamera;
    this.viewMode = VIEW_MODES.MODE_3D;

    // 4. Controls
    this.orbitControls = new OrbitControls(this.perspectiveCamera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.08;
    this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera clipping below floor
    this.orbitControls.minDistance = 2;
    this.orbitControls.maxDistance = 80;
    this.orbitControls.target.set(0, 0, 0);

    // 2D CAD Orbit Controls (for orthographic camera)
    this.cadControls = new OrbitControls(this.orthographicCamera, this.renderer.domElement);
    this.cadControls.enableDamping = true;
    this.cadControls.dampingFactor = 0.08;
    this.cadControls.enableRotate = false; // Strictly 2D top-down pan and zoom
    this.cadControls.target.set(0, 0, 0);
    this.cadControls.enabled = false;

    // 5. Venue & Lighting
    this.venue = new Venue(this.scene);
    this.lighting = new Lighting(this.scene, this.venue);

    // 6. Walkthrough Mode
    this.walkthrough = new Walkthrough(this.perspectiveCamera, this.renderer.domElement, this.venue);

    // 7. TransformControls Gizmo for 3D manipulation
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.size = 0.85;
    this.transformControls.setTranslationSnap(0.5); // Default 0.5m snap
    this.transformControls.setRotationSnap((15 * Math.PI) / 180); // 15 deg snap
    this.scene.add(this.transformControls.getHelper());

    // Disable orbit controls while dragging gizmo
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.orbitControls.enabled = !event.value && this.viewMode === VIEW_MODES.MODE_3D;
      this.cadControls.enabled = !event.value && this.viewMode === VIEW_MODES.MODE_2D;
    });

    // 8. Items Root Group (holds all placed furniture and decor)
    this.itemsGroup = new THREE.Group();
    this.itemsGroup.name = 'placed_items_root';
    this.scene.add(this.itemsGroup);

    // 9. CAD Grid Overlay (visible in 2D mode or when editing)
    this.createCadGrid();

    // Loop Clock
    this.clock = new THREE.Clock();
    this.isRendering = true;

    // Resize listener
    window.addEventListener('resize', () => this.onWindowResize());

    // Start render loop
    this.animate();
  }

  createCadGrid() {
    // Metric grid helper
    const bounds = this.venue.getBounds();
    const size = Math.max(bounds.width, bounds.length) * 1.5;
    const divisions = Math.round(size); // 1-meter squares

    this.gridHelper = new THREE.GridHelper(size, divisions, 0x3b82f6, 0x94a3b8);
    this.gridHelper.position.y = 0.005; // Slightly above floor to avoid z-fighting
    this.gridHelper.visible = false;
    this.scene.add(this.gridHelper);
  }

  setViewMode(mode) {
    this.viewMode = mode;

    if (mode === VIEW_MODES.MODE_2D) {
      // Switch to 2D Top-Down CAD Blueprint
      this.walkthrough.stop();
      this.orbitControls.enabled = false;
      this.cadControls.enabled = true;

      // Fit orthographic camera to current venue bounds
      const bounds = this.venue.getBounds();
      const aspect = this.container.clientWidth / this.container.clientHeight;
      const maxDim = Math.max(bounds.width / aspect, bounds.length) * 1.25;

      this.orthographicCamera.left = (-maxDim * aspect) / 2;
      this.orthographicCamera.right = (maxDim * aspect) / 2;
      this.orthographicCamera.top = maxDim / 2;
      this.orthographicCamera.bottom = -maxDim / 2;
      this.orthographicCamera.position.set(0, 50, 0);
      this.orthographicCamera.lookAt(0, 0, 0);
      this.orthographicCamera.updateProjectionMatrix();

      this.camera = this.orthographicCamera;
      this.transformControls.camera = this.orthographicCamera;

      // Show CAD measurement grid
      this.gridHelper.visible = true;

      // Set transform controls mode to translate on XZ plane
      this.transformControls.showY = false;

    } else if (mode === VIEW_MODES.MODE_WALKTHROUGH) {
      // Switch to First-Person Walkthrough
      this.cadControls.enabled = false;
      this.orbitControls.enabled = false;
      this.camera = this.perspectiveCamera;
      this.transformControls.detach();
      this.gridHelper.visible = false;

      this.walkthrough.start();

    } else {
      // Switch to 3D Orbit View
      this.walkthrough.stop();
      this.cadControls.enabled = false;
      this.orbitControls.enabled = true;

      this.camera = this.perspectiveCamera;
      this.transformControls.camera = this.perspectiveCamera;
      this.transformControls.showY = true;
      this.gridHelper.visible = false;
    }
  }

  attachGizmo(object3d) {
    if (!object3d || this.viewMode === VIEW_MODES.MODE_WALKTHROUGH) {
      this.transformControls.detach();
      return;
    }
    this.transformControls.attach(object3d);
  }

  detachGizmo() {
    this.transformControls.detach();
  }

  setGizmoMode(mode) {
    if (['translate', 'rotate', 'scale'].includes(mode)) {
      this.transformControls.setMode(mode);
    }
  }

  setGizmoSnap(enabled, step = 0.5) {
    if (enabled) {
      this.transformControls.setTranslationSnap(step);
      this.transformControls.setRotationSnap((15 * Math.PI) / 180);
    } else {
      this.transformControls.setTranslationSnap(null);
      this.transformControls.setRotationSnap(null);
    }
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    const aspect = width / height;

    // Perspective Camera
    this.perspectiveCamera.aspect = aspect;
    this.perspectiveCamera.updateProjectionMatrix();

    // Orthographic Camera
    const bounds = this.venue.getBounds();
    const maxDim = Math.max(bounds.width / aspect, bounds.length) * 1.25;
    this.orthographicCamera.left = (-maxDim * aspect) / 2;
    this.orthographicCamera.right = (maxDim * aspect) / 2;
    this.orthographicCamera.top = maxDim / 2;
    this.orthographicCamera.bottom = -maxDim / 2;
    this.orthographicCamera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * High-Resolution Snapshot Generator (up to 4K 3840x2160)
   */
  captureSnapshot(width = 2560, height = 1440) {
    const origWidth = this.container.clientWidth;
    const origHeight = this.container.clientHeight;
    const origAspect = origWidth / origHeight;

    // Temporarily hide transform gizmo and CAD grid for a pristine photo render
    const gizmoVisible = this.transformControls.getHelper().visible;
    const gridVisible = this.gridHelper.visible;
    this.transformControls.getHelper().visible = false;
    this.gridHelper.visible = false;

    // Resize renderer to high-res target
    this.renderer.setSize(width, height, false);
    if (this.camera.isPerspectiveCamera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');

    // Restore original size and visibility
    this.renderer.setSize(origWidth, origHeight, false);
    if (this.camera.isPerspectiveCamera) {
      this.camera.aspect = origAspect;
      this.camera.updateProjectionMatrix();
    }
    this.transformControls.getHelper().visible = gizmoVisible;
    this.gridHelper.visible = gridVisible;
    this.renderer.render(this.scene, this.camera);

    return dataUrl;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.isRendering) return;

    const delta = this.clock.getDelta();

    // Update controls
    if (this.viewMode === VIEW_MODES.MODE_3D) {
      this.orbitControls.update();
    } else if (this.viewMode === VIEW_MODES.MODE_2D) {
      this.cadControls.update();
    } else if (this.viewMode === VIEW_MODES.MODE_WALKTHROUGH) {
      this.walkthrough.update(delta);
    }

    // Render active camera
    this.renderer.render(this.scene, this.camera);
  }
}

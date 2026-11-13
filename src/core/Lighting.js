import * as THREE from 'three';

export const LIGHTING_MODES = [
  { id: 'day', name: 'Daylight', icon: 'sun', desc: 'Bright, natural sunlight with soft shadows' },
  { id: 'sunset', name: 'Golden Hour', icon: 'sunset', desc: 'Warm amber sunset with dramatic golden glow' },
  { id: 'gala', name: 'Gala Night', icon: 'moon', desc: 'Atmospheric evening ballroom with warm spotlighting' },
  { id: 'party', name: 'Party Uplights', icon: 'sparkles', desc: 'Saturated magenta & cyan nightlife ambience' }
];

export class Lighting {
  constructor(scene, venue) {
    this.scene = scene;
    this.venue = venue;
    this.group = new THREE.Group();
    this.group.name = 'lighting_root';
    this.scene.add(this.group);

    this.currentMode = 'gala';

    // Core lights
    this.ambientLight = null;
    this.sunLight = null;
    this.hemisphereLight = null;
    this.ceilingLights = [];

    this.init();
    this.setMode('gala');
  }

  init() {
    // 1. Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.group.add(this.ambientLight);

    // 2. Hemisphere Light (sky vs ground bounce)
    this.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    this.group.add(this.hemisphereLight);

    // 3. Directional Sun/Key Light
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.bias = -0.0005;
    this.updateShadowBounds();
    this.group.add(this.sunLight);

    // 4. Subtle Ceiling Downlights array for ballroom feel
    this.createCeilingDownlights();
  }

  updateShadowBounds() {
    if (!this.sunLight || !this.venue) return;
    const bounds = this.venue.getBounds();
    const maxDim = Math.max(bounds.width, bounds.length) * 0.8;

    this.sunLight.shadow.camera.left = -maxDim;
    this.sunLight.shadow.camera.right = maxDim;
    this.sunLight.shadow.camera.top = maxDim;
    this.sunLight.shadow.camera.bottom = -maxDim;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 80;
    this.sunLight.shadow.camera.updateProjectionMatrix();
  }

  createCeilingDownlights() {
    this.ceilingLights.forEach(l => this.group.remove(l));
    this.ceilingLights = [];

    const bounds = this.venue.getBounds();
    const rows = 3;
    const cols = 4;
    const h = this.venue.height;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -bounds.width / 2 + ((c + 0.5) * (bounds.width / cols));
        const z = -bounds.length / 2 + ((r + 0.5) * (bounds.length / rows));

        const downlight = new THREE.PointLight(0xfff1dc, 0.5, 9, 1.5);
        downlight.position.set(x, h - 0.2, z);
        this.group.add(downlight);
        this.ceilingLights.push(downlight);
      }
    }
  }

  setMode(modeId) {
    this.currentMode = modeId;

    switch (modeId) {
      case 'day':
        this.scene.background = new THREE.Color(0xdcebf8);
        this.ambientLight.color.setHex(0xffffff);
        this.ambientLight.intensity = 0.65;

        this.hemisphereLight.color.setHex(0xddeeff);
        this.hemisphereLight.groundColor.setHex(0x99aa88);
        this.hemisphereLight.intensity = 0.5;

        this.sunLight.color.setHex(0xfffaed);
        this.sunLight.intensity = 1.3;
        this.sunLight.position.set(15, 25, 20);

        this.ceilingLights.forEach(l => { l.intensity = 0.1; });
        break;

      case 'sunset':
        this.scene.background = new THREE.Color(0xfb923c).lerp(new THREE.Color(0x312e81), 0.5);
        this.ambientLight.color.setHex(0xfeb272);
        this.ambientLight.intensity = 0.45;

        this.hemisphereLight.color.setHex(0xf97316);
        this.hemisphereLight.groundColor.setHex(0x431407);
        this.hemisphereLight.intensity = 0.4;

        this.sunLight.color.setHex(0xf97316);
        this.sunLight.intensity = 1.4;
        this.sunLight.position.set(30, 8, -25);

        this.ceilingLights.forEach(l => {
          l.color.setHex(0xffedd5);
          l.intensity = 0.35;
        });
        break;

      case 'party':
        this.scene.background = new THREE.Color(0x0a0a14);
        this.ambientLight.color.setHex(0x3b0764);
        this.ambientLight.intensity = 0.25;

        this.hemisphereLight.color.setHex(0x8b5cf6);
        this.hemisphereLight.groundColor.setHex(0x0284c7);
        this.hemisphereLight.intensity = 0.3;

        this.sunLight.color.setHex(0x06b6d4);
        this.sunLight.intensity = 0.4;
        this.sunLight.position.set(-10, 18, 10);

        this.ceilingLights.forEach((l, idx) => {
          l.color.setHex(idx % 2 === 0 ? 0xd946ef : 0x06b6d4);
          l.intensity = 0.8;
        });
        break;

      case 'gala':
      default:
        this.scene.background = new THREE.Color(0x0f172a);
        this.ambientLight.color.setHex(0x334155);
        this.ambientLight.intensity = 0.35;

        this.hemisphereLight.color.setHex(0x64748b);
        this.hemisphereLight.groundColor.setHex(0x1e293b);
        this.hemisphereLight.intensity = 0.25;

        this.sunLight.color.setHex(0xfef08a);
        this.sunLight.intensity = 0.6;
        this.sunLight.position.set(12, 22, 14);

        this.ceilingLights.forEach(l => {
          l.color.setHex(0xffedd5);
          l.intensity = 0.6;
        });
        break;
    }
  }

  onVenueResize() {
    this.updateShadowBounds();
    this.createCeilingDownlights();
    this.setMode(this.currentMode);
  }
}

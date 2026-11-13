import * as THREE from 'three';
import { TextureGenerator } from '../assets/TextureGenerator.js';

export const VENUE_THEMES = [
  { id: 'ballroom', name: 'Grand Ballroom', defaultFloor: 'marble_light' },
  { id: 'barn', name: 'Rustic Barn', defaultFloor: 'wood' },
  { id: 'tent', name: 'Marquee Tent', defaultFloor: 'wood' },
  { id: 'garden', name: 'Outdoor Garden Lawn', defaultFloor: 'grass' },
  { id: 'loft', name: 'Industrial Loft', defaultFloor: 'concrete' }
];

export const FLOOR_FINISHES = [
  { id: 'marble_light', name: 'White Carrara Marble', icon: 'sparkles' },
  { id: 'marble_dark', name: 'Black Marquina Marble', icon: 'moon' },
  { id: 'wood', name: 'Oak Parquet Hardwood', icon: 'trees' },
  { id: 'carpet', name: 'Royal Crimson Carpet', icon: 'square' },
  { id: 'grass', name: 'Lush Garden Grass', icon: 'flower' },
  { id: 'concrete', name: 'Polished Concrete', icon: 'box' }
];

/**
 * Parametric Venue Builder
 * Manages floors, walls, ceilings, baseboards, doors, and themes.
 */
export class Venue {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'venue_root';
    this.scene.add(this.group);

    this.length = config.length || 24; // Meters (along Z)
    this.width = config.width || 16;   // Meters (along X)
    this.height = config.height || 4.5; // Meters (along Y)
    this.theme = config.theme || 'ballroom';
    this.floorFinish = config.floorFinish || 'marble_light';
    this.wallCutouts = config.wallCutouts || true;

    this.floorMesh = null;
    this.wallsGroup = new THREE.Group();
    this.wallsGroup.name = 'venue_walls';
    this.group.add(this.wallsGroup);

    this.build();
  }

  build() {
    this.clear();
    this.buildFloor();
    this.buildWalls();
    this.buildArchitecturalDetails();
  }

  clear() {
    while (this.wallsGroup.children.length > 0) {
      const child = this.wallsGroup.children[0];
      this.wallsGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }
    if (this.floorMesh) {
      this.group.remove(this.floorMesh);
      if (this.floorMesh.geometry) this.floorMesh.geometry.dispose();
      this.floorMesh = null;
    }
  }

  /**
   * Builds the floor slab with selected finish texture
   */
  buildFloor() {
    let texture;
    let roughness = 0.2;
    let metalness = 0.05;

    switch (this.floorFinish) {
      case 'wood':
        texture = TextureGenerator.createWoodParquetTexture();
        roughness = 0.45;
        break;
      case 'marble_dark':
        texture = TextureGenerator.createMarbleTexture(true);
        roughness = 0.15;
        break;
      case 'carpet':
        texture = TextureGenerator.createCarpetTexture();
        roughness = 0.9;
        break;
      case 'grass':
        texture = TextureGenerator.createGrassTexture();
        roughness = 0.95;
        break;
      case 'concrete':
        texture = TextureGenerator.createConcreteTexture();
        roughness = 0.4;
        break;
      case 'marble_light':
      default:
        texture = TextureGenerator.createMarbleTexture(false);
        roughness = 0.15;
        break;
    }

    // Set texture repeat based on floor dimensions for accurate scale (e.g. 1 tile per 4 meters)
    texture.repeat.set(Math.max(1, Math.round(this.width / 4)), Math.max(1, Math.round(this.length / 4)));

    const floorGeo = new THREE.PlaneGeometry(this.width, this.length);
    const floorMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: roughness,
      metalness: metalness
    });

    this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.floorMesh.rotation.x = -Math.PI / 2;
    this.floorMesh.position.y = 0;
    this.floorMesh.receiveShadow = true;
    this.floorMesh.name = 'venue_floor';
    this.group.add(this.floorMesh);
  }

  /**
   * Builds the venue walls
   */
  buildWalls() {
    if (this.theme === 'garden') {
      // Outdoor garden: replace high walls with decorative boxwood perimeter hedges
      this.buildGardenPerimeter();
      return;
    }

    if (this.theme === 'tent') {
      // Marquee tent: build translucent cathedral walls and open entry arches
      this.buildTentPerimeter();
      return;
    }

    const wallThickness = 0.25;
    const w = this.width;
    const l = this.length;
    const h = this.height;

    // Wall Material based on theme
    let wallColor = 0xf5f5f7; // Warm off-white
    let wallRoughness = 0.85;

    if (this.theme === 'barn') {
      wallColor = 0x5a3717; // Rustic timber
    } else if (this.theme === 'loft') {
      wallColor = 0xb45309; // Warm terracotta brick/concrete
    }

    const wallMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: wallRoughness,
      metalness: 0.05
    });

    // 1. Back Wall (-Z)
    const backWallGeo = new THREE.BoxGeometry(w + wallThickness * 2, h, wallThickness);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, h / 2, -l / 2 - wallThickness / 2);
    backWall.receiveShadow = true;
    backWall.castShadow = true;
    this.wallsGroup.add(backWall);

    // 2. Left Wall (-X)
    const leftWallGeo = new THREE.BoxGeometry(wallThickness, h, l);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-w / 2 - wallThickness / 2, h / 2, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    this.wallsGroup.add(leftWall);

    // 3. Right Wall (+X)
    const rightWall = leftWall.clone();
    rightWall.position.x = w / 2 + wallThickness / 2;
    this.wallsGroup.add(rightWall);

    // 4. Front Wall with Double Grand Entrance Doors (+Z)
    // Left segment
    const doorW = 3.0;
    const doorH = 2.8;
    const frontSegW = (w - doorW) / 2;

    const frontLeftGeo = new THREE.BoxGeometry(frontSegW, h, wallThickness);
    const frontLeft = new THREE.Mesh(frontLeftGeo, wallMat);
    frontLeft.position.set(-w / 2 + frontSegW / 2, h / 2, l / 2 + wallThickness / 2);
    this.wallsGroup.add(frontLeft);

    const frontRight = frontLeft.clone();
    frontRight.position.x = w / 2 - frontSegW / 2;
    this.wallsGroup.add(frontRight);

    // Lintel above door
    const lintelH = h - doorH;
    const lintelGeo = new THREE.BoxGeometry(doorW, lintelH, wallThickness);
    const lintel = new THREE.Mesh(lintelGeo, wallMat);
    lintel.position.set(0, doorH + lintelH / 2, l / 2 + wallThickness / 2);
    this.wallsGroup.add(lintel);

    // Grand Door Frame & Double Doors
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.5 });
    const doorLeafGeo = new THREE.BoxGeometry(doorW / 2 - 0.04, doorH - 0.05, 0.08);
    const leftDoor = new THREE.Mesh(doorLeafGeo, frameMat);
    leftDoor.position.set(-doorW / 4, doorH / 2, l / 2 + wallThickness / 2);
    const rightDoor = new THREE.Mesh(doorLeafGeo, frameMat);
    rightDoor.position.set(doorW / 4, doorH / 2, l / 2 + wallThickness / 2);
    this.wallsGroup.add(leftDoor, rightDoor);

    // Baseboards & Crown Molding
    this.buildMoldings(w, l, h, wallThickness);
  }

  /**
   * Luxury baseboards and crown molding around perimeter
   */
  buildMoldings(w, l, h, t) {
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    // Baseboard (0.15m height along bottom)
    const bbBack = new THREE.Mesh(new THREE.BoxGeometry(w, 0.15, 0.04), trimMat);
    bbBack.position.set(0, 0.075, -l / 2 + 0.02);
    const bbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, l), trimMat);
    bbLeft.position.set(-w / 2 + 0.02, 0.075, 0);
    const bbRight = bbLeft.clone();
    bbRight.position.x = w / 2 - 0.02;

    this.wallsGroup.add(bbBack, bbLeft, bbRight);

    // Crown molding (along top perimeter)
    const cmBack = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, 0.06), trimMat);
    cmBack.position.set(0, h - 0.09, -l / 2 + 0.03);
    const cmLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, l), trimMat);
    cmLeft.position.set(-w / 2 + 0.03, h - 0.09, 0);
    const cmRight = cmLeft.clone();
    cmRight.position.x = w / 2 - 0.03;

    this.wallsGroup.add(cmBack, cmLeft, cmRight);
  }

  /**
   * Garden Hedge Perimeter for Outdoor Lawn
   */
  buildGardenPerimeter() {
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x225419, roughness: 0.9 });
    const hedgeH = 1.6; // 1.6m high privacy hedge
    const hedgeT = 0.5;
    const w = this.width;
    const l = this.length;

    // Back hedge
    const backHedge = new THREE.Mesh(new THREE.BoxGeometry(w + hedgeT * 2, hedgeH, hedgeT), hedgeMat);
    backHedge.position.set(0, hedgeH / 2, -l / 2 - hedgeT / 2);

    // Left hedge
    const leftHedge = new THREE.Mesh(new THREE.BoxGeometry(hedgeT, hedgeH, l), hedgeMat);
    leftHedge.position.set(-w / 2 - hedgeT / 2, hedgeH / 2, 0);

    // Right hedge
    const rightHedge = leftHedge.clone();
    rightHedge.position.x = w / 2 + hedgeT / 2;

    this.wallsGroup.add(backHedge, leftHedge, rightHedge);
  }

  /**
   * Cathedral fabric sidewalls & tent structure
   */
  buildTentPerimeter() {
    const w = this.width;
    const l = this.length;
    const eaveH = 2.6;
    const fabricMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });

    // Perimeter poles every 4 meters
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, eaveH, 12);
    for (let x = -w / 2; x <= w / 2; x += 4) {
      for (const z of [-l / 2, l / 2]) {
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(x, eaveH / 2, z);
        this.wallsGroup.add(pole);
      }
    }
    for (let z = -l / 2; z <= l / 2; z += 4) {
      for (const x of [-w / 2, w / 2]) {
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(x, eaveH / 2, z);
        this.wallsGroup.add(pole);
      }
    }

    // Sidewall curtains with window arches
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(w, eaveH), fabricMat);
    backWall.position.set(0, eaveH / 2, -l / 2);
    this.wallsGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(l, eaveH), fabricMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-w / 2, eaveH / 2, 0);
    this.wallsGroup.add(leftWall);

    const rightWall = leftWall.clone();
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = w / 2;
    this.wallsGroup.add(rightWall);
  }

  buildArchitecturalDetails() {
    // Optional ceiling beams / chandeliers depending on theme
    if (this.theme === 'barn') {
      const beamMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.7 });
      const beamCount = Math.floor(this.length / 4);
      for (let i = 0; i <= beamCount; i++) {
        const z = -this.length / 2 + (i * this.length / beamCount);
        const beam = new THREE.Mesh(new THREE.BoxGeometry(this.width, 0.35, 0.25), beamMat);
        beam.position.set(0, this.height - 0.2, z);
        this.wallsGroup.add(beam);
      }
    }
  }

  /**
   * Update venue configuration
   */
  updateConfig(cfg = {}) {
    if (cfg.width !== undefined) this.width = Number(cfg.width);
    if (cfg.length !== undefined) this.length = Number(cfg.length);
    if (cfg.height !== undefined) this.height = Number(cfg.height);
    if (cfg.theme !== undefined) this.theme = cfg.theme;
    if (cfg.floorFinish !== undefined) this.floorFinish = cfg.floorFinish;

    this.build();
  }

  getBounds() {
    return {
      minX: -this.width / 2 + 0.5,
      maxX: this.width / 2 - 0.5,
      minZ: -this.length / 2 + 0.5,
      maxZ: this.length / 2 - 0.5,
      width: this.width,
      length: this.length,
      area: this.width * this.length
    };
  }
}

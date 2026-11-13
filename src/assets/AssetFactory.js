import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

/**
 * Procedural 3D Event Asset Factory
 * Mathematically builds scale-accurate, high-fidelity 3D models with materials, shadows, and details.
 */
export class AssetFactory {
  // Shared materials for memory efficiency
  static materials = {
    gold: new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.95, roughness: 0.1 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xc5a059, metalness: 0.8, roughness: 0.3 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x222225, metalness: 0.7, roughness: 0.4 }),
    whiteLinen: new THREE.MeshStandardMaterial({ color: 0xfcfcfd, roughness: 0.85, metalness: 0.05 }),
    ivoryCushion: new THREE.MeshStandardMaterial({ color: 0xf5f3ea, roughness: 0.7, metalness: 0.02 }),
    whiteGloss: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 }),
    blackGloss: new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.2, metalness: 0.1 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, roughness: 0.1, transmission: 0.9, ior: 1.5 }),
    woodDark: new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.6, metalness: 0.1 }),
    redVelvet: new THREE.MeshStandardMaterial({ color: 0x850d1f, roughness: 0.8, metalness: 0.1 }),
    greenFoliage: new THREE.MeshStandardMaterial({ color: 0x2e6624, roughness: 0.8, metalness: 0.05 }),
    flowerPink: new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.7, metalness: 0.05 }),
    flowerWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.05 }),
    flame: new THREE.MeshBasicMaterial({ color: 0xffaa22 })
  };

  /**
   * Main factory method
   */
  static createItem(itemMeta, config = {}) {
    const group = new THREE.Group();
    group.name = itemMeta.id;
    group.userData = {
      id: config.instanceId || itemMeta.id,
      catalogId: itemMeta.id,
      name: config.customName || itemMeta.name,
      category: itemMeta.category,
      price: config.customPrice !== undefined ? config.customPrice : itemMeta.defaultPrice,
      dimensions: itemMeta.dimensions,
      seats: config.seats !== undefined ? config.seats : (itemMeta.defaultSeats || 0),
      seatList: config.seatList || [],
      tableNumber: config.tableNumber || '',
      color: config.color || itemMeta.color,
      linenColor: config.linenColor || itemMeta.defaultLinen,
      uplightColor: config.uplightColor || itemMeta.lightColor
    };

    let meshContent;
    switch (itemMeta.id) {
      case 'table_round_60':
      case 'table_round_72':
        meshContent = this.buildRoundBanquetTable(itemMeta, group.userData);
        break;
      case 'table_rect_8ft':
      case 'table_rect_6ft':
        meshContent = this.buildRectBanquetTable(itemMeta, group.userData);
        break;
      case 'table_highboy':
        meshContent = this.buildHighboyTable(itemMeta, group.userData);
        break;
      case 'table_sweetheart':
        meshContent = this.buildSweetheartTable(itemMeta, group.userData);
        break;
      case 'table_square_4':
        meshContent = this.buildSquareTable(itemMeta, group.userData);
        break;
      case 'chair_chiavari_gold':
      case 'chair_chiavari_silver':
        meshContent = this.buildChiavariChair(itemMeta, group.userData);
        break;
      case 'chair_folding_white':
        meshContent = this.buildFoldingChair(itemMeta, group.userData);
        break;
      case 'chair_banquet_padded':
        meshContent = this.buildBanquetChair(itemMeta, group.userData);
        break;
      case 'chair_velvet_modern':
        meshContent = this.buildModernVelvetChair(itemMeta, group.userData);
        break;
      case 'lounge_sofa':
        meshContent = this.buildLoungeSofa(itemMeta, group.userData);
        break;
      case 'bar_stool':
        meshContent = this.buildBarStool(itemMeta, group.userData);
        break;
      case 'stage_modular_block':
        meshContent = this.buildModularStage(itemMeta, group.userData);
        break;
      case 'dance_floor_checkered':
      case 'dance_floor_wood':
      case 'dance_floor_starlight':
        meshContent = this.buildDanceFloor(itemMeta, group.userData);
        break;
      case 'podium_lectern':
        meshContent = this.buildPodium(itemMeta, group.userData);
        break;
      case 'tent_high_peak':
        meshContent = this.buildMarqueeTent(itemMeta, group.userData);
        break;
      case 'wedding_arbor_arch':
        meshContent = this.buildWeddingArch(itemMeta, group.userData);
        break;
      case 'photo_backdrop_wall':
        meshContent = this.buildPhotoBackdrop(itemMeta, group.userData);
        break;
      case 'red_carpet_runner':
        meshContent = this.buildRedCarpet(itemMeta, group.userData);
        break;
      case 'decor_centerpiece_tall':
        meshContent = this.buildCenterpiece(itemMeta, group.userData);
        break;
      case 'decor_candelabra':
        meshContent = this.buildCandelabra(itemMeta, group.userData);
        break;
      case 'light_uplight':
        meshContent = this.buildUplight(itemMeta, group.userData);
        break;
      case 'light_chandelier':
        meshContent = this.buildChandelier(itemMeta, group.userData);
        break;
      case 'av_dj_booth':
        meshContent = this.buildDJBooth(itemMeta, group.userData);
        break;
      case 'av_speaker_tower':
        meshContent = this.buildSpeakerTower(itemMeta, group.userData);
        break;
      case 'av_video_wall':
        meshContent = this.buildVideoWall(itemMeta, group.userData);
        break;
      case 'catering_cake_table':
        meshContent = this.buildCakeTable(itemMeta, group.userData);
        break;
      case 'catering_buffet_station':
        meshContent = this.buildBuffetStation(itemMeta, group.userData);
        break;
      case 'catering_bar_counter':
        meshContent = this.buildBarCounter(itemMeta, group.userData);
        break;
      default:
        meshContent = this.buildFallbackItem(itemMeta, group.userData);
        break;
    }

    group.add(meshContent);

    // If item is a table and has seats, automatically spawn chairs around it
    if (itemMeta.hasSeats && group.userData.seats > 0) {
      const chairsGroup = this.buildChairsForTable(itemMeta, group.userData);
      chairsGroup.name = 'table_chairs';
      group.add(chairsGroup);
    }

    // Enable shadows on all child meshes
    group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return group;
  }

  // ==========================================
  // TABLE BUILDERS
  // ==========================================

  static buildRoundBanquetTable(meta, data) {
    const root = new THREE.Group();
    const radius = meta.dimensions.diameter / 2;
    const height = meta.dimensions.height;
    const linenColor = data.linenColor || '#ffffff';

    const linenMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(linenColor),
      roughness: 0.85,
      metalness: 0.05
    });

    // 1. Tabletop surface
    const topGeo = new THREE.CylinderGeometry(radius, radius, 0.04, 32);
    const topMesh = new THREE.Mesh(topGeo, linenMat);
    topMesh.position.y = height - 0.02;
    root.add(topMesh);

    // 2. Draped tablecloth body (gentle taper with floor drop)
    const drapeGeo = new THREE.CylinderGeometry(radius, radius * 1.05, height - 0.04, 32, 1, true);
    const drapeMesh = new THREE.Mesh(drapeGeo, linenMat);
    drapeMesh.position.y = (height - 0.04) / 2;
    root.add(drapeMesh);

    // 3. Mini plates & napkins on table rim
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const glassMat = this.materials.glass;
    const seatCount = data.seats || meta.defaultSeats || 8;

    for (let i = 0; i < seatCount; i++) {
      const angle = (i / seatCount) * Math.PI * 2;
      const plateDist = radius * 0.78;
      const px = Math.cos(angle) * plateDist;
      const pz = Math.sin(angle) * plateDist;

      // Charger plate
      const plateGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.015, 16);
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      plateMesh.position.set(px, height + 0.007, pz);
      root.add(plateMesh);

      // Wine glass
      const glassGeo = new THREE.CylinderGeometry(0.035, 0.02, 0.09, 12);
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(px * 0.85 + 0.05, height + 0.045, pz * 0.85 + 0.05);
      root.add(glassMesh);
    }

    // 4. Centerpiece floral vase
    const vaseGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.22, 16);
    const vaseMesh = new THREE.Mesh(vaseGeo, this.materials.glass);
    vaseMesh.position.y = height + 0.11;
    root.add(vaseMesh);

    const flowerGeo = new THREE.DodecahedronGeometry(0.18, 1);
    const flowerMesh = new THREE.Mesh(flowerGeo, this.materials.flowerPink);
    flowerMesh.position.y = height + 0.3;
    root.add(flowerMesh);

    return root;
  }

  static buildRectBanquetTable(meta, data) {
    const root = new THREE.Group();
    const w = meta.dimensions.width;
    const l = meta.dimensions.length;
    const h = meta.dimensions.height;
    const linenColor = data.linenColor || '#ffffff';

    const linenMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(linenColor),
      roughness: 0.85,
      metalness: 0.05
    });

    // 1. Tabletop
    const topGeo = new THREE.BoxGeometry(l, 0.04, w);
    const topMesh = new THREE.Mesh(topGeo, linenMat);
    topMesh.position.y = h - 0.02;
    root.add(topMesh);

    // 2. Draped sides
    const drapeGeo = new THREE.BoxGeometry(l * 0.99, h - 0.04, w * 0.99);
    const drapeMesh = new THREE.Mesh(drapeGeo, linenMat);
    drapeMesh.position.y = (h - 0.04) / 2;
    root.add(drapeMesh);

    // 3. Runner along center
    const runnerGeo = new THREE.BoxGeometry(l * 1.01, 0.005, w * 0.35);
    const runnerMat = new THREE.MeshStandardMaterial({ color: 0x850d1f, roughness: 0.7 });
    const runnerMesh = new THREE.Mesh(runnerGeo, runnerMat);
    runnerMesh.position.y = h + 0.003;
    root.add(runnerMesh);

    // 4. Small floral centerpieces
    for (let f = -0.5; f <= 0.5; f += 0.5) {
      const vaseGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.15, 12);
      const vaseMesh = new THREE.Mesh(vaseGeo, this.materials.glass);
      vaseMesh.position.set(f * (l * 0.5), h + 0.075, 0);
      root.add(vaseMesh);

      const fGeo = new THREE.DodecahedronGeometry(0.1, 1);
      const fMesh = new THREE.Mesh(fGeo, this.materials.flowerWhite);
      fMesh.position.set(f * (l * 0.5), h + 0.2, 0);
      root.add(fMesh);
    }

    return root;
  }

  static buildHighboyTable(meta, data) {
    const root = new THREE.Group();
    const radius = meta.dimensions.diameter / 2;
    const h = meta.dimensions.height;
    const linenColor = data.linenColor || '#1e293b';

    const linenMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(linenColor), roughness: 0.7 });

    // Tabletop
    const topGeo = new THREE.CylinderGeometry(radius, radius, 0.03, 24);
    const topMesh = new THREE.Mesh(topGeo, linenMat);
    topMesh.position.y = h - 0.015;
    root.add(topMesh);

    // Tight-fit spandex cocktail silhouette (tapered waist + sash tie)
    // Upper flare
    const upperGeo = new THREE.CylinderGeometry(radius * 0.95, 0.1, h * 0.45, 24);
    const upperMesh = new THREE.Mesh(upperGeo, linenMat);
    upperMesh.position.y = h * 0.75;
    root.add(upperMesh);

    // Sash band (Gold ribbon tie at waist)
    const sashGeo = new THREE.TorusGeometry(0.11, 0.03, 12, 24);
    const sashMesh = new THREE.Mesh(sashGeo, this.materials.gold);
    sashMesh.rotation.x = Math.PI / 2;
    sashMesh.position.y = h * 0.52;
    root.add(sashMesh);

    // Lower flare
    const lowerGeo = new THREE.CylinderGeometry(0.1, radius * 0.9, h * 0.52, 24);
    const lowerMesh = new THREE.Mesh(lowerGeo, linenMat);
    lowerMesh.position.y = h * 0.26;
    root.add(lowerMesh);

    // Mini votive candle on top
    const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12);
    const candleMesh = new THREE.Mesh(candleGeo, this.materials.glass);
    candleMesh.position.y = h + 0.03;
    root.add(candleMesh);

    const flameMesh = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.03, 8), this.materials.flame);
    flameMesh.position.y = h + 0.075;
    root.add(flameMesh);

    return root;
  }

  static buildSweetheartTable(meta, data) {
    const root = new THREE.Group();
    const l = meta.dimensions.length;
    const w = meta.dimensions.width;
    const h = meta.dimensions.height;

    const linenMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.8 });

    // Curved front table
    const topGeo = new THREE.BoxGeometry(l, 0.04, w);
    const topMesh = new THREE.Mesh(topGeo, linenMat);
    topMesh.position.y = h - 0.02;
    root.add(topMesh);

    // Draped skirt
    const skirtGeo = new THREE.BoxGeometry(l * 0.98, h - 0.04, w * 0.98);
    const skirtMesh = new THREE.Mesh(skirtGeo, linenMat);
    skirtMesh.position.y = (h - 0.04) / 2;
    root.add(skirtMesh);

    // Cascading floral front runner
    const garlandGeo = new THREE.CylinderGeometry(0.08, 0.08, l * 0.95, 12);
    const garlandMesh = new THREE.Mesh(garlandGeo, this.materials.greenFoliage);
    garlandMesh.rotation.z = Math.PI / 2;
    garlandMesh.position.set(0, h - 0.02, w / 2);
    root.add(garlandMesh);

    // Rose accents along front
    for (let r = -0.4; r <= 0.4; r += 0.2) {
      const rose = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06, 1), this.materials.flowerPink);
      rose.position.set(r * l, h - 0.02, w / 2 + 0.05);
      root.add(rose);
    }

    // 2 Place settings
    for (const offset of [-0.35, 0.35]) {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.015, 16), this.materials.gold);
      plate.position.set(offset, h + 0.007, 0);
      root.add(plate);

      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.12, 12), this.materials.glass);
      glass.position.set(offset + 0.1, h + 0.06, -0.1);
      root.add(glass);
    }

    return root;
  }

  static buildSquareTable(meta, data) {
    const root = new THREE.Group();
    const s = meta.dimensions.width;
    const h = meta.dimensions.height;

    const linenMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });

    const topMesh = new THREE.Mesh(new THREE.BoxGeometry(s, 0.04, s), linenMat);
    topMesh.position.y = h - 0.02;
    root.add(topMesh);

    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(s * 0.95, h - 0.04, s * 0.95), linenMat);
    baseMesh.position.y = (h - 0.04) / 2;
    root.add(baseMesh);

    // Small centerpiece
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.18, 12), this.materials.glass);
    vase.position.y = h + 0.09;
    root.add(vase);

    return root;
  }

  /**
   * Helper to automatically arrange chairs around a table
   */
  static buildChairsForTable(meta, data) {
    const group = new THREE.Group();
    const count = data.seats || meta.defaultSeats || 8;
    const chairMeta = { id: 'chair_chiavari_gold', dimensions: { width: 0.42, length: 0.45, height: 0.92 } };

    if (meta.dimensions.diameter) {
      // Circular arrangement around round table
      const dist = (meta.dimensions.diameter / 2) + 0.38;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const chair = this.buildChiavariChair(chairMeta, { color: '#d4af37' });
        chair.position.x = Math.cos(angle) * dist;
        chair.position.z = Math.sin(angle) * dist;
        chair.rotation.y = -angle - Math.PI / 2; // Face inward toward table center
        group.add(chair);
      }
    } else if (meta.dimensions.length) {
      // Rectangular table arrangement: chairs on both long sides + optional ends
      const l = meta.dimensions.length;
      const w = meta.dimensions.width;
      const sideCount = Math.floor((count - (count > 6 ? 2 : 0)) / 2);
      const distZ = (w / 2) + 0.38;

      let chairIdx = 0;
      // Front side
      for (let i = 0; i < sideCount && chairIdx < count; i++) {
        const t = (i + 0.5) / sideCount - 0.5;
        const chair = this.buildChiavariChair(chairMeta, { color: '#d4af37' });
        chair.position.set(t * (l * 0.8), 0, distZ);
        chair.rotation.y = Math.PI; // Face inward
        group.add(chair);
        chairIdx++;
      }
      // Back side
      for (let i = 0; i < sideCount && chairIdx < count; i++) {
        const t = (i + 0.5) / sideCount - 0.5;
        const chair = this.buildChiavariChair(chairMeta, { color: '#d4af37' });
        chair.position.set(t * (l * 0.8), 0, -distZ);
        chair.rotation.y = 0; // Face inward
        group.add(chair);
        chairIdx++;
      }
      // Ends if count > 6
      if (chairIdx < count) {
        const chairLeft = this.buildChiavariChair(chairMeta, { color: '#d4af37' });
        chairLeft.position.set(-l / 2 - 0.38, 0, 0);
        chairLeft.rotation.y = Math.PI / 2;
        group.add(chairLeft);
        chairIdx++;
      }
      if (chairIdx < count) {
        const chairRight = this.buildChiavariChair(chairMeta, { color: '#d4af37' });
        chairRight.position.set(l / 2 + 0.38, 0, 0);
        chairRight.rotation.y = -Math.PI / 2;
        group.add(chairRight);
        chairIdx++;
      }
    }

    return group;
  }

  // ==========================================
  // CHAIR BUILDERS
  // ==========================================

  static buildChiavariChair(meta, data) {
    const root = new THREE.Group();
    const frameColor = data.color || (meta.id.includes('silver') ? '#c0c0c0' : '#d4af37');
    const isSilver = meta.id.includes('silver') || frameColor === '#c0c0c0';
    const frameMat = isSilver ? this.materials.silver : (frameColor === '#d4af37' ? this.materials.gold : new THREE.MeshStandardMaterial({ color: frameColor, metalness: 0.8, roughness: 0.25 }));

    const seatW = 0.4;
    const seatD = 0.42;
    const seatH = 0.45;
    const backH = 0.48;

    // 1. Cushion Seat
    const cushionGeo = new THREE.BoxGeometry(seatW, 0.05, seatD);
    const cushionMesh = new THREE.Mesh(cushionGeo, this.materials.ivoryCushion);
    cushionMesh.position.y = seatH;
    root.add(cushionMesh);

    // 2. 4 Spindle Legs
    const legRadius = 0.016;
    const legGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.8, seatH, 8);
    const offsets = [
      [-seatW / 2 + 0.02, -seatD / 2 + 0.02],
      [seatW / 2 - 0.02, -seatD / 2 + 0.02],
      [-seatW / 2 + 0.02, seatD / 2 - 0.02],
      [seatW / 2 - 0.02, seatD / 2 - 0.02]
    ];

    offsets.forEach(([ox, oz]) => {
      const leg = new THREE.Mesh(legGeo, frameMat);
      leg.position.set(ox, seatH / 2, oz);
      root.add(leg);
    });

    // 3. Backrest Uprights
    const uprightGeo = new THREE.CylinderGeometry(legRadius, legRadius, backH, 8);
    const leftUpright = new THREE.Mesh(uprightGeo, frameMat);
    leftUpright.position.set(-seatW / 2 + 0.02, seatH + backH / 2, -seatD / 2 + 0.02);
    const rightUpright = new THREE.Mesh(uprightGeo, frameMat);
    rightUpright.position.set(seatW / 2 - 0.02, seatH + backH / 2, -seatD / 2 + 0.02);
    root.add(leftUpright, rightUpright);

    // Top crown rail
    const topRailGeo = new THREE.CylinderGeometry(0.02, 0.02, seatW - 0.01, 8);
    const topRail = new THREE.Mesh(topRailGeo, frameMat);
    topRail.rotation.z = Math.PI / 2;
    topRail.position.set(0, seatH + backH - 0.01, -seatD / 2 + 0.02);
    root.add(topRail);

    // 3 Horizontal Spindle Rungs on back
    for (let r = 1; r <= 3; r++) {
      const rungGeo = new THREE.CylinderGeometry(0.009, 0.009, seatW - 0.04, 8);
      const rung = new THREE.Mesh(rungGeo, frameMat);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0, seatH + (backH * (r / 4)), -seatD / 2 + 0.02);
      root.add(rung);
    }

    return root;
  }

  static buildFoldingChair(meta, data) {
    const root = new THREE.Group();
    const mat = this.materials.whiteGloss;

    // Slanted seat
    const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.42), mat);
    seatMesh.position.y = 0.44;
    root.add(seatMesh);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.46, 8);
    const fl = new THREE.Mesh(legGeo, mat);
    fl.position.set(-0.19, 0.22, 0.18);
    fl.rotation.x = -0.15;
    const fr = fl.clone();
    fr.position.x = 0.19;
    root.add(fl, fr);

    const bl = new THREE.Mesh(legGeo, mat);
    bl.position.set(-0.19, 0.22, -0.18);
    bl.rotation.x = 0.15;
    const br = bl.clone();
    br.position.x = 0.19;
    root.add(bl, br);

    // Backrest slatted panel
    const backMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.25, 0.02), mat);
    backMesh.position.set(0, 0.65, -0.2);
    root.add(backMesh);

    return root;
  }

  static buildBanquetChair(meta, data) {
    const root = new THREE.Group();
    const frameMat = this.materials.gold;
    const padMat = this.materials.redVelvet;

    // Seat pad
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.07, 0.45), padMat);
    seat.position.y = 0.46;
    root.add(seat);

    // Curved crown backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.06), padMat);
    back.position.set(0, 0.72, -0.2);
    root.add(back);

    // Steel tube legs
    const legGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.46, 8);
    for (const [ox, oz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
      const leg = new THREE.Mesh(legGeo, frameMat);
      leg.position.set(ox, 0.23, oz);
      root.add(leg);
    }

    return root;
  }

  static buildModernVelvetChair(meta, data) {
    const root = new THREE.Group();
    const velvetMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.7 });
    const brassMat = this.materials.brass;

    // Bucket seat
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.08, 24), velvetMat);
    seat.position.y = 0.45;
    root.add(seat);

    // Curved back shell
    const backGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 24, 1, true, Math.PI * 0.75, Math.PI * 1.5);
    const back = new THREE.Mesh(backGeo, velvetMat);
    back.position.set(0, 0.62, 0);
    root.add(back);

    // Flared brass legs
    const legGeo = new THREE.CylinderGeometry(0.012, 0.008, 0.48, 8);
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI / 2) + Math.PI / 4;
      const leg = new THREE.Mesh(legGeo, brassMat);
      leg.position.set(Math.cos(angle) * 0.16, 0.22, Math.sin(angle) * 0.16);
      leg.rotation.z = Math.sin(angle) * 0.12;
      leg.rotation.x = Math.cos(angle) * 0.12;
      root.add(leg);
    }

    return root;
  }

  static buildLoungeSofa(meta, data) {
    const root = new THREE.Group();
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
    const l = meta.dimensions.length;
    const w = meta.dimensions.width;
    const h = meta.dimensions.height;

    // Base bench
    const base = new THREE.Mesh(new THREE.BoxGeometry(l, 0.25, w), sofaMat);
    base.position.y = 0.22;
    root.add(base);

    // 3 Plush cushions
    const cW = (l - 0.2) / 3;
    for (let c = 0; c < 3; c++) {
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(cW * 0.96, 0.12, w * 0.75), sofaMat);
      cushion.position.set((c - 1) * cW, 0.38, 0.05);
      root.add(cushion);
    }

    // Tufted Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(l, h - 0.3, 0.22), sofaMat);
    back.position.set(0, 0.3 + (h - 0.3) / 2, -w / 2 + 0.11);
    root.add(back);

    // 2 Rolled armrests
    const armGeo = new THREE.BoxGeometry(0.2, 0.32, w);
    const leftArm = new THREE.Mesh(armGeo, sofaMat);
    leftArm.position.set(-l / 2 + 0.1, 0.42, 0);
    const rightArm = new THREE.Mesh(armGeo, sofaMat);
    rightArm.position.set(l / 2 - 0.1, 0.42, 0);
    root.add(leftArm, rightArm);

    // Wooden legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.12, 8);
    for (const [ox, oz] of [[-l / 2 + 0.15, -w / 2 + 0.15], [l / 2 - 0.15, -w / 2 + 0.15], [-l / 2 + 0.15, w / 2 - 0.15], [l / 2 - 0.15, w / 2 - 0.15]]) {
      const leg = new THREE.Mesh(legGeo, this.materials.woodDark);
      leg.position.set(ox, 0.06, oz);
      root.add(leg);
    }

    return root;
  }

  static buildBarStool(meta, data) {
    const root = new THREE.Group();
    const chrome = this.materials.chrome;
    const seatMat = this.materials.blackGloss;

    // Disc base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 24), chrome);
    base.position.y = 0.01;
    root.add(base);

    // Pillar
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 16), chrome);
    pole.position.y = 0.37;
    root.add(pole);

    // Footrest ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 8, 24), chrome);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.28;
    root.add(ring);

    // Leather disc seat
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 24), seatMat);
    seat.position.y = 0.76;
    root.add(seat);

    return root;
  }

  // ==========================================
  // STAGES & DANCE FLOORS
  // ==========================================

  static buildModularStage(meta, data) {
    const root = new THREE.Group();
    const l = meta.dimensions.length;
    const w = meta.dimensions.width;
    const h = meta.dimensions.height;

    // Stage deck (Hard dark textured plywood)
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(l, 0.06, w), deckMat);
    deck.position.y = h - 0.03;
    root.add(deck);

    // Black velvet pleated skirting around 3 front & sides
    const skirtMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
    const skirtGeo = new THREE.BoxGeometry(l * 0.99, h - 0.06, w * 0.99);
    const skirt = new THREE.Mesh(skirtGeo, skirtMat);
    skirt.position.y = (h - 0.06) / 2;
    root.add(skirt);

    // Aluminum frame edge trim
    const trimMat = this.materials.silver;
    const trim = new THREE.Mesh(new THREE.BoxGeometry(l + 0.02, 0.02, w + 0.02), trimMat);
    trim.position.y = h;
    root.add(trim);

    // Front access steps (2 steps)
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6 });
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, h * 0.33, 0.35), stepMat);
    step1.position.set(0, (h * 0.33) / 2, w / 2 + 0.35);
    const step2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, h * 0.66, 0.35), stepMat);
    step2.position.set(0, (h * 0.66) / 2, w / 2 + 0.175);
    root.add(step1, step2);

    return root;
  }

  static buildDanceFloor(meta, data) {
    const root = new THREE.Group();
    const l = meta.dimensions.length;
    const w = meta.dimensions.width;
    const h = meta.dimensions.height || 0.04;

    let floorTexture;
    let roughness = 0.2;
    let metalness = 0.1;

    if (meta.id === 'dance_floor_checkered') {
      floorTexture = TextureGenerator.createCheckeredTexture();
    } else if (meta.id === 'dance_floor_wood') {
      floorTexture = TextureGenerator.createWoodParquetTexture();
      roughness = 0.4;
    } else {
      floorTexture = TextureGenerator.createStarlightTexture();
      roughness = 0.1;
    }

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: roughness,
      metalness: metalness
    });

    const floor = new THREE.Mesh(new THREE.BoxGeometry(l, h, w), floorMat);
    floor.position.y = h / 2;
    root.add(floor);

    // Safety ramp beveled perimeter trim (aluminum)
    const trim = new THREE.Mesh(new THREE.BoxGeometry(l + 0.12, h * 0.6, w + 0.12), this.materials.silver);
    trim.position.y = h * 0.3;
    root.add(trim);

    return root;
  }

  static buildPodium(meta, data) {
    const root = new THREE.Group();
    const acrylic = this.materials.glass;
    const h = meta.dimensions.height;

    // Heavy base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.45), this.materials.darkMetal);
    base.position.y = 0.02;
    root.add(base);

    // Central slanted pillar
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.35, h - 0.1, 0.12), acrylic);
    pillar.position.set(0, h / 2, -0.05);
    root.add(pillar);

    // Slanted top reading shelf
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.025, 0.45), acrylic);
    top.rotation.x = 0.25;
    top.position.set(0, h, 0);
    root.add(top);

    // Microphone on gooseneck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.25, 8), this.materials.darkMetal);
    neck.position.set(0.12, h + 0.12, -0.08);
    neck.rotation.x = -0.3;
    const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.05, 8), this.materials.darkMetal);
    mic.position.set(0.12, h + 0.24, -0.05);
    root.add(neck, mic);

    return root;
  }

  // ==========================================
  // TENTS & ARCHITECTURE
  // ==========================================

  static buildMarqueeTent(meta, data) {
    const root = new THREE.Group();
    const w = meta.dimensions.width;
    const l = meta.dimensions.length;
    const peakH = meta.dimensions.height;
    const eaveH = 2.4; // 2.4m eave height

    const fabricMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const poleMat = this.materials.silver;

    // 4 Corner Poles
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, eaveH, 12);
    for (const [ox, oz] of [[-w / 2, -l / 2], [w / 2, -l / 2], [-w / 2, l / 2], [w / 2, l / 2]]) {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(ox, eaveH / 2, oz);
      root.add(pole);
    }

    // High Peak Canopy Roof (Pyramid Cone)
    const roofGeo = new THREE.ConeGeometry(Math.sqrt((w * w + l * l)) / 2 * 0.95, peakH - eaveH, 4);
    const roof = new THREE.Mesh(roofGeo, fabricMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, eaveH + (peakH - eaveH) / 2, 0);
    root.add(roof);

    // Center tall mast pole
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, peakH, 12), poleMat);
    mast.position.y = peakH / 2;
    root.add(mast);

    // Decorative valance perimeter trim
    const valance = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.35, l + 0.1), fabricMat);
    valance.position.y = eaveH - 0.15;
    root.add(valance);

    return root;
  }

  static buildWeddingArch(meta, data) {
    const root = new THREE.Group();
    const l = meta.dimensions.length;
    const h = meta.dimensions.height;
    const gold = this.materials.gold;

    // Hexagonal geometric arch frame
    const ringGeo = new THREE.TorusGeometry(l / 2, 0.035, 8, 6);
    const arch = new THREE.Mesh(ringGeo, gold);
    arch.position.y = h * 0.58;
    root.add(arch);

    // Sturdy dual base feet
    for (const bx of [-0.6, 0.6]) {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.6), gold);
      base.position.set(bx, 0.015, 0);
      root.add(base);
    }

    // Abundant floral & eucalyptus wrap on top left quadrant
    const foliageCluster = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), this.materials.greenFoliage);
    foliageCluster.position.set(-l * 0.35, h * 0.8, 0);
    root.add(foliageCluster);

    for (let f = 0; f < 6; f++) {
      const flower = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09, 1), f % 2 === 0 ? this.materials.flowerPink : this.materials.flowerWhite);
      flower.position.set(-l * 0.35 + (Math.random() - 0.5) * 0.4, h * 0.8 + (Math.random() - 0.5) * 0.4, 0.08);
      root.add(flower);
    }

    return root;
  }

  static buildPhotoBackdrop(meta, data) {
    const root = new THREE.Group();
    const l = meta.dimensions.length;
    const h = meta.dimensions.height;

    // Boxwood Greenery Hedge
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x1f5c18, roughness: 0.9 });
    const hedge = new THREE.Mesh(new THREE.BoxGeometry(l, h, 0.2), hedgeMat);
    hedge.position.y = h / 2;
    root.add(hedge);

    // Gold outer frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(l + 0.1, h + 0.1, 0.22), this.materials.gold);
    frame.position.y = h / 2;
    // Don't fully occlude hedge: frame edges only
    root.add(frame);

    // Glowing Neon Monogram Sign in center
    const neonMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const sign = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.03, 8, 24), neonMat);
    sign.position.set(0, h * 0.65, 0.14);
    root.add(sign);

    return root;
  }

  static buildRedCarpet(meta, data) {
    const root = new THREE.Group();
    const w = meta.dimensions.width;
    const l = meta.dimensions.length;

    // Red plush runner
    const carpetMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
    const runner = new THREE.Mesh(new THREE.BoxGeometry(w, 0.015, l), carpetMat);
    runner.position.y = 0.008;
    root.add(runner);

    // 6 Gold Stanchions & Velvet Ropes
    const gold = this.materials.gold;
    const ropeMat = this.materials.redVelvet;

    for (let i = 0; i < 3; i++) {
      const z = -l / 2 + 0.5 + (i * (l - 1) / 2);
      for (const x of [-w / 2 - 0.15, w / 2 + 0.15]) {
        // Base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16), gold);
        base.position.set(x, 0.015, z);
        // Post
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 12), gold);
        post.position.set(x, 0.48, z);
        // Ball Top
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), gold);
        ball.position.set(x, 0.95, z);
        root.add(base, post, ball);
      }

      // Connecting velvet ropes between stanchions
      if (i < 2) {
        const nextZ = -l / 2 + 0.5 + ((i + 1) * (l - 1) / 2);
        for (const x of [-w / 2 - 0.15, w / 2 + 0.15]) {
          const ropeGeo = new THREE.CylinderGeometry(0.018, 0.018, Math.abs(nextZ - z), 8);
          const rope = new THREE.Mesh(ropeGeo, ropeMat);
          rope.position.set(x, 0.75, (z + nextZ) / 2);
          rope.rotation.x = Math.PI / 2;
          root.add(rope);
        }
      }
    }

    return root;
  }

  // ==========================================
  // DECOR & LIGHTING
  // ==========================================

  static buildCenterpiece(meta, data) {
    const root = new THREE.Group();
    const h = meta.dimensions.height;

    // Fluted crystal trumpet vase
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.04, h * 0.6, 16), this.materials.glass);
    vase.position.y = (h * 0.6) / 2;
    root.add(vase);

    // Floral head (hydrangeas, roses, eucalyptus leaves)
    const bouquet = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), this.materials.flowerPink);
    bouquet.position.y = h * 0.75;
    root.add(bouquet);

    // Hanging crystal pendants
    for (let c = 0; c < 6; c++) {
      const angle = (c / 6) * Math.PI * 2;
      const pendant = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.06, 6), this.materials.glass);
      pendant.position.set(Math.cos(angle) * 0.18, h * 0.6, Math.sin(angle) * 0.18);
      root.add(pendant);
    }

    return root;
  }

  static buildCandelabra(meta, data) {
    const root = new THREE.Group();
    const gold = this.materials.gold;
    const h = meta.dimensions.height;

    // Base & Stem
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.04, 16), gold);
    base.position.y = 0.02;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, h * 0.6, 12), gold);
    stem.position.y = (h * 0.6) / 2;
    root.add(base, stem);

    // 4 Curved Arms + 1 Center
    const candlePositions = [[0, h * 0.75, 0]];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const ax = Math.cos(angle) * 0.16;
      const az = Math.sin(angle) * 0.16;
      candlePositions.push([ax, h * 0.65, az]);

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.18, 8), gold);
      arm.position.set(ax / 2, h * 0.55, az / 2);
      arm.rotation.z = Math.cos(angle) * 0.5;
      arm.rotation.x = Math.sin(angle) * 0.5;
      root.add(arm);
    }

    // Taper candles with flickering flames
    candlePositions.forEach(([cx, cy, cz]) => {
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), this.materials.whiteLinen);
      candle.position.set(cx, cy + 0.07, cz);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.025, 8), this.materials.flame);
      flame.position.set(cx, cy + 0.15, cz);
      root.add(candle, flame);
    });

    return root;
  }

  static buildUplight(meta, data) {
    const root = new THREE.Group();
    const colorHex = data.uplightColor || '#c026d3';
    const color = new THREE.Color(colorHex);

    // Compact fixture housing
    const casing = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.18, 16), this.materials.darkMetal);
    casing.position.y = 0.09;
    root.add(casing);

    // LED Lens emitting colored light
    const lensMat = new THREE.MeshBasicMaterial({ color: color });
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16), lensMat);
    lens.position.y = 0.19;
    root.add(lens);

    // Actual dynamic SpotLight in Three.js!
    const spot = new THREE.SpotLight(color, 8, 12, Math.PI / 6, 0.4, 1.2);
    spot.position.set(0, 0.25, 0);
    spot.target.position.set(0, 5, 0);
    spot.castShadow = true;
    root.add(spot);
    root.add(spot.target);

    return root;
  }

  static buildChandelier(meta, data) {
    const root = new THREE.Group();
    const gold = this.materials.gold;
    const glass = this.materials.glass;
    const w = meta.dimensions.width;

    // Suspension chain
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.0, 8), gold);
    chain.position.y = 0.5;
    root.add(chain);

    // 3 Concentric crystal rings
    for (let r = 0; r < 3; r++) {
      const radius = (w / 2) * (1 - r * 0.28);
      const ringGeo = new THREE.TorusGeometry(radius, 0.02, 8, 24);
      const ring = new THREE.Mesh(ringGeo, gold);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -r * 0.25;
      root.add(ring);

      // Hanging crystal prisms around ring
      const prisms = 16 - r * 4;
      for (let p = 0; p < prisms; p++) {
        const angle = (p / prisms) * Math.PI * 2;
        const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.12, 6), glass);
        crystal.position.set(Math.cos(angle) * radius, -r * 0.25 - 0.08, Math.sin(angle) * radius);
        root.add(crystal);
      }
    }

    // Warm omnidirectional glow point
    const light = new THREE.PointLight(0xffea9f, 3, 10);
    light.position.y = -0.3;
    root.add(light);

    return root;
  }

  static buildDJBooth(meta, data) {
    const root = new THREE.Group();
    const l = meta.dimensions.length;
    const w = meta.dimensions.width;
    const h = meta.dimensions.height;

    // Front illuminated facade
    const facadeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 });
    const facade = new THREE.Mesh(new THREE.BoxGeometry(l, h, 0.08), facadeMat);
    facade.position.set(0, h / 2, w / 2);
    root.add(facade);

    // Glowing front LED strip
    const neon = new THREE.Mesh(new THREE.BoxGeometry(l * 0.9, 0.04, 0.01), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
    neon.position.set(0, h * 0.75, w / 2 + 0.045);
    root.add(neon);

    // Work surface / desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(l, 0.05, w), this.materials.darkMetal);
    desk.position.set(0, h * 0.85, 0);
    root.add(desk);

    // 2 Turntables (jog wheels)
    for (const tx of [-0.45, 0.45]) {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.32), this.materials.darkMetal);
      deck.position.set(tx, h * 0.85 + 0.045, 0);
      const jog = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 24), this.materials.silver);
      jog.position.set(tx, h * 0.85 + 0.075, 0);
      root.add(deck, jog);
    }

    // DJ Mixer console in middle
    const mixer = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.32), this.materials.darkMetal);
    mixer.position.set(0, h * 0.85 + 0.05, 0);
    root.add(mixer);

    // Elevated laptop stand
    const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.01, 0.22), this.materials.silver);
    laptop.position.set(0, h + 0.15, -0.15);
    laptop.rotation.x = 0.25;
    root.add(laptop);

    return root;
  }

  static buildSpeakerTower(meta, data) {
    const root = new THREE.Group();
    const darkMat = this.materials.darkMetal;

    // Subwoofer Base Box
    const sub = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), darkMat);
    sub.position.y = 0.3;
    root.add(sub);

    // Column Mount Pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 12), this.materials.darkMetal);
    pole.position.y = 1.0;
    root.add(pole);

    // Line Array Vertical Array Box
    const arrayBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.2), darkMat);
    arrayBox.position.set(0, 1.8, 0);
    root.add(arrayBox);

    return root;
  }

  static buildVideoWall(meta, data) {
    const root = new THREE.Group();
    const l = meta.dimensions.length;
    const h = meta.dimensions.height;

    // LED display face (glowing screen)
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(l, h, 0.05), screenMat);
    screen.position.y = h / 2 + 0.3;
    root.add(screen);

    // Ground truss support legs
    const trussMat = this.materials.silver;
    for (const tx of [-l / 2 + 0.4, l / 2 - 0.4]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, h + 0.6, 0.5), trussMat);
      leg.position.set(tx, (h + 0.6) / 2, -0.1);
      root.add(leg);
    }

    return root;
  }

  // ==========================================
  // CATERING BUILDERS
  // ==========================================

  static buildCakeTable(meta, data) {
    const root = new THREE.Group();
    const radius = 0.45;
    const h = 0.76;

    // Draped round table
    const table = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.05, h, 24), this.materials.whiteLinen);
    table.position.y = h / 2;
    root.add(table);

    // Silver cake pedestal
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.2, 0.06, 24), this.materials.silver);
    stand.position.y = h + 0.03;
    root.add(stand);

    // 3-Tier Luxury Wedding Cake (white fondant + gold pearl trim)
    const cakeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.14, 24), cakeMat);
    tier1.position.y = h + 0.13;

    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 24), cakeMat);
    tier2.position.y = h + 0.27;

    const tier3 = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.14, 24), cakeMat);
    tier3.position.y = h + 0.41;

    // Mini gold cake topper
    const topper = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 8, 16), this.materials.gold);
    topper.position.y = h + 0.52;

    root.add(tier1, tier2, tier3, topper);

    return root;
  }

  static buildBuffetStation(meta, data) {
    const root = new THREE.Group();
    const l = meta.dimensions.length;
    const w = meta.dimensions.width;
    const h = meta.dimensions.height;

    // Draped table
    const table = new THREE.Mesh(new THREE.BoxGeometry(l, h, w), this.materials.darkMetal);
    table.position.y = h / 2;
    root.add(table);

    // 3 Stainless Steel Chafing Dishes with roll-top lids
    const dishCount = 3;
    for (let i = 0; i < dishCount; i++) {
      const cx = (i - 1) * (l * 0.3);
      // Chafing water pan & stand
      const dish = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.38), this.materials.silver);
      dish.position.set(cx, h + 0.09, 0);

      // Roll-top curved lid
      const lidGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.54, 16, 1, false, 0, Math.PI);
      const lid = new THREE.Mesh(lidGeo, this.materials.chrome);
      lid.rotation.z = Math.PI / 2;
      lid.position.set(cx, h + 0.22, 0);

      root.add(dish, lid);
    }

    return root;
  }

  static buildBarCounter(meta, data) {
    const root = new THREE.Group();
    const l = meta.dimensions.length;
    const w = meta.dimensions.width;
    const h = meta.dimensions.height;

    // Counter body with illuminated gloss front
    const body = new THREE.Mesh(new THREE.BoxGeometry(l, h, w), this.materials.blackGloss);
    body.position.y = h / 2;
    root.add(body);

    // LED Under-counter front glow
    const barGlow = new THREE.Mesh(new THREE.BoxGeometry(l * 0.95, 0.06, 0.02), new THREE.MeshBasicMaterial({ color: 0xa855f7 }));
    barGlow.position.set(0, h * 0.85, w / 2 + 0.01);
    root.add(barGlow);

    // Brass Footrest Rail along bottom front
    const footrail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, l * 0.9, 12), this.materials.brass);
    footrail.rotation.z = Math.PI / 2;
    footrail.position.set(0, 0.15, w / 2 + 0.08);
    root.add(footrail);

    return root;
  }

  static buildFallbackItem(meta, data) {
    const dims = meta.dimensions || { width: 1, length: 1, height: 1 };
    const w = dims.width || dims.diameter || 1;
    const l = dims.length || dims.diameter || 1;
    const h = dims.height || 1;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(l, h, w), this.materials.gold);
    mesh.position.y = h / 2;
    return mesh;
  }
}

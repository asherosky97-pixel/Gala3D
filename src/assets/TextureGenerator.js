import * as THREE from 'three';

/**
 * Procedural PBR Canvas Texture Generator
 * Creates seamless, realistic procedural textures completely offline.
 */
export class TextureGenerator {
  static cache = new Map();

  /**
   * Helper to create and cache a canvas texture
   */
  static getOrCreate(key, drawFn, size = 512) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    drawFn(ctx, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Parquet Hardwood Floor
   */
  static createWoodParquetTexture(size = 1024) {
    return this.getOrCreate('wood_parquet', (ctx, s) => {
      ctx.fillStyle = '#b37d4e';
      ctx.fillRect(0, 0, s, s);

      const planksY = 16;
      const plankH = s / planksY;
      const planksX = 4;
      const plankW = s / planksX;

      for (let y = 0; y < planksY; y++) {
        const rowOffset = (y % 2) * (plankW / 2);
        for (let x = -1; x <= planksX; x++) {
          const px = x * plankW + rowOffset;
          const py = y * plankH;

          // Subtle plank color variance
          const hueVar = (Math.sin(x * 12.3 + y * 7.7) * 0.5 + 0.5) * 20 - 10;
          const lightVar = (Math.cos(x * 5.1 + y * 13.9) * 0.5 + 0.5) * 15 - 7;
          ctx.fillStyle = `hsl(${28 + hueVar}, 48%, ${48 + lightVar}%)`;
          ctx.fillRect(px, py, plankW, plankH);

          // Wood grain lines
          ctx.strokeStyle = `rgba(80, 45, 15, 0.15)`;
          ctx.lineWidth = 1;
          for (let g = 0; g < plankH; g += 3 + Math.random() * 4) {
            ctx.beginPath();
            ctx.moveTo(px, py + g);
            ctx.lineTo(px + plankW, py + g + (Math.random() - 0.5) * 2);
            ctx.stroke();
          }

          // Plank border bevel
          ctx.strokeStyle = '#5a3717';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, py, plankW, plankH);
        }
      }
    }, size);
  }

  /**
   * Luxury Polished Marble (White or Black)
   */
  static createMarbleTexture(isDark = false, size = 1024) {
    const key = isDark ? 'marble_dark' : 'marble_light';
    return this.getOrCreate(key, (ctx, s) => {
      // Base background
      ctx.fillStyle = isDark ? '#141416' : '#f4f4f7';
      ctx.fillRect(0, 0, s, s);

      // Noise cloud base
      for (let i = 0; i < 4000; i++) {
        const x = Math.random() * s;
        const y = Math.random() * s;
        const r = Math.random() * 80 + 20;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        if (isDark) {
          grad.addColorStop(0, 'rgba(40, 40, 45, 0.08)');
          grad.addColorStop(1, 'rgba(20, 20, 22, 0)');
        } else {
          grad.addColorStop(0, 'rgba(220, 222, 230, 0.12)');
          grad.addColorStop(1, 'rgba(244, 244, 247, 0)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Elegant organic marble veins
      const veinColor = isDark ? 'rgba(200, 160, 90, 0.35)' : 'rgba(120, 125, 140, 0.3)';
      const thinVeinColor = isDark ? 'rgba(230, 200, 140, 0.2)' : 'rgba(160, 165, 175, 0.2)';

      const drawVein = (startX, startY, length, angle, width, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        let curX = startX;
        let curY = startY;
        ctx.moveTo(curX, curY);

        for (let j = 0; j < length; j++) {
          angle += (Math.random() - 0.5) * 0.3;
          curX += Math.cos(angle) * 8;
          curY += Math.sin(angle) * 8;
          ctx.lineTo(curX, curY);

          if (Math.random() < 0.08 && width > 1) {
            drawVein(curX, curY, length * 0.4, angle + (Math.random() - 0.5) * 1.2, width * 0.5, thinVeinColor);
          }
        }
        ctx.stroke();
      };

      for (let v = 0; v < 8; v++) {
        drawVein(Math.random() * s, Math.random() * s, 60, Math.random() * Math.PI * 2, 2.5, veinColor);
      }
    }, size);
  }

  /**
   * Royal Banquet Carpet (Patterned Damask)
   */
  static createCarpetTexture(color = '#721727', size = 512) {
    return this.getOrCreate(`carpet_${color}`, (ctx, s) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, s, s);

      // Fine woven grain noise
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let y = 0; y < s; y += 4) {
        for (let x = 0; x < s; x += 4) {
          if ((x + y) % 8 === 0) {
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }

      // Elegant diamond pattern
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)'; // Gold trim
      ctx.lineWidth = 2;
      const step = s / 8;
      for (let y = 0; y <= s; y += step) {
        for (let x = 0; x <= s; x += step) {
          ctx.beginPath();
          ctx.moveTo(x + step / 2, y);
          ctx.lineTo(x + step, y + step / 2);
          ctx.lineTo(x + step / 2, y + step);
          ctx.lineTo(x, y + step / 2);
          ctx.closePath();
          ctx.stroke();

          // Small center star / rosette
          ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
          ctx.beginPath();
          ctx.arc(x + step / 2, y + step / 2, step * 0.12, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }, size);
  }

  /**
   * Fresh Outdoor Event Lawn (Grass)
   */
  static createGrassTexture(size = 512) {
    return this.getOrCreate('grass', (ctx, s) => {
      ctx.fillStyle = '#3a6b28';
      ctx.fillRect(0, 0, s, s);

      // Grass blade noise
      for (let i = 0; i < 20000; i++) {
        const x = Math.random() * s;
        const y = Math.random() * s;
        const shade = Math.random() > 0.5 ? '#4a8234' : '#2d541e';
        ctx.fillStyle = shade;
        ctx.fillRect(x, y, 1.5, 3 + Math.random() * 3);
      }
    }, size);
  }

  /**
   * Polished Industrial Concrete
   */
  static createConcreteTexture(size = 512) {
    return this.getOrCreate('concrete', (ctx, s) => {
      ctx.fillStyle = '#8c8e92';
      ctx.fillRect(0, 0, s, s);

      for (let i = 0; i < 15000; i++) {
        const x = Math.random() * s;
        const y = Math.random() * s;
        const gray = Math.floor(110 + (Math.random() - 0.5) * 50);
        ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.2)`;
        ctx.fillRect(x, y, 2, 2);
      }

      // Subtle concrete expansion joints
      ctx.strokeStyle = '#6e7074';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, s, s);
    }, size);
  }

  /**
   * Classic Checkered Dance Floor (Glossy Black & White)
   */
  static createCheckeredTexture(size = 512) {
    return this.getOrCreate('checkered', (ctx, s) => {
      const tiles = 8;
      const tileSize = s / tiles;
      for (let y = 0; y < tiles; y++) {
        for (let x = 0; x < tiles; x++) {
          const isWhite = (x + y) % 2 === 0;
          ctx.fillStyle = isWhite ? '#f8f8fa' : '#111215';
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

          // Subtle glossy inner border
          ctx.strokeStyle = isWhite ? '#d0d0d8' : '#222329';
          ctx.lineWidth = 1;
          ctx.strokeRect(x * tileSize + 1, y * tileSize + 1, tileSize - 2, tileSize - 2);
        }
      }
    }, size);
  }

  /**
   * Starlight / LED Dance Floor
   */
  static createStarlightTexture(size = 512) {
    return this.getOrCreate('starlight', (ctx, s) => {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, s, s);

      // Acrylic tile grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      const tiles = 8;
      const step = s / tiles;
      for (let y = 0; y < tiles; y++) {
        for (let x = 0; x < tiles; x++) {
          ctx.strokeRect(x * step, y * step, step, step);

          // Embedded glowing LED star dots
          for (let l = 0; l < 4; l++) {
            const lx = x * step + (step * (0.2 + l * 0.2));
            const ly = y * step + (step * (0.2 + (l % 2) * 0.4));
            const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 6);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.3, 'rgba(180, 220, 255, 0.8)');
            grad.addColorStop(1, 'rgba(100, 160, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(lx, ly, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }, size);
  }

  /**
   * 2D CAD Blueprint Grid Texture
   */
  static createGridTexture(size = 512) {
    return this.getOrCreate('cad_grid', (ctx, s) => {
      ctx.fillStyle = 'rgba(240, 243, 248, 0.95)';
      ctx.fillRect(0, 0, s, s);

      // Minor gridlines (0.25m equivalent)
      ctx.strokeStyle = 'rgba(180, 195, 215, 0.4)';
      ctx.lineWidth = 1;
      const minor = s / 20;
      for (let i = 0; i <= s; i += minor) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, s);
        ctx.moveTo(0, i);
        ctx.lineTo(s, i);
        ctx.stroke();
      }

      // Major gridlines (1.0m equivalent)
      ctx.strokeStyle = 'rgba(100, 130, 170, 0.7)';
      ctx.lineWidth = 1.5;
      const major = s / 5;
      for (let i = 0; i <= s; i += major) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, s);
        ctx.moveTo(0, i);
        ctx.lineTo(s, i);
        ctx.stroke();
      }
    }, size);
  }
}

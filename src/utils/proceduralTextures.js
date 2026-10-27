import * as THREE from 'three';

/**
 * Generates a procedural high-res woven fabric normal & bump map
 */
export function createFabricTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      // Herringbone / twill weave pattern
      const twill = Math.sin((x + y * 2) * 0.4) * 0.5 + 0.5;
      const noise = (Math.random() - 0.5) * 25;
      const fineWeave = Math.sin(x * 1.8) * Math.cos(y * 1.8) * 15;

      const r = Math.min(255, Math.max(0, 128 + (twill * 40 - 20) + noise * 0.5));
      const g = Math.min(255, Math.max(0, 128 + fineWeave + noise * 0.5));
      const b = 255;

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

/**
 * Generates a realistic dark walnut wood grain texture for hangers
 */
export function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Base rich dark walnut
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#2b1a13');
  grad.addColorStop(0.3, '#3a241b');
  grad.addColorStop(0.7, '#24150e');
  grad.addColorStop(1, '#341f16');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Wood rings and grain streaks
  ctx.strokeStyle = 'rgba(15, 8, 4, 0.4)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 45; i++) {
    ctx.beginPath();
    const y = i * 6 + (Math.random() * 4);
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      150, y + (Math.random() - 0.5) * 12,
      350, y + (Math.random() - 0.5) * 12,
      512, y
    );
    ctx.stroke();
  }

  // Subtle golden grain highlight
  ctx.strokeStyle = 'rgba(180, 120, 70, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    const y = i * 13 + (Math.random() * 6);
    ctx.moveTo(0, y);
    ctx.lineTo(512, y + (Math.random() - 0.5) * 8);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Generates a soft radial floor contact shadow texture
 */
export function createContactShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.4)');
  grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}


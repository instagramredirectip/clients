import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

/**
 * Builds realistic, tailored 3D luxury garment meshes
 * Origin (0,0,0) is calibrated to the top of the rail contact point!
 */
export function buildGarmentMesh(type, material, woodTexture) {
  const group = new THREE.Group();

  // 1. Hanger & Hook Group (Origin at rail contact point y = 0)
  const hangerGroup = new THREE.Group();

  // Polished Chrome Hook curving over the rail (rail radius is 0.038)
  const hookCurve = new THREE.CurvePath();
  // Open hook tip on the right
  const tip = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0.065, -0.02, 0),
    new THREE.Vector3(0.065, 0.045, 0),
    new THREE.Vector3(0.02, 0.052, 0),
    new THREE.Vector3(0.0, 0.052, 0)
  );
  hookCurve.add(tip);
  // Curve over the top of the rail
  const arch = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0.0, 0.052, 0),
    new THREE.Vector3(-0.055, 0.052, 0),
    new THREE.Vector3(-0.055, -0.02, 0),
    new THREE.Vector3(-0.02, -0.06, 0)
  );
  hookCurve.add(arch);
  // Vertical stem down to the wooden hanger
  const stem = new THREE.LineCurve3(
    new THREE.Vector3(-0.02, -0.06, 0),
    new THREE.Vector3(0.0, -0.22, 0)
  );
  hookCurve.add(stem);

  const hookGeo = new THREE.TubeGeometry(hookCurve, 32, 0.007, 12, false);
  const hookMat = new THREE.MeshStandardMaterial({
    metalness: 0.98,
    roughness: 0.12,
    color: 0xf0f0f5
  });
  const hookMesh = new THREE.Mesh(hookGeo, hookMat);
  hangerGroup.add(hookMesh);

  // Wooden curved hanger bar at y = -0.24
  const hangerWidth = 1.05;
  const hangerCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-hangerWidth / 2, -0.32, 0),
    new THREE.Vector3(-hangerWidth / 4, -0.26, 0.01),
    new THREE.Vector3(0, -0.22, 0.02),
    new THREE.Vector3(hangerWidth / 4, -0.26, 0.01),
    new THREE.Vector3(hangerWidth / 2, -0.32, 0)
  ]);
  const hangerBarGeo = new THREE.TubeGeometry(hangerCurve, 32, 0.024, 12, false);
  hangerBarGeo.scale(1.0, 0.65, 1.0); // Make it slightly flatter like a wooden suit hanger
  const hangerMat = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.32,
    metalness: 0.05,
    color: 0x3a2318
  });
  const hangerBarMesh = new THREE.Mesh(hangerBarGeo, hangerMat);
  hangerGroup.add(hangerBarMesh);

  // Brass hardware swivel joint
  const jointGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.035, 16);
  const jointMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.9,
    roughness: 0.2
  });
  const jointMesh = new THREE.Mesh(jointGeo, jointMat);
  jointMesh.position.set(0, -0.22, 0.02);
  hangerGroup.add(jointMesh);

  group.add(hangerGroup);

  // 2. Garment Body Mesh Group (Hanging naturally from y = -0.24)
  const garmentBody = new THREE.Group();
  garmentBody.name = 'garmentBody';

  // Proportions per garment type
  let coatLength = 1.35;
  let shoulderSpan = 1.08;
  let chestWidth = 0.54;
  let waistWidth = 0.48;
  let hemWidth = 0.58;
  let depth = 0.24;

  if (type === 'overcoat') {
    coatLength = 1.48;
    shoulderSpan = 1.12;
    chestWidth = 0.56;
    waistWidth = 0.52;
    hemWidth = 0.62;
    depth = 0.26;
  } else if (type === 'blazer') {
    coatLength = 1.05;
    shoulderSpan = 1.06;
    chestWidth = 0.52;
    waistWidth = 0.44;
    hemWidth = 0.52;
    depth = 0.22;
  } else if (type === 'trench') {
    coatLength = 1.55;
    shoulderSpan = 1.10;
    chestWidth = 0.54;
    waistWidth = 0.46;
    hemWidth = 0.66;
    depth = 0.25;
  } else if (type === 'carcoat') {
    coatLength = 1.25;
    shoulderSpan = 1.08;
    chestWidth = 0.54;
    waistWidth = 0.52;
    hemWidth = 0.56;
    depth = 0.24;
  } else if (type === 'bomber') {
    coatLength = 0.88;
    shoulderSpan = 1.08;
    chestWidth = 0.54;
    waistWidth = 0.46;
    hemWidth = 0.45;
    depth = 0.25;
  }

  // Torso / Body: Sculpted parametric cross-section
  const torsoGeo = new THREE.CylinderGeometry(
    chestWidth * 0.5,
    hemWidth * 0.5,
    coatLength,
    32,
    20,
    true
  );
  // Flatten depth for realistic tailored jacket cross section
  torsoGeo.scale(1.0, 1.0, depth / (chestWidth * 0.5));
  // Position so top aligns with shoulders at y = -0.24
  torsoGeo.translate(0, -0.24 - coatLength / 2, 0);

  // Add organic tailoring wave & waist suppression
  const pos = torsoGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const pz = pos.getZ(i);

    // Normalized Y from 0 (top) to 1 (hem)
    const normY = THREE.MathUtils.clamp((-0.24 - py) / coatLength, 0, 1);

    // Waist pinch around normY = 0.4
    const waistPinch = 1.0 - Math.exp(-Math.pow((normY - 0.38) * 4.0, 2)) * 0.12;

    // Organic cloth ripples
    const clothRipple = Math.sin(py * 10.0 + px * 5.0) * 0.008;

    pos.setX(i, px * waistPinch);
    pos.setZ(i, pz * waistPinch + clothRipple);
  }
  torsoGeo.computeVertexNormals();

  const torsoMesh = new THREE.Mesh(torsoGeo, material);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  garmentBody.add(torsoMesh);

  // Structured Shoulder Cap & Sloping Yoke
  const yokeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-shoulderSpan / 2, -0.32, 0),
    new THREE.Vector3(-shoulderSpan / 4, -0.25, 0.02),
    new THREE.Vector3(0, -0.22, 0.03),
    new THREE.Vector3(shoulderSpan / 4, -0.25, 0.02),
    new THREE.Vector3(shoulderSpan / 2, -0.32, 0)
  ]);
  const yokeGeo = new THREE.TubeGeometry(yokeCurve, 32, 0.045, 12, false);
  yokeGeo.scale(1.0, 0.7, 1.2);
  const yokeMesh = new THREE.Mesh(yokeGeo, material);
  garmentBody.add(yokeMesh);

  // Left & Right Sleeves draping naturally downwards
  const sleeveLength = coatLength * 0.82;
  const sleeveTopRadius = 0.12;
  const sleeveCuffRadius = 0.085;

  // Left Sleeve Curve
  const leftSleeveCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-shoulderSpan * 0.48, -0.32, 0),
    new THREE.Vector3(-shoulderSpan * 0.52, -0.32 - sleeveLength * 0.45, 0.02),
    new THREE.Vector3(-shoulderSpan * 0.50, -0.32 - sleeveLength, 0.04)
  ]);
  const leftSleeveGeo = new THREE.TubeGeometry(leftSleeveCurve, 24, sleeveTopRadius, 16, false);
  const leftSleeve = new THREE.Mesh(leftSleeveGeo, material);
  garmentBody.add(leftSleeve);

  // Right Sleeve Curve
  const rightSleeveCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(shoulderSpan * 0.48, -0.32, 0),
    new THREE.Vector3(shoulderSpan * 0.52, -0.32 - sleeveLength * 0.45, 0.02),
    new THREE.Vector3(shoulderSpan * 0.50, -0.32 - sleeveLength, 0.04)
  ]);
  const rightSleeveGeo = new THREE.TubeGeometry(rightSleeveCurve, 24, sleeveTopRadius, 16, false);
  const rightSleeve = new THREE.Mesh(rightSleeveGeo, material);
  garmentBody.add(rightSleeve);

  // Tailored Folded Collar / Lapel hugging the neck cleanly
  const collarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.16, -0.55, depth * 0.52),
    new THREE.Vector3(-0.18, -0.38, depth * 0.54),
    new THREE.Vector3(-0.12, -0.22, depth * 0.45),
    new THREE.Vector3(0, -0.20, -depth * 0.35),
    new THREE.Vector3(0.12, -0.22, depth * 0.45),
    new THREE.Vector3(0.18, -0.38, depth * 0.54),
    new THREE.Vector3(0.16, -0.55, depth * 0.52)
  ]);
  const collarGeo = new THREE.TubeGeometry(collarCurve, 32, 0.028, 12, false);
  collarGeo.scale(1.2, 0.5, 1.0);
  const collarMesh = new THREE.Mesh(collarGeo, material);
  garmentBody.add(collarMesh);

  // Center Placket line down the front
  const placketGeo = new THREE.BoxGeometry(0.016, coatLength * 0.85, 0.012);
  const placketMat = new THREE.MeshStandardMaterial({
    color: 0x111113,
    roughness: 0.4
  });
  const placket = new THREE.Mesh(placketGeo, placketMat);
  placket.position.set(0.01, -0.26 - coatLength * 0.45, depth * 0.51);
  garmentBody.add(placket);

  // Distinct hardware / accents per piece
  if (type === 'trench') {
    // Integrated belt around waist
    const beltCurve = new THREE.EllipseCurve(0, 0, chestWidth * 0.48, depth * 0.55, 0, Math.PI * 2, false);
    const beltPts = beltCurve.getPoints(32).map(p => new THREE.Vector3(p.x, 0, p.y));
    const beltGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(beltPts, true), 32, 0.022, 12, true);
    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x221815,
      roughness: 0.35
    });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.set(0, -0.24 - coatLength * 0.38, 0);
    garmentBody.add(belt);

    // Brass buckle
    const buckleGeo = new THREE.BoxGeometry(0.07, 0.05, 0.02);
    const buckleMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.92,
      roughness: 0.18
    });
    const buckle = new THREE.Mesh(buckleGeo, buckleMat);
    buckle.position.set(0.06, -0.24 - coatLength * 0.38, depth * 0.58);
    garmentBody.add(buckle);
  } else if (type === 'overcoat' || type === 'blazer') {
    // Fine Horn buttons down placket
    const buttonGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.008, 16);
    buttonGeo.rotateX(Math.PI / 2);
    const buttonMat = new THREE.MeshStandardMaterial({
      color: 0x181412,
      roughness: 0.25,
      metalness: 0.3
    });
    const numButtons = type === 'overcoat' ? 4 : 3;
    for (let b = 0; b < numButtons; b++) {
      const button = new THREE.Mesh(buttonGeo, buttonMat);
      button.position.set(0.02, -0.45 - b * 0.18, depth * 0.52);
      garmentBody.add(button);
    }
  } else if (type === 'bomber') {
    // Metal zipper pull
    const zipPullGeo = new THREE.BoxGeometry(0.012, 0.04, 0.008);
    const zipPullMat = new THREE.MeshStandardMaterial({
      color: 0xd8d8de,
      metalness: 0.95,
      roughness: 0.15
    });
    const zipPull = new THREE.Mesh(zipPullGeo, zipPullMat);
    zipPull.position.set(0.015, -0.55, depth * 0.53);
    garmentBody.add(zipPull);
  }

  group.add(garmentBody);

  // 3. Mannequin Stand & Torso for "ON MODEL" mode
  const mannequinGroup = new THREE.Group();
  mannequinGroup.name = 'mannequin';
  mannequinGroup.visible = false;

  const mannequinMat = new THREE.MeshStandardMaterial({
    color: 0x18181c,
    roughness: 0.28,
    metalness: 0.1
  });
  const metalStandMat = new THREE.MeshStandardMaterial({
    color: 0x888890,
    metalness: 0.95,
    roughness: 0.18
  });

  // Torso neck rising from collar
  const neckGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.18, 16);
  const neckMesh = new THREE.Mesh(neckGeo, mannequinMat);
  neckMesh.position.set(0, -0.15, 0);
  mannequinGroup.add(neckMesh);

  // Polished brass neck cap
  const capGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 24);
  const capMat = new THREE.MeshStandardMaterial({
    color: 0xc5a880,
    metalness: 0.95,
    roughness: 0.15
  });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.set(0, -0.05, 0);
  mannequinGroup.add(capMesh);

  // Floor Stand Rod
  const standRodGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.8, 16);
  const standRod = new THREE.Mesh(standRodGeo, metalStandMat);
  standRod.position.set(0, -0.24 - coatLength - 0.45, 0);
  mannequinGroup.add(standRod);

  // Heavy circular weighted base on floor
  const baseGeo = new THREE.CylinderGeometry(0.28, 0.30, 0.03, 32);
  const baseMesh = new THREE.Mesh(baseGeo, metalStandMat);
  baseMesh.position.set(0, -0.24 - coatLength - 1.34, 0);
  mannequinGroup.add(baseMesh);

  group.add(mannequinGroup);

  return {
    group,
    garmentBody,
    hangerGroup,
    mannequinGroup,
    coatLength
  };
}

/**
 * Loads a real 3D garment model (.glb / .gltf) and fits it to the hanger
 * @param {string} modelUrl - Path to .glb file in public folder (e.g. '/models/dress-01.glb')
 * @param {THREE.Group} targetGarmentBody - The garment body container
 * @param {THREE.ShaderMaterial} [shaderMaterial] - Optional GLSL material for color wipe
 * @param {Function} [onLoaded] - Callback when model loads successfully
 */
export function loadRealGarmentModel(modelUrl, targetGarmentBody, onLoaded) {
  if (!modelUrl) return;

  gltfLoader.load(
    modelUrl,
    (gltf) => {
      const model = gltf.scene;

      // 1. Calculate bounding box of imported model
      const bbox = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      // 2. Normalize scale: target length ~1.30m to 1.45m (luxurious, bigger presentation)
      const isCoat = modelUrl.includes('coat') || modelUrl.includes('jacket');
      const targetLength = isCoat ? 1.42 : 1.30;
      const scale = targetLength / (size.y || 1);
      model.scale.setScalar(scale);

      // Recalculate bounding box after scaling
      bbox.setFromObject(model);
      bbox.getSize(size);
      bbox.getCenter(center);

      // 3. Anchor shoulder line directly on wooden hanger at y = -0.24
      const isHoodie = modelUrl.includes('hoodie');
      const shoulderFactor = isHoodie ? 0.83 : 0.88;
      const shoulderY = bbox.min.y + shoulderFactor * size.y;
      model.position.x = -center.x;
      model.position.y = -0.24 - shoulderY;
      model.position.z = -center.z;

      // 4. PRESERVE AUTHENTIC MATERIALS & TEXTURES (DO NOT OVERWRITE WITH SHADER!)
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat) => {
              mat.side = THREE.DoubleSide;
              if (!mat.userData.origColor && mat.color) {
                mat.userData.origColor = mat.color.clone();
              }
              mat.needsUpdate = true;
            });
          }
        }
      });

      // 5. Hide procedural torso and mount real model
      targetGarmentBody.children.forEach((c) => {
        c.visible = false;
      });
      targetGarmentBody.add(model);
      targetGarmentBody.userData.importedModel = model;

      if (onLoaded) onLoaded(model);
    },
    undefined,
    (err) => {
      console.info(`[Atelier Valois] Model '${modelUrl}' not found; using procedural tailored mesh.`, err);
      if (onLoaded) onLoaded(null);
    }
  );
}

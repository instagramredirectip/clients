import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { PIECES } from '../data/pieces';
import { createFabricTexture, createWoodTexture, createContactShadowTexture } from '../utils/proceduralTextures';
import { createGarmentShaderMaterial } from '../utils/garmentShader';
import { buildGarmentMesh, loadRealGarmentModel } from '../utils/garmentGeometry';

export default function ThreeCanvas({
  activePieceIndex,
  setActivePieceIndex,
  isExploring,
  activeColorIndex,
  viewMode, // 'hanger' | 'model'
  isDarkTheme,
  onPieceClick
}) {
  const mountRef = useRef(null);

  // References to preserve scene state across re-renders
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const garmentsRef = useRef([]);
  const railCurveRef = useRef(null);
  const animFrameRef = useRef(null);
  const lightsRef = useRef({});
  const isMobileRef = useRef(false);
  const isExploringRef = useRef(isExploring);
  isExploringRef.current = isExploring;
  const activePieceIndexRef = useRef(activePieceIndex);
  activePieceIndexRef.current = activePieceIndex;

  // Progressive model loading queue
  const modelQueueRef = useRef([]);
  const loadedSetRef = useRef(new Set());
  const processQueueRef = useRef(null);

  // Carousel motion physics state
  const carouselState = useRef({
    targetOffset: activePieceIndex,
    currentOffset: activePieceIndex,
    velocity: 0,
    pendulumAngle: 0,
    pendulumVelocity: 0,
    isDragging: false,
    dragStartX: 0,
    lastDragX: 0,
    dragDistance: 0
  });

  // Track previous color for shaders
  const prevColorRef = useRef(activeColorIndex);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth || 800;
    const height = container.clientHeight || window.innerHeight || 600;
    const isMobile = width < 768 || (width / height) < 1.0;
    isMobileRef.current = isMobile;

    // --- 1. SCENE & RESPONSIVE CAMERA SETUP ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const bgColor = isDarkTheme ? 0x072214 : 0xF5EBD7;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, isMobile ? 0.05 : 0.08);

    // Initial camera perspective: perfectly calibrated for mobile portrait and desktop wide
    const initialCam = isMobile
      ? { pos: [0, 0.40, 5.0], look: [0, 0.36, 0], fov: 44 }
      : { pos: [0, 0.35, 4.3], look: [0, 0.30, 0], fov: 40 };

    const camera = new THREE.PerspectiveCamera(initialCam.fov, width / height, 0.1, 50);
    camera.position.set(...initialCam.pos);
    camera.lookAt(...initialCam.look);
    cameraRef.current = camera;

    // Mobile GPU Optimization: medium precision, disable expensive MSAA on high-DPI, locked 60fps
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDarkTheme ? 1.05 : 0.98;
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const dom = renderer.domElement;
    dom.style.touchAction = 'none';
    container.appendChild(dom);
    rendererRef.current = renderer;

    // --- 2. STUDIO LIGHTING ---
    const ambientLight = new THREE.AmbientLight(
      isDarkTheme ? 0x042416 : 0xEFE5D0,
      isDarkTheme ? (isMobile ? 1.6 : 1.3) : (isMobile ? 2.2 : 1.9)
    );
    scene.add(ambientLight);

    const keySpot = new THREE.SpotLight(0xfff8ee, isDarkTheme ? 4.5 : 3.9);
    keySpot.position.set(0, 5.2, 3.5);
    keySpot.angle = 0.65;
    keySpot.penumbra = 0.8;
    keySpot.decay = 1.2;
    keySpot.distance = 18;
    keySpot.castShadow = !isMobile;
    if (!isMobile) {
      keySpot.shadow.mapSize.width = 1024;
      keySpot.shadow.mapSize.height = 1024;
      keySpot.shadow.bias = -0.0001;
    }
    scene.add(keySpot);

    // Rim lights: enabled on desktop; omitted on mobile to save fragment shader cost
    let rimLeft = null;
    let rimRight = null;
    if (!isMobile) {
      rimLeft = new THREE.SpotLight(0x087A46, isDarkTheme ? 3.0 : 1.6);
      rimLeft.position.set(-4.5, 3.2, -1.8);
      rimLeft.angle = 0.75;
      rimLeft.penumbra = 0.9;
      scene.add(rimLeft);

      rimRight = new THREE.SpotLight(0xFFECD0, isDarkTheme ? 2.5 : 1.8);
      rimRight.position.set(4.5, 3.2, -1.8);
      rimRight.angle = 0.75;
      rimRight.penumbra = 0.9;
      scene.add(rimRight);
    }

    const fillLight = new THREE.DirectionalLight(0xffffff, isDarkTheme ? 0.6 : 0.9);
    fillLight.position.set(0, 1, 5);
    scene.add(fillLight);

    lightsRef.current = { ambientLight, keySpot, rimLeft, rimRight, fillLight };

    // --- 3. CURVED METALLIC CHROME RAIL & ARCHITECTURE ---
    const railCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.6, 1.15, -1.2),
      new THREE.Vector3(-2.3, 1.25, -0.2),
      new THREE.Vector3(0, 1.28, 0.4),
      new THREE.Vector3(2.3, 1.25, -0.2),
      new THREE.Vector3(4.6, 1.15, -1.2)
    ]);
    railCurveRef.current = railCurve;

    const railGeo = new THREE.TubeGeometry(railCurve, 128, 0.038, 24, false);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xf2f2f7,
      metalness: 0.98,
      roughness: 0.12,
      envMapIntensity: 1.5
    });
    const railMesh = new THREE.Mesh(railGeo, railMat);
    railMesh.castShadow = !isMobile;
    railMesh.receiveShadow = !isMobile;
    scene.add(railMesh);

    const endCapGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const cap1 = new THREE.Mesh(endCapGeo, railMat);
    cap1.position.copy(railCurve.getPointAt(0));
    scene.add(cap1);
    const cap2 = new THREE.Mesh(endCapGeo, railMat);
    cap2.position.copy(railCurve.getPointAt(1));
    scene.add(cap2);

    const rodPos1 = railCurve.getPointAt(0.24);
    const rodPos2 = railCurve.getPointAt(0.76);
    const ceilingRodGeo = new THREE.CylinderGeometry(0.016, 0.016, 2.8, 16);
    const ceilingFlangeGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.025, 16);

    const rod1 = new THREE.Mesh(ceilingRodGeo, railMat);
    rod1.position.set(rodPos1.x, rodPos1.y + 1.4, rodPos1.z);
    scene.add(rod1);
    const flange1 = new THREE.Mesh(ceilingFlangeGeo, railMat);
    flange1.position.set(rodPos1.x, rodPos1.y + 2.8, rodPos1.z);
    scene.add(flange1);

    const rod2 = new THREE.Mesh(ceilingRodGeo, railMat);
    rod2.position.set(rodPos2.x, rodPos2.y + 1.4, rodPos2.z);
    scene.add(rod2);
    const flange2 = new THREE.Mesh(ceilingFlangeGeo, railMat);
    flange2.position.set(rodPos2.x, rodPos2.y + 2.8, rodPos2.z);
    scene.add(flange2);

    // --- 4. CREATE 5 LUXURY GARMENTS ON CURVED RAIL ---
    const fabricTex = createFabricTexture();
    const woodTex = createWoodTexture();
    const shadowTex = createContactShadowTexture();

    const garments = [];

    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: isDarkTheme ? 0.85 : 0.45,
      depthWrite: false
    });

    PIECES.forEach((piece, index) => {
      const defaultColor = piece.colors[piece.defaultColorIndex];
      const shaderMat = createGarmentShaderMaterial(defaultColor.rgb, fabricTex, isDarkTheme);

      const { group, garmentBody, hangerGroup, mannequinGroup } = buildGarmentMesh(
        piece.garmentType,
        shaderMat,
        woodTex
      );

      // Floor Contact Shadow plane (zero-cost baked shadow)
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat.clone());
      shadowMesh.position.set(0, -1.95, 0);
      scene.add(shadowMesh);

      group.userData = { pieceIndex: index };
      garmentBody.userData = { pieceIndex: index };

      scene.add(group);

      garments.push({
        group,
        garmentBody,
        hangerGroup,
        mannequinGroup,
        shaderMat,
        shadowMesh,
        index
      });
    });

    garmentsRef.current = garments;

    // --- 4B. SMART PROGRESSIVE MODEL LOADING QUEUE (BUTTER SMOOTH) ---
    // Load active piece first so the user sees their current item immediately!
    // On mobile: avoid network bandwidth exhaustion and GC lag by only loading active piece initially
    const initialQueue = [activePieceIndex];
    if (!isMobile) {
      for (let i = 0; i < PIECES.length; i++) {
        if (!initialQueue.includes(i)) initialQueue.push(i);
      }
    }
    modelQueueRef.current = initialQueue;

    let isLoadingModel = false;
    const processModelQueue = () => {
      if (isLoadingModel || modelQueueRef.current.length === 0) return;
      const nextIdx = modelQueueRef.current.shift();
      if (loadedSetRef.current.has(nextIdx)) {
        processModelQueue();
        return;
      }
      const item = garments[nextIdx];
      const p = PIECES[nextIdx];
      if (item && p && p.modelPath) {
        isLoadingModel = true;
        loadedSetRef.current.add(nextIdx);
        loadRealGarmentModel(p.modelPath, item.garmentBody, () => {
          isLoadingModel = false;
          // Yield main thread for 60fps responsiveness
          setTimeout(processModelQueue, isMobileRef.current ? 400 : 150);
        });
      } else {
        processModelQueue();
      }
    };
    processQueueRef.current = processModelQueue;
    processModelQueue();

    // --- 5. ANIMATION & RENDER LOOP ---
    let lastTime = performance.now();
    let spinMomentum = 0;

    const animate = (currentTime) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = carouselState.current;

      // Smooth lerp to target offset
      const diff = state.targetOffset - state.currentOffset;
      state.currentOffset += diff * Math.min(delta * 9.0, 1.0);

      // Pendulum swing physics
      const springK = 28.0;
      const damping = 4.2;
      const displacement = state.pendulumAngle;
      const springForce = -springK * displacement;
      const dampingForce = -damping * state.pendulumVelocity;
      const totalForce = springForce + dampingForce;

      state.pendulumVelocity += totalForce * delta;
      state.pendulumAngle += state.pendulumVelocity * delta;

      // Update garments positioning along curved rail
      const totalPieces = PIECES.length;
      garments.forEach((item, i) => {
        let relPos = i - state.currentOffset;
        while (relPos > totalPieces / 2) relPos -= totalPieces;
        while (relPos < -totalPieces / 2) relPos += totalPieces;

        const t = THREE.MathUtils.clamp(0.5 + relPos * 0.20, 0.05, 0.95);
        const curvePoint = railCurve.getPointAt(t);

        item.group.position.copy(curvePoint);

        const tangent = railCurve.getTangentAt(t);
        const targetRotY = relPos * 0.45;

        // In explore mode, preserve user 360 drag rotation with smooth inertia on active item
        if (isExploringRef.current && i === activePieceIndexRef.current) {
          if (!state.isDragging && Math.abs(spinMomentum) > 0.0001) {
            item.group.rotation.y += spinMomentum;
            spinMomentum *= 0.93; // buttery tactile friction deceleration
          }
        } else {
          item.group.rotation.y = targetRotY;
        }

        const individualPhase = Math.sin(currentTime * 0.002 + i) * 0.008;
        item.group.rotation.z = state.pendulumAngle * (1.0 - Math.abs(relPos) * 0.25) + individualPhase;

        const distFromCenter = Math.abs(relPos);
        const targetScale = Math.max(0.85, 1.15 - distFromCenter * 0.12);
        item.group.scale.setScalar(targetScale);

        item.shadowMesh.position.set(curvePoint.x, -1.95, curvePoint.z);
        item.shadowMesh.scale.setScalar(targetScale * (1.0 + Math.abs(state.pendulumAngle) * 0.5));

        if (item.shaderMat) {
          item.shaderMat.uniforms.uTime.value = currentTime * 0.001;
        }
      });

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // --- 6. USER INTERACTIONS (TOUCH, DRAG, 360 ROTATE, RAYCASTING) ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e) => {
      const state = carouselState.current;
      state.isDragging = true;
      state.dragStartX = e.clientX;
      state.lastDragX = e.clientX;
      state.dragDistance = 0;
      spinMomentum = 0;
    };

    const handlePointerMove = (e) => {
      const state = carouselState.current;
      if (!state.isDragging) return;

      const deltaX = e.clientX - state.lastDragX;
      state.lastDragX = e.clientX;
      state.dragDistance += Math.abs(deltaX);

      // In Explore mode: 360-degree interactive horizontal finger/mouse rotation!
      if (isExploringRef.current) {
        const activeItem = garments[activePieceIndexRef.current];
        if (activeItem) {
          const deltaRot = deltaX * (isMobileRef.current ? 0.012 : 0.009);
          activeItem.group.rotation.y += deltaRot;
          spinMomentum = deltaRot * 0.75;
        }
        return;
      }

      // In Overview mode: scroll the curved rail carousel
      const sensitivity = isMobileRef.current ? 0.0038 : 0.0028;
      state.targetOffset -= deltaX * sensitivity;
      state.currentOffset = state.targetOffset;

      state.pendulumVelocity += -deltaX * 0.045;
    };

    const handlePointerUp = () => {
      const state = carouselState.current;
      if (!state.isDragging) return;
      state.isDragging = false;

      if (isExploringRef.current) return;

      const snapped = Math.round(state.targetOffset);
      const clamped = Math.max(0, Math.min(PIECES.length - 1, snapped));
      state.targetOffset = clamped;

      if (clamped !== activePieceIndexRef.current) {
        setActivePieceIndex(clamped);
      }
    };

    const handleClick = (e) => {
      const state = carouselState.current;
      if (state.dragDistance > 8) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const interactiveMeshes = [];
      garments.forEach((g) => {
        g.group.traverse((child) => {
          if (child.isMesh) {
            interactiveMeshes.push(child);
          }
        });
      });

      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && obj.userData?.pieceIndex === undefined && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.pieceIndex !== undefined) {
          const clickedIndex = obj.userData.pieceIndex;
          if (clickedIndex === activePieceIndexRef.current) {
            if (onPieceClick) onPieceClick();
          } else {
            setActivePieceIndex(clickedIndex);
          }
        }
      }
    };

    const handleWheel = (e) => {
      if (isExploringRef.current) return;
      e.preventDefault();
      const direction = Math.sign(e.deltaY || e.deltaX);
      if (Math.abs(e.deltaY) > 20 || Math.abs(e.deltaX) > 20) {
        const nextIndex = Math.max(0, Math.min(PIECES.length - 1, activePieceIndexRef.current + direction));
        if (nextIndex !== activePieceIndexRef.current) {
          setActivePieceIndex(nextIndex);
        }
      }
    };

    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    dom.addEventListener('click', handleClick);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // Window Resize Handler (Recalculates FOV & aspect for mobile/desktop)
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const isMob = w < 768 || (w / h) < 1.0;
      isMobileRef.current = isMob;

      camera.aspect = w / h;
      camera.fov = isMob ? 46 : 40;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMob ? 1.0 : 1.75));

      const cam = isExploringRef.current
        ? (isMob ? { x: 0, y: 0.35, z: 3.25, lx: 0, ly: 0.35 } : { x: 0.52, y: 0.32, z: 2.85, lx: 0.52, ly: 0.30 })
        : (isMob ? { x: 0, y: 0.40, z: 5.0, lx: 0, ly: 0.36 } : { x: 0, y: 0.35, z: 4.3, lx: 0, ly: 0.30 });

      camera.position.set(cam.x, cam.y, cam.z);
      camera.lookAt(cam.lx, cam.ly, 0);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      dom.removeEventListener('click', handleClick);
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // Run once on mount

  // --- 7. SYNC CAROUSEL INDEX ON STATE CHANGE ---
  useEffect(() => {
    const state = carouselState.current;
    if (state.targetOffset !== activePieceIndex) {
      const stepDiff = activePieceIndex - state.targetOffset;
      state.pendulumVelocity += -stepDiff * 1.8;
      gsap.to(state, {
        targetOffset: activePieceIndex,
        duration: 0.85,
        ease: 'power3.out'
      });
    }

    // Prioritize loading current active model if not yet loaded
    if (!loadedSetRef.current.has(activePieceIndex)) {
      modelQueueRef.current.unshift(activePieceIndex);
      if (processQueueRef.current) processQueueRef.current();
    }
  }, [activePieceIndex]);

  // --- 8. EXPLORE PIECE CAMERA PAN & FADE BACKGROUND PIECES ---
  useEffect(() => {
    const camera = cameraRef.current;
    const garments = garmentsRef.current;
    if (!camera || !garments) return;

    const isMobile = isMobileRef.current;

    if (isExploring) {
      // In Mobile explore: Dress centered and enlarged in the open viewing window above the bottom drawer!
      // In Desktop explore: Dress framed on the left half of the wide screen.
      const target = isMobile
        ? { x: 0, y: 0.35, z: 3.25, lookX: 0, lookY: 0.35, lookZ: 0 }
        : { x: 0.52, y: 0.32, z: 2.85, lookX: 0.52, lookY: 0.30, lookZ: 0 };

      gsap.to(camera.position, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 1.2,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.lookAt(target.lookX, target.lookY, target.lookZ);
        }
      });

      // Fade out background items into the studio fog
      garments.forEach((g) => {
        if (g.index !== activePieceIndex) {
          if (g.shaderMat) {
            gsap.to(g.shaderMat.uniforms.uOpacity, {
              value: 0.0,
              duration: 0.8,
              ease: 'power2.out'
            });
          }
          g.group.traverse((child) => {
            if (child.isMesh && child.material && child.material !== g.shaderMat) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((m) => {
                m.transparent = true;
                gsap.to(m, { opacity: 0.0, duration: 0.8, ease: 'power2.out' });
              });
            }
          });
          gsap.to(g.shadowMesh.material, {
            opacity: 0.0,
            duration: 0.8,
            ease: 'power2.out'
          });
        }
      });
    } else {
      // Restore camera to center overview of rail
      const target = isMobile
        ? { x: 0, y: 0.40, z: 5.0, lookX: 0, lookY: 0.36, lookZ: 0 }
        : { x: 0, y: 0.35, z: 4.3, lookX: 0, lookY: 0.30, lookZ: 0 };

      gsap.to(camera.position, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 1.2,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.lookAt(target.lookX, target.lookY, target.lookZ);
        }
      });

      // Fade all garments back in
      garments.forEach((g) => {
        if (g.shaderMat) {
          gsap.to(g.shaderMat.uniforms.uOpacity, {
            value: 1.0,
            duration: 0.9,
            ease: 'power2.out'
          });
        }
        g.group.traverse((child) => {
          if (child.isMesh && child.material && child.material !== g.shaderMat) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
              gsap.to(m, { opacity: 1.0, duration: 0.9, ease: 'power2.out' });
            });
          }
        });
        gsap.to(g.shadowMesh.material, {
          opacity: isDarkTheme ? 0.85 : 0.45,
          duration: 0.9,
          ease: 'power2.out'
        });
      });
    }
  }, [isExploring, activePieceIndex, isDarkTheme]);

  // --- 9. GLSL COLOR-WIPE SHADER ANIMATION ---
  useEffect(() => {
    const garments = garmentsRef.current;
    if (!garments || garments.length === 0) return;

    const activeGarment = garments[activePieceIndex];
    if (!activeGarment) return;

    const piece = PIECES[activePieceIndex];
    const prevColor = piece.colors[prevColorRef.current] || piece.colors[0];
    const newColor = piece.colors[activeColorIndex] || piece.colors[0];

    prevColorRef.current = activeColorIndex;

    const shaderMat = activeGarment.shaderMat;
    if (shaderMat) {
      shaderMat.uniforms.uColorPrev.value.set(...prevColor.rgb);
      shaderMat.uniforms.uColorNext.value.set(...newColor.rgb);
      shaderMat.uniforms.uWipeProgress.value = 0.0;

      gsap.to(shaderMat.uniforms.uWipeProgress, {
        value: 1.0,
        duration: 1.25,
        ease: 'power2.inOut',
        onComplete: () => {
          shaderMat.uniforms.uColorPrev.value.set(...newColor.rgb);
        }
      });
    }

    const importedModel = activeGarment.garmentBody?.userData?.importedModel;
    if (importedModel) {
      importedModel.traverse((child) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            if (m.color) {
              const targetColor = activeColorIndex === 0
                ? (m.userData.origColor || new THREE.Color(1, 1, 1))
                : new THREE.Color(...newColor.rgb);

              gsap.to(m.color, {
                r: targetColor.r,
                g: targetColor.g,
                b: targetColor.b,
                duration: 1.0,
                ease: 'power2.inOut'
              });
            }
          });
        }
      });
    }
  }, [activeColorIndex, activePieceIndex]);

  // --- 10. ON HANGER VS ON MODEL VIEW TOGGLE ---
  useEffect(() => {
    const garments = garmentsRef.current;
    if (!garments) return;

    const activeGarment = garments[activePieceIndex];
    if (!activeGarment) return;

    if (viewMode === 'model') {
      activeGarment.mannequinGroup.visible = true;
      gsap.to(activeGarment.hangerGroup.scale, {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          activeGarment.hangerGroup.visible = false;
        }
      });
      gsap.fromTo(
        activeGarment.mannequinGroup.position,
        { y: -0.2 },
        { y: 0, duration: 0.7, ease: 'back.out(1.4)' }
      );
    } else {
      activeGarment.hangerGroup.visible = true;
      gsap.to(activeGarment.hangerGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
        ease: 'back.out(1.2)'
      });
      activeGarment.mannequinGroup.visible = false;
    }
  }, [viewMode, activePieceIndex]);

  // --- 11. LIGHT / DARK THEME TRANSITION ---
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const lights = lightsRef.current;
    const garments = garmentsRef.current;
    if (!scene || !renderer || !lights) return;

    const targetBg = isDarkTheme ? 0x072214 : 0xF5EBD7;
    scene.background.set(targetBg);
    scene.fog.color.set(targetBg);

    renderer.toneMappingExposure = isDarkTheme ? 1.05 : 0.98;

    if (lights.ambientLight) {
      lights.ambientLight.color.set(isDarkTheme ? 0x042416 : 0xEFE5D0);
      lights.ambientLight.intensity = isDarkTheme ? 1.3 : 1.9;
    }
    if (lights.keySpot) {
      lights.keySpot.intensity = isDarkTheme ? 4.5 : 3.9;
    }
    if (lights.rimLeft) {
      lights.rimLeft.intensity = isDarkTheme ? 3.0 : 1.6;
    }
    if (lights.rimRight) {
      lights.rimRight.intensity = isDarkTheme ? 2.5 : 1.8;
    }
    if (lights.fillLight) {
      lights.fillLight.intensity = isDarkTheme ? 0.6 : 0.9;
    }

    if (garments) {
      garments.forEach((g) => {
        if (g.shaderMat?.uniforms?.uAmbientColor) {
          g.shaderMat.uniforms.uAmbientColor.value.set(
            isDarkTheme ? 0.02 : 0.15,
            isDarkTheme ? 0.08 : 0.14,
            isDarkTheme ? 0.05 : 0.12
          );
        }
        if (g.shadowMesh?.material) {
          g.shadowMesh.material.opacity = isDarkTheme ? 0.85 : 0.45;
        }
      });
    }
  }, [isDarkTheme]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
    />
  );
}

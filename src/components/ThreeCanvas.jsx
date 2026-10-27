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

    // --- 1. SCENE & CAMERA SETUP ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const bgColor = isDarkTheme ? 0x072214 : 0xF5EBD7;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.08);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(0, 0.05, 5.2);
    camera.lookAt(0, -0.05, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDarkTheme ? 1.05 : 0.98;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- 2. STUDIO LIGHTING ---
    // Ambient light tuned to Warm Ivory / Emerald
    const ambientLight = new THREE.AmbientLight(
      isDarkTheme ? 0x042416 : 0xEFE5D0,
      isDarkTheme ? 1.3 : 1.9
    );
    scene.add(ambientLight);

    // Overhead Key Spotlight
    const keySpot = new THREE.SpotLight(0xfff8ee, isDarkTheme ? 4.5 : 3.9);
    keySpot.position.set(0, 5.2, 3.5);
    keySpot.angle = 0.65;
    keySpot.penumbra = 0.8;
    keySpot.decay = 1.2;
    keySpot.distance = 18;
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    keySpot.shadow.bias = -0.0001;
    scene.add(keySpot);

    // Left Rim / Specular Spotlight (Emerald green edge tint)
    const rimLeft = new THREE.SpotLight(0x087A46, isDarkTheme ? 3.0 : 1.6);
    rimLeft.position.set(-4.5, 3.2, -1.8);
    rimLeft.angle = 0.75;
    rimLeft.penumbra = 0.9;
    scene.add(rimLeft);

    // Right Rim Spotlight (Warm ivory specular)
    const rimRight = new THREE.SpotLight(0xFFECD0, isDarkTheme ? 2.5 : 1.8);
    rimRight.position.set(4.5, 3.2, -1.8);
    rimRight.angle = 0.75;
    rimRight.penumbra = 0.9;
    scene.add(rimRight);

    // Front Soft Fill Light
    const fillLight = new THREE.DirectionalLight(0xffffff, isDarkTheme ? 0.6 : 0.9);
    fillLight.position.set(0, 1, 5);
    scene.add(fillLight);

    lightsRef.current = { ambientLight, keySpot, rimLeft, rimRight, fillLight };

    // --- 3. CURVED METALLIC CHROME RAIL & ARCHITECTURE ---
    // Cubic 3D curve spanning across the upper viewport
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
    railMesh.castShadow = true;
    railMesh.receiveShadow = true;
    scene.add(railMesh);

    // Chrome End Caps
    const endCapGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const endCap1 = new THREE.Mesh(endCapGeo, railMat);
    endCap1.position.copy(railCurve.getPointAt(0));
    scene.add(endCap1);

    const endCap2 = new THREE.Mesh(endCapGeo, railMat);
    endCap2.position.copy(railCurve.getPointAt(1));
    scene.add(endCap2);

    // Ceiling Suspension Rods
    const ceilingRodGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.8, 16);
    const ceilingFlangeGeo = new THREE.CylinderGeometry(0.075, 0.08, 0.04, 24);

    // Rod 1 (Left)
    const rodPos1 = railCurve.getPointAt(0.28);
    const rod1 = new THREE.Mesh(ceilingRodGeo, railMat);
    rod1.position.set(rodPos1.x, rodPos1.y + 1.4, rodPos1.z);
    scene.add(rod1);
    const flange1 = new THREE.Mesh(ceilingFlangeGeo, railMat);
    flange1.position.set(rodPos1.x, rodPos1.y + 2.8, rodPos1.z);
    scene.add(flange1);

    // Rod 2 (Right)
    const rodPos2 = railCurve.getPointAt(0.72);
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

    // Shadow plane geometry
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

      // If a real 3D model path (.glb) is provided, load and fit it to hanger
      if (piece.modelPath) {
        loadRealGarmentModel(piece.modelPath, garmentBody, shaderMat);
      }

      // Floor Contact Shadow plane
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat.clone());
      shadowMesh.position.set(0, -1.95, 0);
      scene.add(shadowMesh);

      // Store piece metadata on mesh group for raycasting
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

    // --- 5. ANIMATION & RENDER LOOP ---
    let lastTime = performance.now();

    const animate = (currentTime) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = carouselState.current;

      // Smooth lerp to target offset
      const diff = state.targetOffset - state.currentOffset;
      state.currentOffset += diff * Math.min(delta * 9.0, 1.0);

      // Update pendulum swing physics
      const springK = 28.0;
      const damping = 4.2;
      const displacement = state.pendulumAngle;
      const springForce = -springK * displacement;
      const dampingForce = -damping * state.pendulumVelocity;
      const totalForce = springForce + dampingForce;

      state.pendulumVelocity += totalForce * delta;
      state.pendulumAngle += state.pendulumVelocity * delta;

      // Update garments positioning along curved rail
      const totalPieces = PIECES.length; // 5
      garments.forEach((item, i) => {
        // Calculate relative position where 0 = active center piece
        let relPos = i - state.currentOffset;
        // Wrap around to keep within view bounds cleanly
        while (relPos > totalPieces / 2) relPos -= totalPieces;
        while (relPos < -totalPieces / 2) relPos += totalPieces;

        // Map relPos (-2 to +2) to curve parameter t (0.05 to 0.95)
        // Center piece is at t = 0.50
        const t = THREE.MathUtils.clamp(0.5 + relPos * 0.20, 0.05, 0.95);
        const curvePoint = railCurve.getPointAt(t);

        // Position group directly on rail hook contact point
        item.group.position.copy(curvePoint);

        // Orient group along curve normal & angle side items inward
        const tangent = railCurve.getTangentAt(t);
        const angleY = Math.atan2(tangent.z, tangent.x);

        // Center piece faces camera (rot.y = 0), side pieces tilt inward
        const targetRotY = relPos * 0.45;
        item.group.rotation.y = targetRotY;

        // Apply dynamic pendulum sway on Z-axis
        const individualPhase = Math.sin(currentTime * 0.002 + i) * 0.008;
        item.group.rotation.z = state.pendulumAngle * (1.0 - Math.abs(relPos) * 0.25) + individualPhase;

        // Scale: active piece = 1.0, side pieces slightly scaled down
        const distFromCenter = Math.abs(relPos);
        const targetScale = Math.max(0.74, 1.0 - distFromCenter * 0.12);
        item.group.scale.setScalar(targetScale);

        // Floor shadow follows garment horizontally
        item.shadowMesh.position.set(curvePoint.x, -1.95, curvePoint.z);
        item.shadowMesh.scale.setScalar(targetScale * (1.0 + Math.abs(state.pendulumAngle) * 0.5));

        // Update shader uniforms
        if (item.shaderMat) {
          item.shaderMat.uniforms.uTime.value = currentTime * 0.001;
        }
      });

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // --- 6. USER INTERACTIONS (DRAG, SCROLL, RAYCASTING) ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e) => {
      if (isExploring) return;
      const state = carouselState.current;
      state.isDragging = true;
      state.dragStartX = e.clientX;
      state.lastDragX = e.clientX;
      state.dragDistance = 0;
    };

    const handlePointerMove = (e) => {
      const state = carouselState.current;
      if (!state.isDragging || isExploring) return;

      const deltaX = e.clientX - state.lastDragX;
      state.lastDragX = e.clientX;
      state.dragDistance += Math.abs(deltaX);

      // Sensitivity factor
      const sensitivity = 0.0028;
      state.targetOffset -= deltaX * sensitivity;
      state.currentOffset = state.targetOffset;

      // Add pendulum swing impulse proportional to drag velocity
      state.pendulumVelocity += -deltaX * 0.045;
    };

    const handlePointerUp = () => {
      const state = carouselState.current;
      if (!state.isDragging) return;
      state.isDragging = false;

      // Snap to nearest piece index
      const snapped = Math.round(state.targetOffset);
      const clamped = Math.max(0, Math.min(PIECES.length - 1, snapped));
      state.targetOffset = clamped;

      if (clamped !== activePieceIndex) {
        setActivePieceIndex(clamped);
      }
    };

    const handleClick = (e) => {
      const state = carouselState.current;
      // If user dragged more than 8 pixels, treat as drag, not click
      if (state.dragDistance > 8) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check intersections with garments
      const interactiveMeshes = [];
      garments.forEach(g => {
        g.group.traverse(child => {
          if (child.isMesh) {
            interactiveMeshes.push(child);
          }
        });
      });

      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        // Find ancestor with pieceIndex
        let obj = intersects[0].object;
        while (obj && obj.userData.pieceIndex === undefined) {
          obj = obj.parent;
        }
        if (obj && obj.userData.pieceIndex !== undefined) {
          const clickedIndex = obj.userData.pieceIndex;
          if (clickedIndex === activePieceIndex) {
            if (onPieceClick) onPieceClick(clickedIndex);
          } else {
            setActivePieceIndex(clickedIndex);
          }
        }
      }
    };

    const handleWheel = (e) => {
      if (isExploring) return;
      e.preventDefault();
      const state = carouselState.current;
      const direction = Math.sign(e.deltaY || e.deltaX);
      if (Math.abs(e.deltaY) > 20 || Math.abs(e.deltaX) > 20) {
        const nextIndex = Math.max(0, Math.min(PIECES.length - 1, activePieceIndex + direction));
        if (nextIndex !== activePieceIndex) {
          setActivePieceIndex(nextIndex);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    dom.addEventListener('click', handleClick);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
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
      // Add realistic pendulum swing kick in direction of movement
      state.pendulumVelocity += -stepDiff * 1.8;
      gsap.to(state, {
        targetOffset: activePieceIndex,
        duration: 0.85,
        ease: 'power3.out'
      });
    }
  }, [activePieceIndex]);

  // --- 8. EXPLORE PIECE CAMERA PAN & FADE BACKGROUND PIECES ---
  useEffect(() => {
    const camera = cameraRef.current;
    const garments = garmentsRef.current;
    if (!camera || !garments) return;

    if (isExploring) {
      // Pan camera so active piece is framed on the left half of viewport
      gsap.to(camera.position, {
        x: 0.88,
        y: -0.15,
        z: 3.8,
        duration: 1.2,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.lookAt(0.88, -0.15, 0);
        }
      });

      // Fade out background items into the studio fog
      garments.forEach((g) => {
        if (g.index !== activePieceIndex) {
          gsap.to(g.shaderMat.uniforms.uOpacity, {
            value: 0.0,
            duration: 0.8,
            ease: 'power2.out'
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
      gsap.to(camera.position, {
        x: 0,
        y: 0.05,
        z: 5.2,
        duration: 1.2,
        ease: 'power3.inOut',
        onUpdate: () => {
          camera.lookAt(0, -0.05, 0);
        }
      });

      // Fade all garments back in
      garments.forEach((g) => {
        gsap.to(g.shaderMat.uniforms.uOpacity, {
          value: 1.0,
          duration: 0.9,
          ease: 'power2.out'
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

      // Animate vertical laser wave wipe from top to bottom
      gsap.to(shaderMat.uniforms.uWipeProgress, {
        value: 1.0,
        duration: 1.25,
        ease: 'power2.inOut',
        onComplete: () => {
          shaderMat.uniforms.uColorPrev.value.set(...newColor.rgb);
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
      // Show mannequin stand and crossfade hanger
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
      // Restore wooden hanger view
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

    // Transition lights
    if (lights.ambientLight) {
      lights.ambientLight.color.set(isDarkTheme ? 0x042416 : 0xEFE5D0);
      lights.ambientLight.intensity = isDarkTheme ? 1.3 : 1.9;
    }
    if (lights.keySpot) {
      lights.keySpot.intensity = isDarkTheme ? 4.5 : 3.9;
    }

    // Update shaders ambient term
    if (garments) {
      garments.forEach(g => {
        if (g.shaderMat) {
          g.shaderMat.uniforms.uAmbientColor.value.set(
            isDarkTheme ? 0.08 : 0.65,
            isDarkTheme ? 0.28 : 0.62,
            isDarkTheme ? 0.18 : 0.58
          );
        }
        if (g.shadowMesh) {
          g.shadowMesh.material.opacity = isDarkTheme ? 0.75 : 0.35;
        }
      });
    }
  }, [isDarkTheme]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
}


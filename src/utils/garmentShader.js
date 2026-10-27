import * as THREE from 'three';

export const GarmentVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const GarmentFragmentShader = `
  uniform vec3 uColorPrev;
  uniform vec3 uColorNext;
  uniform float uWipeProgress;
  uniform float uTime;
  uniform float uYMin;
  uniform float uYMax;
  uniform float uOpacity;
  uniform sampler2D uNormalMap;
  uniform vec3 uLightPos1;
  uniform vec3 uLightColor1;
  uniform vec3 uLightPos2;
  uniform vec3 uLightColor2;
  uniform vec3 uAmbientColor;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    // Vertical wipe height calculation
    float range = uYMax - uYMin;
    float threshold = uYMax - (uWipeProgress * range);
    
    // Subtle organic wave along the wipe threshold
    float wave = sin(vPosition.x * 6.0 + sin(vPosition.z * 5.0)) * 0.035;
    float currentY = vPosition.y + wave;
    
    // Transition blend
    float blend = smoothstep(threshold - 0.03, threshold + 0.03, currentY);
    // blend = 1.0 means above threshold (new color)
    vec3 baseColor = mix(uColorPrev, uColorNext, blend);

    // Glowing laser transition edge
    float distToEdge = abs(currentY - threshold);
    float edgeIntensity = smoothstep(0.045, 0.0, distToEdge) * step(0.001, uWipeProgress) * step(uWipeProgress, 0.999);
    vec3 laserGold = vec3(0.98, 0.85, 0.55); // Atelier signature laser gold

    // Lighting model
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);

    // Key spotlight 1
    vec3 lightDir1 = normalize(uLightPos1 - vWorldPosition);
    float diff1 = max(dot(normal, lightDir1), 0.0);
    // Soft wrap around lighting for fabric
    float wrapDiff1 = max((dot(normal, lightDir1) + 0.3) / 1.3, 0.0);

    // Rim / Edge light 2
    vec3 lightDir2 = normalize(uLightPos2 - vWorldPosition);
    float diff2 = max(dot(normal, lightDir2), 0.0);

    // Fresnel velvet/cloth sheen
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
    vec3 fresnelSheen = mix(baseColor * 1.5, vec3(0.9, 0.9, 0.95), 0.35) * fresnel * 0.45;

    // Specular highlight on cloth
    vec3 halfVector1 = normalize(lightDir1 + viewDir);
    float spec = pow(max(dot(normal, halfVector1), 0.0), 24.0) * 0.15;

    // Combine diffuse, ambient, and specular
    vec3 totalDiffuse = uAmbientColor + (wrapDiff1 * uLightColor1 * 0.85) + (diff2 * uLightColor2 * 0.45);
    vec3 finalColor = (baseColor * totalDiffuse) + fresnelSheen + spec;

    // Apply laser edge threshold glow
    finalColor = mix(finalColor, laserGold * 1.8, edgeIntensity * 0.95);

    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

/**
 * Creates custom ShaderMaterial instance for garment mesh
 */
export function createGarmentShaderMaterial(initialColorRgb, normalTexture, isDarkTheme = true) {
  const colorVec = new THREE.Vector3(...initialColorRgb);
  
  return new THREE.ShaderMaterial({
    vertexShader: GarmentVertexShader,
    fragmentShader: GarmentFragmentShader,
    transparent: true,
    uniforms: {
      uColorPrev: { value: colorVec.clone() },
      uColorNext: { value: colorVec.clone() },
      uWipeProgress: { value: 0.0 },
      uTime: { value: 0.0 },
      uYMin: { value: -2.0 },
      uYMax: { value: 0.05 },
      uOpacity: { value: 1.0 },
      uNormalMap: { value: normalTexture },
      uLightPos1: { value: new THREE.Vector3(0, 5, 4) },
      uLightColor1: { value: new THREE.Vector3(1.0, 0.98, 0.94) },
      uLightPos2: { value: new THREE.Vector3(-3, 3, -2) },
      uLightColor2: { value: new THREE.Vector3(0.85, 0.9, 1.0) },
      uAmbientColor: { value: isDarkTheme ? new THREE.Vector3(0.18, 0.18, 0.22) : new THREE.Vector3(0.55, 0.54, 0.52) }
    }
  });
}


# Adding Real 3D Dresses / Garment Models

This project supports loading real 3D garment models (`.glb` / `.gltf`) directly onto the curved rail and hangers.

---

## 1. Supported File Format

- **Format:** Binary glTF (`.glb`) is recommended because it bundles geometry, textures, and normal maps into a single file.
- **Recommended Size:** 1MB – 6MB for smooth WebGL streaming.
- **Orientation:** Ensure the garment faces positive Z (`+Z` forward) and `+Y` is up.

---

## 2. Where to Place Model Files

Place your `.glb` files directly in this folder:
```
public/
  models/
    piece-01.glb
    piece-02.glb
    piece-03.glb
    piece-04.glb
    piece-05.glb
```

---

## 3. How to Connect in Code

Open [`src/data/pieces.js`](file:///c:/Users/karth/Client_sites/src/data/pieces.js) and add the `modelPath` property to the desired piece:

```javascript
export const PIECES = [
  {
    id: 'piece-01',
    title: "L'Origine Double-Breasted Overcoat",
    modelPath: '/models/piece-01.glb', // <-- Add your file path here
    ...
  },
  ...
];
```

The system will automatically:
1. Fetch the `.glb` file using `GLTFLoader`.
2. Compute the bounding box and scale the garment to fit the hanger (`~1.35m`).
3. Anchor the collar directly beneath the wooden hanger hook (`y = -0.24`).
4. Apply the custom GLSL dye-wipe shader so the color swatches and vertical wave animation still work on the real model.
5. If the file is not yet added, it gracefully displays the procedural tailored mesh as a fallback.

---

## 4. Where to Find Free Real 3D Clothing Models

- **Sketchfab (sketchfab.com):** Search for `"coat"`, `"trench coat"`, `"blazer"`, or `"dress"`. Filter by **Downloadable** and **Free / CC**. Download as `glTF` / `glb`.
- **CLO 3D / Marvelous Designer:** If you create fashion garments in CLO 3D or Marvelous Designer, export via `File > Export > glTF (GLB)`.
- **Blender:** Export your garment via `File > Export > glTF 2.0 (.glb)`.

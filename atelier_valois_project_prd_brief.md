# Product Requirements Document (PRD)
## Atelier Valois — Interactive 3D Digital Atelier & Clothing Rail Showcase

**Document Status:** Approved / In Review  
**Version:** 1.0.0  
**Target Release:** Q1 2025 (Winter Capsule / Edition 04)  
**Platform:** Modern Web (Desktop-first, Responsive Touch & Pointer Support)

---

### 1. Executive Summary & Vision

**Atelier Valois** is a high-luxury, digital-first atelier delivering bespoke tailoring and winter capsule collections. The **3D Clothing Rail Showcase** is designed to transcend traditional flat 2D e-commerce grid layouts by recreating the visceral, tactile feeling of walking into a high-end private showroom. 

The core user experience centers on a sweeping, metallic chrome architectural clothing rail holding curated garments. Customers can fluidly traverse the rail, observe natural cloth physics and hanger pendulum dynamics, inspect fabric micro-textures via custom GPU shaders, and transition seamlessly into an editorial **Explore Piece** deep-dive.

---

### 2. Objectives & Key Metrics

#### Primary Business Objectives
- Elevate brand prestige and perceived value of high-ticket apparel ($1,800 – $4,500+).
- Increase interactive dwell time and user engagement across capsule launches.
- Lower return rates on outerwear by offering dual-state visualization ("On Hanger" vs. "On Model") and fabrication transparency.

#### Key Performance Indicators (KPIs)
- **Engagement Depth:** Average session duration on 3D gallery ≥ 2.5 minutes.
- **Interaction Rate:** > 65% of visitors interact with the 3D rail (drag/orbit or carousel arrows).
- **Shader Exploration:** > 40% of active visitors test real-time fabrication/color wipes.
- **Conversion to Bag:** > 12% progression from "Explore Piece" mode to checkout/inquiry.
- **Performance Benchmark:** Solid 60 FPS on modern desktop GPUs; WebGL initial asset load under 2.8s.

---

### 3. User Personas & Target Audience

| Persona | Motivation | Expectations | Key Needs |
| :--- | :--- | :--- | :--- |
| **The Luxury Connoisseur** | Seeks artisanal craftsmanship, rare fibers, and exclusivity. | Editorial aesthetic, zero visual clutter, fluid cinematic motion. | Clear fabrication provenance (e.g., Loro Piana double-faced cashmere), tactile drape. |
| **The Architectural Minimalist** | Values clean lines, spatial harmony, and modern tech integration. | Restrained UI, dark studio ambience, seamless micro-interactions. | Intuitive spatial controls, subtle audio-haptic cues, elegant typography. |
| **The VIP Client Advisor** | Uses the digital showroom for remote client appointments and lookbook previews. | Reliable responsive interaction, high-fidelity color accuracy. | Instant colorway shader wipes, rapid toggles between hanger silhouette and styled model fit. |

---

### 4. Functional Specifications & Architecture

#### 4.1. 3D Architectural Scene & Spatial Rail
- **Curved Rail Geometry:**
  - 3D cubic Bezier curve rail constructed via metallic chrome `TubeGeometry`.
  - Realistic studio lighting setup: overhead high-intensity key spotlights, ambient fill, and sharp grazing edge lights reflecting off the chrome specular highlights.
  - Dual precision-milled architectural ceiling brackets.
- **Curved Arc Carousel:**
  - Accommodates 5 curated garments suspended from sculpted dark walnut hangers with brass/chrome hardware.
  - Garments follow an equidistant circular or spline arc path.
  - Center active item faces front-center camera orientation (`rotation.y = 0`).
  - Lateral flanking items dynamically orient inward at a fixed angle (~65 degrees) with subtle depth-of-field dropoff.
- **Physics & Motion Dynamics:**
  - GSAP / Lerp-smoothed transitions triggered via left/right arrows, pagination bullets, or horizontal mouse/touch drag.
  - Velocity-responsive **pendulum swing inertia** (`rotation.z` dampening) simulating real hanger physics when the rail halts or accelerates.

#### 4.2. Custom GLSL Shader Color & Texture Transition
- **Shader Material:**
  - Center garment mesh utilizes custom Vertex & Fragment shaders with `uProgress` (0.0 to 1.0) uniform control.
  - Implements a top-to-bottom vertical gradient wave wipe when switching colorways (e.g., *Charcoal (#222222)* to *Wine (#58111A)*).
  - Glowing, delicate threshold line at the transition boundary to evoke laser-precision craftsmanship.
- **UI Synchronization:**
  - Instantaneous feedback between HUD color swatches and WebGL uniform interpolation.

#### 4.3. "Explore Piece" Editorial Deep Dive Mode
- **Cinematic Camera Choreography:**
  - Smooth camera pan and orbit shifting the active piece to the left viewport.
  - Inactive rack garments softly dim and recede into background studio fog.
- **Product Detail Interface (HUD / Slide-over):**
  - Appears on the right viewport with high-contrast luxury editorial typography.
  - **Garment Metadata:** Title, capsule edition, price, detailed fabric specification (e.g., 900g double-faced Mongolian cashmere, horn buttons).
  - **View State Toggle:** Instantaneous transition between *"ON HANGER"* (structured architectural drape) and *"ON MODEL"* (articulated dynamic silhouette).
  - **Direct Actions:** Size selector (46–54), "Add to Bag", and "Book Private Atelier Fitting".

---

### 5. Technical Stack & Implementation

- **Frontend Core:** React / Next.js or Vite (TypeScript).
- **Styling & Layout:** Tailwind CSS for minimalist HUD overlay and responsive glassmorphic cards.
- **3D Graphics & WebGL:** Three.js / `@react-three/fiber` and `@react-three/drei`.
- **Animation Orchestration:** GSAP (GreenSock) for timeline transitions, camera paths, and UI micro-interactions.
- **Asset Pipeline:** Compressed `.glb` / `.gltf` meshes with Draco compression and KTX2 / Basis Universal textures.
- **Typography:** Serif editorial headers (Playfair Display / Canela style) paired with refined geometric monospace labels (JetBrains Mono / Space Grotesk).

---

### 6. Non-Functional Requirements & Performance

- **Frame Rate:** Sustained 60 FPS during camera panning, dragging, and shader transitions.
- **Asset Footprint:** Initial 3D bundle < 4MB; asynchronous background texture streaming.
- **Accessibility & Fallbacks:**
  - Full keyboard accessibility for navigation arrows and interactive drawers.
  - ARIA live announcements for active piece selection and color changes.
  - Graceful degradation for low-spec devices (reduced shadow maps and simplified static material shading).
- **Browser Compatibility:** Latest versions of Chrome, Safari, Firefox, and Edge with WebGL 2.0 support.

---

### 7. Roadmap & Future Enhancements

- **Phase 2 (Spring 2025):** Spatial Audio integration with subtle cloth rustling and metallic hanger clinking sounds.
- **Phase 3 (Summer 2025):** Real-time fabric draping simulation using WebGPU compute shaders.
- **Phase 4 (Autumn 2025):** WebXR / Apple Vision Pro spatial showroom experience.

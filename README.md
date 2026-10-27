# Atelier Valois — 3D Curved Rail Showcase

An interactive, luxury 3D digital atelier and clothing rail showcase built with **Three.js**, **React**, **GSAP**, and **Tailwind CSS**.

Inspired by high-end private showrooms, the application features an architectural metallic chrome clothing rail holding a curated 5-piece winter capsule collection. Visitors can traverse the rail with pendulum momentum, inspect tailored silhouettes, explore custom GLSL vertical color-wipe shaders, and toggle between hanging drapes and styled editorial mannequin views.

---

## Key Features

- **Architectural Curved Chrome Rail:** 3D curved metallic chrome rail (`THREE.TubeGeometry` along a `CatmullRomCurve3`) suspended by vertical ceiling rods and mounting flanges.
- **Studio Lighting & Reflections:** Dramatic overhead key spotlight, dual rear specular rim lights, atmospheric depth fog, and soft floor contact shadows.
- **5 Curated Luxury Garments:**
  1. *L'Origine Double-Breasted Overcoat* (920g Mongolian Cashmere)
  2. *Le Ciel Structured Wool Blazer* (Super 160s Merino)
  3. *Le Manteau D'Hiver Trench Coat* (Double-Faced Loro Piana Wool)
  4. *Le Paletot Minimalist Car Coat* (Brushed Alpaca Blend)
  5. *Le Blouson Architectural Bomber* (Waxed Silk & Lambswool)
- **Fluid Carousel Dynamics:** Supports horizontal pointer drag with inertia, scroll wheel, and arrow navigation. Active center piece faces front at 100% scale while lateral pieces angle along the curve (~65°) with realistic pendulum momentum (`rotation.z`).
- **"Explore Piece" Camera Pan:** Cinematic camera shift framing the selected garment in high detail on the left half of the viewport while fading other pieces into the fog.
- **Slide-in Product Detail Card:** Luxury editorial slide-over with piece index, description, pill-shaped size selector (XS–XL), interactive color swatches, "Add to Bag" counter, and expandable craft/provenance accordions.
- **Custom GLSL Color-Wipe Shader:** Real-time top-to-bottom laser wave dye wipe animating between colorways with a luminous gold threshold highlight.
- **Perspective Toggle:** Seamless transition between "ON HANGER" (wooden coat hanger drape) and "ON MODEL" (editorial mannequin stand).
- **Light / Dark Theme Support:** Instant toggle between midnight studio ambience (**Atelier Valois**) and warm daylight (**Nordrail** `#F6F5F0`).

---

## Tech Stack

- **Framework:** React 18, Vite
- **3D Graphics & Shaders:** Three.js, Custom GLSL (Vertex & Fragment)
- **Animation Orchestration:** GSAP (GreenSock)
- **Styling:** Tailwind CSS, PostCSS
- **Icons:** Lucide React

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
git clone <your-repo-url>
cd atelier-valois-3d-rail
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## License

MIT


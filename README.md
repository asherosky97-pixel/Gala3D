# Gala3D — Professional 3D Event Design & Floor Planner

**Gala3D** is a powerful, CAD-lite 3D event layout, venue floor planning, and client proposal application inspired by **E3D Planner** ([e3dplanner.com](https://www.e3dplanner.com/)). It is engineered to run **both offline and online** on your laptop, desktop, tablet, and mobile phone.

---

## 🌟 Highlights & Core Capabilities

* **Dual-View & Walkthrough Cameras:**
  * **3D Orbit View:** Smooth orbital perspective navigation with zoom, pan, and real-time shadows.
  * **2D CAD Blueprint:** Top-down orthographic blueprint projection with meter gridlines and dimension markers.
  * **1st-Person Walkthrough:** Experience the venue at guest eye level ($1.7\text{m}$) using `W`, `A`, `S`, `D` or Arrow keys.
* **100% Offline-First Architecture:**
  * Powered by a **Service Worker** (`sw.js`) and persistent **IndexedDB / LocalStorage** storage engine.
  * No internet connection or cloud login required. Projects auto-save locally every few seconds.
  * Built-in **Procedural 3D Asset Factory** that generates scale-accurate furniture and decor on the fly without downloading external 3D files.
* **Parametric Venue Builder:**
  * Customize room width, length, and ceiling height in meters or feet.
  * 5 Distinct Styles: *Grand Ballroom*, *Rustic Barn*, *Marquee Tent*, *Outdoor Garden Lawn*, and *Industrial Loft*.
  * 6 Floor Finishes: *White Carrara Marble*, *Black Marquina Marble*, *Oak Parquet Hardwood*, *Royal Crimson Carpet*, *Lush Garden Grass*, and *Polished Concrete*.
* **Extensive 25+ Event Asset Catalog:**
  * **Tables:** 60" Round (8 seats), 72" Round (10 seats), 8ft Rectangular Trestle (8 seats), 6ft Dining (6 seats), Highboy Cocktail Tables, VIP Sweetheart Tables, Square Bistro Tables.
  * **Chairs:** Gold Chiavari, Silver Chiavari, White Resin Folding, Royal Banquet Padded, Modern Velvet Dining, Luxury Lounge Sofas, Cocktail Bar Stools.
  * **Stages & Dance Floors:** Modular Elevated Stages with velvet skirting, Checkered Dance Floors, Wood Parquet Floors, LED Starlight Floors, Presentation Lecterns.
  * **Tents & Architecture:** High-Peak Marquee Tents, Floral Wedding Arbors, Boxwood Backdrop Photo Walls, Red Carpet Runner with Gold Stanchions.
  * **Decor & Lighting:** Fluted Crystal Centerpieces, 5-arm Candelabras, Multi-color Perimeter Uplights (with dynamic light beams), Crystal Chandeliers, DJ Booth, Line-Array Speaker Towers, Video Walls.
  * **Catering:** 3-Tier Wedding Cake Displays, Chafing Dish Buffet Stations, LED Illuminated Bars.
* **CAD Precision Tools:**
  * Drag-and-drop placement directly from the catalog drawer onto the 3D floor.
  * 3D Gizmo controls (Translate, Rotate, Scale) with magnetic grid snapping ($0.5\text{m}$ / $1\text{m}$).
  * Instant **Table Grid Array Generator** (create an $M \times N$ matrix of tables with custom spacing in seconds).
* **Seating Chart & Guest Management:**
  * Assign guest names, dietary options (*Standard, Vegetarian, Vegan, Halal, Kosher, Gluten-Free*), and VIP stars.
  * Live seating occupancy tracker for every table and total room capacity.
* **Bill of Materials (BOM) & Rental Budget:**
  * Automated itemized inventory counting placed items in real time.
  * Configurable rental rates, sales tax %, discount %, and currency selection (USD, EUR, GBP, KES, AED, CAD, AUD).
  * One-click CSV export and printable client proposals.
* **Presentation & Export Suite:**
  * **4K Snapshot Render:** Capture crystal-clear PNG snapshots up to Ultra HD ($3840 \times 2160$).
  * **2D CAD Blueprint Export:** Clean architectural top-down drawing with border, title block, and north arrow.
  * **3D Scene Export (`.glb`):** Export to standard glTF binary for viewing in Blender or mobile Augmented Reality.
  * **Portable Project Format (`.gala3d`):** Save and load complete event projects as JSON bundles to backup or transfer between devices.

---

## 🚀 How to Run Gala3D

### Option 1: Native Desktop App (Recommended for Laptop)
Double-click:
```text
Launch_Gala3D_App.bat
```
*(Or run `npm run desktop` from the terminal).*
This opens Gala3D inside a standalone desktop application window.

### Option 2: Browser & Multi-Device Local Network
Double-click:
```text
Launch_Gala3D_Browser.bat
```
*(Or run `npm run preview` from the terminal).*
* Opens Gala3D in your default web browser at `http://localhost:3000`.
* **To use on other devices (iPad, tablet, phone, second laptop):** Connect them to the same local Wi-Fi / hotspot and open `http://<your-laptop-ip>:3000` in their browser.

### Option 3: Offline PWA Installation
1. Open Gala3D in Chrome, Edge, or Safari.
2. Click the **Install** icon in the address bar (or "Add to Home Screen" on iOS/Android).
3. Gala3D is now installed directly onto your device and can be launched from your desktop or home screen with zero internet connection!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Delete` / `Backspace` | Delete currently selected item |
| `Ctrl + D` / `Cmd + D` | Duplicate currently selected item |
| `Ctrl + Z` / `Cmd + Z` | Undo last action |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo action |
| `Escape` | Deselect active item / Close open modal |
| `W`, `A`, `S`, `D` / `Arrows` | Walk through venue (in Walkthrough mode) |

---

## 📁 Project Structure

```text
d:\Rb3D\
├── index.html                  # Main application HTML shell
├── manifest.json               # Web App Manifest for PWA installation
├── sw.js                       # Service Worker for offline caching
├── package.json                # Project dependencies & scripts
├── vite.config.js              # Bundler configuration
├── Launch_Gala3D_App.bat       # Windows desktop launcher
├── Launch_Gala3D_Browser.bat   # Local browser & multi-device server launcher
├── dist/                       # Self-contained production build (100% offline)
├── public/                     # Static PWA assets (sw.js, manifest.json)
└── src/
    ├── main.js                 # Application bootstrap & 3D event binding
    ├── styles/
    │   └── app.css             # Glassmorphic UI & responsive styling
    ├── core/
    │   ├── Engine.js           # Three.js dual camera, renderer, render loop
    │   ├── Raycaster.js        # Ground plane raycasting & drag-and-drop
    │   ├── Venue.js            # Parametric room builder (walls, floors, themes)
    │   ├── Lighting.js         # Atmosphere presets (Day, Sunset, Gala, Party)
    │   └── Walkthrough.js      # First-person guest eye walkthrough navigation
    ├── assets/
    │   ├── AssetFactory.js     # Procedural 3D model generators (25+ items)
    │   ├── Catalog.js          # Catalog metadata, dimensions, pricing
    │   └── TextureGenerator.js # Procedural canvas textures (wood, marble, carpet)
    ├── state/
    │   ├── Store.js            # Central reactive store & auto-save engine
    │   ├── History.js          # Undo/Redo stack
    │   └── Storage.js          # IndexedDB & LocalStorage engine
    ├── ui/
    │   ├── Icons.js            # Crisp vector SVG icon library
    │   ├── Toolbar.js          # Top action bar & view switcher
    │   ├── CatalogDrawer.js    # Left draggable catalog drawer
    │   ├── Inspector.js        # Right context-sensitive item & venue inspector
    │   ├── VenueModal.js       # Room dimensions & themes modal
    │   ├── SeatingModal.js     # Seating chart & guest management modal
    │   ├── BudgetModal.js      # Bill of Materials & rental quote modal
    │   ├── SnapshotModal.js    # 4K snapshot render preview & download modal
    │   └── ProjectModal.js     # Saved project manager modal
    └── utils/
        ├── Exporters.js        # .gala3d, .glb, CAD PNG, and CSV exporters
        └── MathUtils.js        # Grid snapping, conversions, helpers
```


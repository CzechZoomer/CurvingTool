# CurveLayer — Curved Text Generator

CurveLayer is a high-performance, browser-based curved text generation tool designed for professional creative workflows. It allows you to place text along various custom paths, apply rich styling, and export the result as high-quality transparent PNGs or SVGs.

## 🚀 How to Run the Website

You need [Node.js](https://nodejs.org/) installed on your computer.

1. Open your terminal or command prompt.
2. Navigate into the project folder so your terminal is running locally in the folder, not in your global user directory:
   ```bash
   cd path/to/curving
   ```
3. If you haven't already, install the dependencies by running:
   ```bash
   npm install
   ```
4. Start the local development server by running:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173/` (or whichever URL the terminal provides).

---

## 🛠️ List of All Functions & Features

### 1. Canvas & Workspace
- **Drag & Drop Backgrounds:** Drag an image onto the canvas to use it as a reference guide.
- **Pan & Zoom:** Use the mouse wheel to zoom in/out (`+`/`-` keys also work). Hold `Alt` and click-drag to pan around the canvas.
- **Grid & Guides:** Toggle the background grid or center alignment guides from the top toolbar.
- **Multi-layer Support:** Add multiple independent text layers. Select, lock, hide, reorder, or delete layers using the bottom-left Layers Panel.
- **Autosave:** The app automatically saves your progress to your browser's local storage.

### 2. Text & Typography
- **Real-time Editing:** Type into the Text box and see it instantly update on the curve.
- **Font Selection:** Choose from over 80 curated Google Fonts.
- **Typography Controls:** Adjust Font Size, Bold/Italic toggles, Letter Spacing, and Rotation.

### 3. Styling & Effects
- **Text Color & Opacity:** Full hex color picker with opacity sliders.
- **Text Outline:** Add a stroke to your text and adjust its thickness.
- **Drop Shadow:** Add a shadow and control its blur and offset distance.
- **Glow Effect:** Add a neon-style outer glow to the text.

### 4. Curve Controls (The Core Feature)
Select from 7 different path types to warp your text:
- **Arc Up / Arc Down:** Standard curving arches with adjustable curve strength.
- **Circle:** Wraps text around a perfect circle. You can adjust the radius and toggle whether the text sits on the *Inside* or *Outside* of the circle.
- **Wave:** A sine-wave path with adjustable strength.
- **Spiral:** Wraps text inward along a spiral shape.
- **Bezier Path:** Creates 4 interactive blue handles on the canvas. Click and drag the handles to warp the text into any custom swoosh or shape you want!
- **Flip Path:** Reverses the direction the text reads along the curve.

### 5. Exporting & Saving
- **Export Text Only (PNG):** Exports *only* your curved text on a perfectly transparent background. Uses the native Windows "Save As" dialog for reliability.
- **Export Composite (PNG):** Exports the text along with your uploaded background image.
- **Export SVG:** Exports the raw vector math so you can import it into Adobe Illustrator or Figma.
- **Resolution Control:** Export at 1x, 2x, or 4x high-resolution scales.
- **Padding:** Add extra transparent space around the exported image so text doesn't touch the edges.
- **Save/Load Project:** Download a `.json` file of your workspace to back it up or share it, and load it later to continue editing.

### 6. Keyboard Shortcuts
- `Ctrl + Z`: Undo
- `Ctrl + Shift + Z`: Redo
- `Delete` or `Backspace`: Delete the currently selected layer
- `Ctrl + D`: Duplicate the currently selected layer
- `+` / `-`: Zoom in and out
- `Alt + Drag`: Pan the canvas

import { create } from 'zustand';
import { temporal } from 'zundo';
import { v4 as uuidv4 } from 'uuid';

const AUTOSAVE_KEY = 'curvelayer-autosave';
const AUTOSAVE_DELAY = 500;

function createDefaultLayer(name = 'Text Layer', index = 1) {
  return {
    id: uuidv4(),
    type: 'text',
    visible: true,
    locked: false,
    name: `${name} ${index}`,
    // Text
    text: 'Curved Text',
    fontFamily: 'Inter',
    fontSize: 48,
    fontWeight: 400,
    fontStyle: 'normal',
    letterSpacing: 0,
    lineHeight: 1.2,
    // Styling
    fillColor: '#ffffff',
    outlineEnabled: false,
    outlineColor: '#000000',
    outlineWidth: 2,
    shadowEnabled: false,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    opacity: 1,
    glowEnabled: false,
    glowColor: '#6366f1',
    glowBlur: 10,
    // Curve
    curveType: 'arc-up',
    curveStrength: 50,
    curveRadius: 200,
    rotation: 0,
    flipPath: false,
    insideCircle: false,
    controlPoints: [],
    // Position
    position: { x: 600, y: 400 },
  };
}

function loadSavedState() {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate structure
      if (parsed.layers && Array.isArray(parsed.layers)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load autosave:', e);
  }
  return null;
}

const savedState = loadSavedState();

const initialState = {
  // Canvas
  canvasWidth: 1200,
  canvasHeight: 800,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  showGrid: true,
  showGuides: true,

  // Background
  backgroundImage: null,
  backgroundOpacity: 0.5,
  backgroundTransform: { x: 0, y: 0, scale: 1, rotation: 0 },

  // Layers
  layers: [createDefaultLayer('Text Layer', 1)],
  activeLayerId: null, // will be set after creation

  // UI state (not tracked by undo)
  isDragging: false,
  isExporting: false,
  exportProgress: '',
};

// Apply saved state if available
if (savedState) {
  Object.assign(initialState, {
    canvasWidth: savedState.canvasWidth ?? initialState.canvasWidth,
    canvasHeight: savedState.canvasHeight ?? initialState.canvasHeight,
    showGrid: savedState.showGrid ?? initialState.showGrid,
    showGuides: savedState.showGuides ?? initialState.showGuides,
    backgroundImage: savedState.backgroundImage ?? null,
    backgroundOpacity: savedState.backgroundOpacity ?? 0.5,
    backgroundTransform: savedState.backgroundTransform ?? initialState.backgroundTransform,
    layers: savedState.layers ?? initialState.layers,
  });
}

// Set activeLayerId
initialState.activeLayerId = initialState.layers[0]?.id ?? null;

const useProjectStore = create(
  temporal(
    (set, get) => ({
      ...initialState,

      // ===== CANVAS =====
      setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
      zoomIn: () => set((s) => ({ zoom: Math.min(5, s.zoom * 1.15) })),
      zoomOut: () => set((s) => ({ zoom: Math.max(0.1, s.zoom / 1.15) })),
      resetZoom: () => set({ zoom: 1, panOffset: { x: 0, y: 0 } }),
      setPan: (panOffset) => set({ panOffset }),
      toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
      toggleGuides: () => set((s) => ({ showGuides: !s.showGuides })),
      setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),

      // ===== BACKGROUND =====
      setBackgroundImage: (dataUrl) => set({ backgroundImage: dataUrl }),
      removeBackgroundImage: () => set({ backgroundImage: null }),
      setBackgroundOpacity: (opacity) => set({ backgroundOpacity: opacity }),
      setBackgroundTransform: (transform) => set((s) => ({
        backgroundTransform: { ...s.backgroundTransform, ...transform },
      })),

      // ===== LAYERS =====
      addLayer: () => {
        const { layers } = get();
        const newLayer = createDefaultLayer('Text Layer', layers.length + 1);
        set({
          layers: [...layers, newLayer],
          activeLayerId: newLayer.id,
        });
      },

      removeLayer: (id) => {
        const { layers, activeLayerId } = get();
        if (layers.length <= 1) return; // Keep at least one layer
        const filtered = layers.filter((l) => l.id !== id);
        const newActiveId = id === activeLayerId
          ? filtered[filtered.length - 1]?.id
          : activeLayerId;
        set({ layers: filtered, activeLayerId: newActiveId });
      },

      duplicateLayer: (id) => {
        const { layers } = get();
        const source = layers.find((l) => l.id === id);
        if (!source) return;
        const newLayer = {
          ...source,
          id: uuidv4(),
          name: `${source.name} Copy`,
          position: { x: source.position.x + 20, y: source.position.y + 20 },
        };
        const idx = layers.findIndex((l) => l.id === id);
        const newLayers = [...layers];
        newLayers.splice(idx + 1, 0, newLayer);
        set({ layers: newLayers, activeLayerId: newLayer.id });
      },

      updateLayer: (id, updates) => {
        set((s) => ({
          layers: s.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }));
      },

      setActiveLayer: (id) => set({ activeLayerId: id }),

      moveLayerUp: (id) => {
        const { layers } = get();
        const idx = layers.findIndex((l) => l.id === id);
        if (idx <= 0) return;
        const newLayers = [...layers];
        [newLayers[idx - 1], newLayers[idx]] = [newLayers[idx], newLayers[idx - 1]];
        set({ layers: newLayers });
      },

      moveLayerDown: (id) => {
        const { layers } = get();
        const idx = layers.findIndex((l) => l.id === id);
        if (idx === -1 || idx >= layers.length - 1) return;
        const newLayers = [...layers];
        [newLayers[idx], newLayers[idx + 1]] = [newLayers[idx + 1], newLayers[idx]];
        set({ layers: newLayers });
      },

      toggleLayerVisibility: (id) => {
        set((s) => ({
          layers: s.layers.map((l) =>
            l.id === id ? { ...l, visible: !l.visible } : l
          ),
        }));
      },

      toggleLayerLock: (id) => {
        set((s) => ({
          layers: s.layers.map((l) =>
            l.id === id ? { ...l, locked: !l.locked } : l
          ),
        }));
      },

      // ===== UI STATE =====
      setDragging: (isDragging) => set({ isDragging }),
      setExporting: (isExporting, progress = '') => set({ isExporting, exportProgress: progress }),

      // ===== PROJECT =====
      loadProject: (data) => {
        if (data.layers && Array.isArray(data.layers)) {
          set({
            canvasWidth: data.canvasWidth ?? 1200,
            canvasHeight: data.canvasHeight ?? 800,
            backgroundImage: data.backgroundImage ?? null,
            backgroundOpacity: data.backgroundOpacity ?? 0.5,
            backgroundTransform: data.backgroundTransform ?? { x: 0, y: 0, scale: 1, rotation: 0 },
            layers: data.layers,
            activeLayerId: data.layers[0]?.id ?? null,
            zoom: 1,
            panOffset: { x: 0, y: 0 },
          });
        }
      },

      getExportState: () => {
        const s = get();
        return {
          canvasWidth: s.canvasWidth,
          canvasHeight: s.canvasHeight,
          backgroundImage: s.backgroundImage,
          backgroundOpacity: s.backgroundOpacity,
          backgroundTransform: s.backgroundTransform,
          layers: s.layers,
        };
      },

      // Helper to get active layer
      getActiveLayer: () => {
        const { layers, activeLayerId } = get();
        return layers.find((l) => l.id === activeLayerId) ?? null;
      },
    }),
    {
      // zundo config: exclude transient UI state from undo history
      partialize: (state) => {
        const { isDragging, isExporting, exportProgress, zoom, panOffset, ...tracked } = state;
        return tracked;
      },
      limit: 50, // max undo steps
    }
  )
);

// ===== AUTOSAVE =====
let autosaveTimer = null;
useProjectStore.subscribe((state) => {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    try {
      const data = {
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        showGrid: state.showGrid,
        showGuides: state.showGuides,
        backgroundImage: state.backgroundImage,
        backgroundOpacity: state.backgroundOpacity,
        backgroundTransform: state.backgroundTransform,
        layers: state.layers,
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Autosave failed:', e);
    }
  }, AUTOSAVE_DELAY);
});

export default useProjectStore;
export { createDefaultLayer };

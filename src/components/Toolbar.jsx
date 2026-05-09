import React from 'react';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  Grid3x3, Crosshair, Upload,
} from 'lucide-react';
import useProjectStore from '../store/useProjectStore';

export default function Toolbar() {
  const {
    zoom, showGrid, showGuides,
    zoomIn, zoomOut, resetZoom, toggleGrid, toggleGuides,
    setBackgroundImage,
  } = useProjectStore();

  const { undo, redo, pastStates, futureStates } = useProjectStore.temporal.getState();

  const handleUploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setBackgroundImage(ev.target.result);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-12 bg-bg-secondary border-b border-border flex items-center px-4 gap-1 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M4 20 Q 12 4, 20 20" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight">
          <span className="text-accent">Curve</span>
          <span className="text-text-primary">Layer</span>
        </span>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      {/* Undo / Redo */}
      <button
        className="btn btn-icon btn-sm"
        onClick={() => undo()}
        disabled={pastStates.length === 0}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={15} />
      </button>
      <button
        className="btn btn-icon btn-sm"
        onClick={() => redo()}
        disabled={futureStates.length === 0}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 size={15} />
      </button>

      <div className="w-px h-6 bg-border mx-2" />

      {/* Zoom controls */}
      <button className="btn btn-icon btn-sm" onClick={zoomOut} title="Zoom Out">
        <ZoomOut size={15} />
      </button>
      <span className="text-xs font-mono text-text-secondary w-12 text-center tabular-nums select-none">
        {Math.round(zoom * 100)}%
      </span>
      <button className="btn btn-icon btn-sm" onClick={zoomIn} title="Zoom In">
        <ZoomIn size={15} />
      </button>
      <button className="btn btn-icon btn-sm" onClick={resetZoom} title="Fit to Canvas">
        <Maximize2 size={15} />
      </button>

      <div className="w-px h-6 bg-border mx-2" />

      {/* Grid / Guides */}
      <button
        className={`btn btn-icon btn-sm ${showGrid ? 'btn-primary' : ''}`}
        onClick={toggleGrid}
        title="Toggle Grid"
      >
        <Grid3x3 size={15} />
      </button>
      <button
        className={`btn btn-icon btn-sm ${showGuides ? 'btn-primary' : ''}`}
        onClick={toggleGuides}
        title="Toggle Center Guides"
      >
        <Crosshair size={15} />
      </button>

      <div className="w-px h-6 bg-border mx-2" />

      {/* Upload background */}
      <button
        className="btn btn-sm"
        onClick={handleUploadImage}
        title="Upload Reference Image"
      >
        <Upload size={14} />
        <span>Upload Image</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Canvas info */}
      <span className="text-[11px] font-mono text-text-muted">
        1200 × 800
      </span>
    </div>
  );
}

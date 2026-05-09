import React, { useRef, useState, useCallback, useEffect } from 'react';
import useProjectStore from '../store/useProjectStore';
import TextLayer from './TextLayer';
import InteractionHandles from './InteractionHandles';

/**
 * Main SVG canvas workspace with zoom, pan, background, grid, guides, and text layers.
 */
export default function Canvas() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState(null); // { layerId, startPos, startMouse }

  const {
    canvasWidth, canvasHeight, zoom, panOffset, showGrid, showGuides,
    backgroundImage, backgroundOpacity, backgroundTransform,
    layers, activeLayerId,
    setZoom, setPan, setActiveLayer, updateLayer, setDragging,
    setBackgroundImage, removeBackgroundImage,
  } = useProjectStore();

  // ===== ZOOM =====
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
    setZoom(newZoom);
  }, [zoom, setZoom]);

  // ===== PAN =====
  const handlePanStart = useCallback((e) => {
    // Middle mouse button or space+click
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  const handlePanMove = useCallback((e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Handle layer dragging
    if (dragState) {
      const dx = (e.clientX - dragState.startMouse.x) / zoom;
      const dy = (e.clientY - dragState.startMouse.y) / zoom;
      updateLayer(dragState.layerId, {
        position: {
          x: dragState.startPos.x + dx,
          y: dragState.startPos.y + dy,
        },
      });
    }
  }, [isPanning, panStart, dragState, zoom, setPan, updateLayer]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
    if (dragState) {
      setDragState(null);
      setDragging(false);
    }
  }, [dragState, setDragging]);

  // ===== LAYER DRAG =====
  const handleLayerMouseDown = useCallback((e, layer) => {
    if (layer.locked) return;
    e.stopPropagation();
    setActiveLayer(layer.id);
    setDragging(true);
    setDragState({
      layerId: layer.id,
      startPos: { ...layer.position },
      startMouse: { x: e.clientX, y: e.clientY },
    });
  }, [setActiveLayer, setDragging]);

  // ===== CANVAS CLICK (deselect) =====
  const handleCanvasClick = useCallback((e) => {
    if (e.target === svgRef.current || e.target.dataset?.grid || e.target.dataset?.guides || e.target.dataset?.background) {
      // Don't deselect if we were panning
    }
  }, []);

  // ===== BACKGROUND IMAGE UPLOAD =====
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setBackgroundImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  }, [setBackgroundImage]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Global mouse events for drag
  useEffect(() => {
    if (isPanning || dragState) {
      window.addEventListener('mousemove', handlePanMove);
      window.addEventListener('mouseup', handlePanEnd);
      return () => {
        window.removeEventListener('mousemove', handlePanMove);
        window.removeEventListener('mouseup', handlePanEnd);
      };
    }
  }, [isPanning, dragState, handlePanMove, handlePanEnd]);

  // Grid pattern
  const gridSize = 40;

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-hidden relative canvas-workspace ${!showGrid ? 'no-grid' : ''}`}
      onWheel={handleWheel}
      onMouseDown={handlePanStart}
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ cursor: isPanning ? 'grabbing' : dragState ? 'move' : 'grab' }}
    >
      {/* Drop zone hint (when no bg image) */}
      {!backgroundImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center text-text-muted">
            <p className="text-sm mb-1">Drop a reference image here</p>
            <p className="text-xs">or use the sidebar to get started</p>
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        id="main-canvas"
        width="100%"
        height="100%"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="grid-pattern" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <line x1={gridSize} y1="0" x2={gridSize} y2={gridSize} stroke="rgba(42,42,64,0.5)" strokeWidth="0.5" />
            <line x1="0" y1={gridSize} x2={gridSize} y2={gridSize} stroke="rgba(42,42,64,0.5)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Canvas background (checkerboard for transparency) */}
        <rect
          width={canvasWidth}
          height={canvasHeight}
          fill="#141420"
          rx="0"
        />

        {/* Grid */}
        {showGrid && (
          <rect
            data-grid="true"
            width={canvasWidth}
            height={canvasHeight}
            fill="url(#grid-pattern)"
          />
        )}

        {/* Center guides */}
        {showGuides && (
          <g data-guides="true">
            <line
              x1={canvasWidth / 2} y1="0"
              x2={canvasWidth / 2} y2={canvasHeight}
              stroke="rgba(99,102,241,0.2)"
              strokeWidth="1"
              strokeDasharray="8 4"
            />
            <line
              x1="0" y1={canvasHeight / 2}
              x2={canvasWidth} y2={canvasHeight / 2}
              stroke="rgba(99,102,241,0.2)"
              strokeWidth="1"
              strokeDasharray="8 4"
            />
          </g>
        )}

        {/* Background image */}
        {backgroundImage && (
          <image
            data-background="true"
            href={backgroundImage}
            x={backgroundTransform.x}
            y={backgroundTransform.y}
            width={canvasWidth}
            height={canvasHeight}
            preserveAspectRatio="xMidYMid meet"
            opacity={backgroundOpacity}
            style={{
              transform: `scale(${backgroundTransform.scale}) rotate(${backgroundTransform.rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        )}

        {/* Text layers */}
        {layers.map((layer) => (
          <React.Fragment key={layer.id}>
            <g
              onMouseDown={(e) => handleLayerMouseDown(e, layer)}
              style={{ pointerEvents: layer.locked ? 'none' : 'all' }}
            >
              <TextLayer
                layer={layer}
                isActive={layer.id === activeLayerId}
              />
            </g>
            {layer.id === activeLayerId && !layer.locked && (
              <InteractionHandles layer={layer} />
            )}
          </React.Fragment>
        ))}

        {/* Canvas border */}
        <rect
          width={canvasWidth}
          height={canvasHeight}
          fill="none"
          stroke="rgba(42,42,64,0.8)"
          strokeWidth="2"
        />
      </svg>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-bg-secondary/80 backdrop-blur border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-text-secondary">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}

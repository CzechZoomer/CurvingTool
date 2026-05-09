import React, { useState, useEffect, useCallback } from 'react';
import useProjectStore from '../store/useProjectStore';
import { getDefaultBezierPoints } from '../utils/pathGenerators';

export default function InteractionHandles({ layer }) {
  const { updateLayer, zoom, setDragging } = useProjectStore();
  const [activeHandleIndex, setActiveHandleIndex] = useState(null);
  const [dragStartMouse, setDragStartMouse] = useState(null);
  const [dragStartPoints, setDragStartPoints] = useState(null);

  // Initialize or use existing control points
  const estimatedWidth = Math.max(layer.text.length * layer.fontSize * 0.55, 200);
  const points = layer.controlPoints && layer.controlPoints.length >= 2 
    ? layer.controlPoints 
    : getDefaultBezierPoints(estimatedWidth, layer.curveStrength);

  const handleMouseDown = (e, index) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveHandleIndex(index);
    setDragStartMouse({ x: e.clientX, y: e.clientY });
    setDragStartPoints([...points]);
    setDragging(true); // Disable global pan/drag
  };

  const handleMouseMove = useCallback((e) => {
    if (activeHandleIndex === null) return;
    
    // Calculate distance moved, divided by zoom so it scales correctly
    const dx = (e.clientX - dragStartMouse.x) / zoom;
    const dy = (e.clientY - dragStartMouse.y) / zoom;
    
    // Update the specific point
    const newPoints = [...dragStartPoints];
    
    // If we rotate the layer, dragging is more complex because X/Y are local to the layer's rotation.
    // For simplicity, we calculate the inverse rotation for the delta.
    const angleRad = (layer.rotation * Math.PI) / 180;
    const localDx = dx * Math.cos(-angleRad) - dy * Math.sin(-angleRad);
    const localDy = dx * Math.sin(-angleRad) + dy * Math.cos(-angleRad);

    newPoints[activeHandleIndex] = {
      x: dragStartPoints[activeHandleIndex].x + localDx,
      y: dragStartPoints[activeHandleIndex].y + localDy,
    };
    
    // Save to store (using updateLayer directly will trigger re-render)
    updateLayer(layer.id, { controlPoints: newPoints });
  }, [activeHandleIndex, dragStartMouse, dragStartPoints, zoom, layer.id, layer.rotation, updateLayer]);

  const handleMouseUp = useCallback(() => {
    if (activeHandleIndex !== null) {
      setActiveHandleIndex(null);
      setDragging(false);
    }
  }, [activeHandleIndex, setDragging]);

  useEffect(() => {
    if (activeHandleIndex !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [activeHandleIndex, handleMouseMove, handleMouseUp]);

  // Only render handles if we are in Bezier or Freehand mode
  if (layer.curveType !== 'bezier' && layer.curveType !== 'freehand') {
    return null;
  }

  return (
    <g 
      transform={`translate(${layer.position.x}, ${layer.position.y}) rotate(${layer.rotation})`}
      data-interaction="true"
    >
      {/* Draw connecting lines between points to visualize the path control structure */}
      <polyline 
        points={points.map(p => `${p.x},${p.y}`).join(' ')} 
        fill="none" 
        stroke="rgba(99, 102, 241, 0.4)" 
        strokeWidth={2 / zoom} 
        strokeDasharray={`${4 / zoom} ${4 / zoom}`} 
      />
      
      {/* Draw the handles */}
      {points.map((p, index) => (
        <g 
          key={index} 
          transform={`translate(${p.x}, ${p.y})`}
          onMouseDown={(e) => handleMouseDown(e, index)}
          style={{ cursor: 'pointer' }}
        >
          {/* Invisible larger hit area */}
          <circle r={12 / zoom} fill="transparent" />
          {/* Visible handle */}
          <circle 
            r={5 / zoom} 
            fill={activeHandleIndex === index ? '#ffffff' : 'var(--color-accent)'} 
            stroke="#1a1a28" 
            strokeWidth={2 / zoom} 
          />
        </g>
      ))}
    </g>
  );
}

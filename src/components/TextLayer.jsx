import React, { useMemo } from 'react';
import { generatePathForLayer } from '../utils/pathGenerators';

/**
 * Renders a single text layer as an SVG group with textPath.
 */
export default function TextLayer({ layer, isActive }) {
  const pathId = `path-${layer.id}`;
  const filterId = `filter-${layer.id}`;
  const glowFilterId = `glow-${layer.id}`;

  // Generate the SVG path based on curve settings
  const pathD = useMemo(() => {
    return generatePathForLayer(layer);
  }, [
    layer.curveType, layer.curveStrength, layer.curveRadius,
    layer.flipPath, layer.insideCircle, layer.controlPoints,
    layer.fontSize, layer.text,
  ]);

  // Build filter for shadow
  const hasFilter = layer.shadowEnabled || layer.glowEnabled;

  // Text style
  const textStyle = {
    fontSize: `${layer.fontSize}px`,
    fontFamily: `"${layer.fontFamily}", sans-serif`,
    fontWeight: layer.fontWeight,
    fontStyle: layer.fontStyle,
    letterSpacing: `${layer.letterSpacing}px`,
    fill: layer.fillColor,
    opacity: layer.opacity,
    // Paint order: stroke behind fill for outline effect
    paintOrder: layer.outlineEnabled ? 'stroke' : 'normal',
    stroke: layer.outlineEnabled ? layer.outlineColor : 'none',
    strokeWidth: layer.outlineEnabled ? layer.outlineWidth : 0,
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
  };

  if (!layer.visible) return null;

  return (
    <g
      transform={`translate(${layer.position.x}, ${layer.position.y}) rotate(${layer.rotation})`}
      data-layer-id={layer.id}
      style={{ cursor: layer.locked ? 'default' : 'move' }}
    >
      <defs>
        {/* Path definition */}
        <path id={pathId} d={pathD} fill="none" />

        {/* Shadow filter */}
        {layer.shadowEnabled && (
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx={layer.shadowOffsetX}
              dy={layer.shadowOffsetY}
              stdDeviation={layer.shadowBlur / 2}
              floodColor={layer.shadowColor}
              floodOpacity="1"
            />
          </filter>
        )}

        {/* Glow filter */}
        {layer.glowEnabled && (
          <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={layer.glowBlur / 2} result="blur" />
            <feFlood floodColor={layer.glowColor} floodOpacity="0.8" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Debug: show path (only when active) */}
      {isActive && (
        <use
          href={`#${pathId}`}
          stroke="rgba(99, 102, 241, 0.3)"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
          data-interaction="true"
        />
      )}

      {/* Text on path */}
      <text
        style={textStyle}
        filter={
          layer.glowEnabled
            ? `url(#${glowFilterId})`
            : layer.shadowEnabled
            ? `url(#${filterId})`
            : undefined
        }
      >
        <textPath
          href={`#${pathId}`}
          startOffset={layer.curveType === 'circle' ? '0%' : '0%'}
          textAnchor="start"
          dominantBaseline="auto"
        >
          {layer.text}
        </textPath>
      </text>
    </g>
  );
}

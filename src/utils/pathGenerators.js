/**
 * Path generator utilities for curved text rendering.
 * Each function returns an SVG path `d` attribute string.
 */

/**
 * Generate an arc path (quadratic bezier).
 * @param {number} width - width of the arc
 * @param {number} strength - how curved (0-100), mapped to control point offset
 * @param {'up'|'down'} direction - arc direction
 * @returns {string} SVG path d attribute
 */
export function generateArcPath(width = 400, strength = 50, direction = 'up') {
  const h = (strength / 100) * (width * 0.6);
  const cy = direction === 'up' ? -h : h;
  return `M 0,0 Q ${width / 2},${cy} ${width},0`;
}

/**
 * Generate a circle path.
 * @param {number} radius - circle radius
 * @param {boolean} inside - text on inside of circle
 * @returns {string} SVG path d attribute
 */
export function generateCirclePath(radius = 200, inside = false) {
  if (inside) {
    // Clockwise for inside text
    return `M ${-radius},0 A ${radius},${radius} 0 1,1 ${radius},0 A ${radius},${radius} 0 1,1 ${-radius},0`;
  }
  // Counter-clockwise for outside text
  return `M ${-radius},0 A ${radius},${radius} 0 1,0 ${radius},0 A ${radius},${radius} 0 1,0 ${-radius},0`;
}

/**
 * Generate a wave path using chained cubic beziers.
 * @param {number} width - total width
 * @param {number} amplitude - wave height (strength)
 * @param {number} frequency - number of waves (1-5)
 * @returns {string} SVG path d attribute
 */
export function generateWavePath(width = 400, amplitude = 40, frequency = 2) {
  const segWidth = width / frequency;
  let d = `M 0,0`;
  for (let i = 0; i < frequency; i++) {
    const x0 = i * segWidth;
    const x1 = x0 + segWidth;
    const dir = i % 2 === 0 ? -1 : 1;
    const cp1x = x0 + segWidth * 0.33;
    const cp1y = dir * amplitude;
    const cp2x = x0 + segWidth * 0.66;
    const cp2y = dir * amplitude;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x1},0`;
  }
  return d;
}

/**
 * Generate a spiral path (Archimedean approximation).
 * @param {number} maxRadius - outer radius
 * @param {number} turns - number of spiral turns (0.5-3)
 * @returns {string} SVG path d attribute
 */
export function generateSpiralPath(maxRadius = 150, turns = 1.5) {
  const points = [];
  const steps = Math.ceil(turns * 60);
  const totalAngle = turns * Math.PI * 2;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * totalAngle - Math.PI / 2;
    const r = (t * maxRadius) + 10;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    points.push({ x, y });
  }
  
  return pointsToSmoothPath(points);
}

/**
 * Generate a bezier path from user-defined control points.
 * @param {Array<{x: number, y: number}>} controlPoints
 * @returns {string} SVG path d attribute
 */
export function generateBezierPath(controlPoints) {
  if (!controlPoints || controlPoints.length < 2) {
    return generateArcPath(400, 50, 'up');
  }
  
  if (controlPoints.length === 2) {
    return `M ${controlPoints[0].x},${controlPoints[0].y} L ${controlPoints[1].x},${controlPoints[1].y}`;
  }
  
  if (controlPoints.length === 3) {
    return `M ${controlPoints[0].x},${controlPoints[0].y} Q ${controlPoints[1].x},${controlPoints[1].y} ${controlPoints[2].x},${controlPoints[2].y}`;
  }
  
  if (controlPoints.length === 4) {
    return `M ${controlPoints[0].x},${controlPoints[0].y} C ${controlPoints[1].x},${controlPoints[1].y} ${controlPoints[2].x},${controlPoints[2].y} ${controlPoints[3].x},${controlPoints[3].y}`;
  }
  
  // For more points, chain cubic beziers
  return pointsToSmoothPath(controlPoints);
}

/**
 * Generate a smooth freehand path from drawn points using Catmull-Rom to Bezier conversion.
 * @param {Array<{x: number, y: number}>} points
 * @returns {string} SVG path d attribute
 */
export function generateFreehandPath(points) {
  if (!points || points.length < 2) {
    return generateArcPath(400, 50, 'up');
  }
  return pointsToSmoothPath(points);
}

/**
 * Convert an array of points to a smooth SVG path using Catmull-Rom splines.
 * @param {Array<{x: number, y: number}>} points
 * @returns {string} SVG path d attribute
 */
function pointsToSmoothPath(points) {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }
  
  let d = `M ${points[0].x},${points[0].y}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    
    // Catmull-Rom to Bezier conversion
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  
  return d;
}

/**
 * Reverse an SVG path so text flows in opposite direction.
 * Simple approach: reverse the points for basic paths.
 * @param {string} pathD - SVG path d attribute
 * @returns {string} reversed path
 */
export function reversePath(pathD) {
  // For arc paths (M ... Q/C ...), we reverse by swapping start and end
  // This is a simplified approach that works for our generated paths
  const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathEl.setAttribute('d', pathD);
  
  const totalLength = pathEl.getTotalLength();
  const steps = 50;
  const points = [];
  
  for (let i = steps; i >= 0; i--) {
    const point = pathEl.getPointAtLength((i / steps) * totalLength);
    points.push({ x: point.x, y: point.y });
  }
  
  return pointsToSmoothPath(points);
}

/**
 * Generate the appropriate path based on curve type and parameters.
 * @param {object} layer - layer configuration object
 * @returns {string} SVG path d attribute
 */
export function generatePathForLayer(layer) {
  const {
    curveType,
    curveStrength = 50,
    curveRadius = 200,
    flipPath = false,
    insideCircle = false,
    controlPoints = [],
    fontSize = 48,
    text = '',
  } = layer;

  // Estimate text width for path sizing
  const estimatedWidth = text.length * fontSize * 0.55;
  const width = Math.max(estimatedWidth, 200);

  let path;

  switch (curveType) {
    case 'arc-up':
      path = generateArcPath(width, curveStrength, 'up');
      break;
    case 'arc-down':
      path = generateArcPath(width, curveStrength, 'down');
      break;
    case 'circle':
      path = generateCirclePath(curveRadius, insideCircle);
      break;
    case 'wave':
      path = generateWavePath(width, curveStrength * 0.8, 2);
      break;
    case 'spiral':
      path = generateSpiralPath(curveRadius, curveStrength / 35);
      break;
    case 'bezier':
      if (controlPoints.length >= 2) {
        path = generateBezierPath(controlPoints);
      } else {
        // Default bezier with 4 control points
        path = generateBezierPath([
          { x: 0, y: 0 },
          { x: width * 0.33, y: -(curveStrength * 2) },
          { x: width * 0.66, y: curveStrength * 2 },
          { x: width, y: 0 },
        ]);
      }
      break;
    case 'freehand':
      if (controlPoints.length >= 2) {
        path = generateFreehandPath(controlPoints);
      } else {
        path = generateArcPath(width, curveStrength, 'up');
      }
      break;
    default:
      path = generateArcPath(width, curveStrength, 'up');
  }

  if (flipPath) {
    path = reversePath(path);
  }

  return path;
}

/**
 * Get default control points for bezier type.
 */
export function getDefaultBezierPoints(width = 400, strength = 50) {
  return [
    { x: 0, y: 0 },
    { x: width * 0.33, y: -(strength * 2) },
    { x: width * 0.66, y: strength * 2 },
    { x: width, y: 0 },
  ];
}

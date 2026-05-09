/**
 * Export utilities for CurveLayer.
 * Handles PNG (text-only & composite), SVG, and project JSON exports.
 */

/**
 * Embed Google Fonts as base64 in an SVG element for export.
 * @param {SVGElement} svgClone - cloned SVG element
 * @param {string[]} fontFamilies - list of font families to embed
 */
async function embedFonts(svgClone, fontFamilies) {
  const uniqueFonts = [...new Set(fontFamilies.filter(f => f))];
  if (uniqueFonts.length === 0) return;

  let cssText = '';
  
  for (const font of uniqueFonts) {
    try {
      const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@300;400;500;600;700;800;900&display=swap`;
      const response = await fetch(url);
      const css = await response.text();
      
      // Extract woff2 URLs and convert to base64
      const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g;
      let match;
      let processedCss = css;
      
      while ((match = urlRegex.exec(css)) !== null) {
        try {
          const fontResponse = await fetch(match[1]);
          const fontBlob = await fontResponse.blob();
          const base64 = await blobToBase64(fontBlob);
          processedCss = processedCss.replace(match[1], base64);
        } catch (e) {
          console.warn(`Failed to embed font file: ${match[1]}`, e);
        }
      }
      
      cssText += processedCss + '\n';
    } catch (e) {
      console.warn(`Failed to load font CSS for ${font}`, e);
    }
  }

  if (cssText) {
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = cssText;
    const defs = svgClone.querySelector('defs') || svgClone.insertBefore(
      document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
      svgClone.firstChild
    );
    defs.appendChild(styleEl);
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Export SVG element to PNG.
 * @param {SVGElement} svgElement - the SVG to export
 * @param {object} options
 * @param {number} options.scale - resolution multiplier (1, 2, or 4)
 * @param {boolean} options.textOnly - if true, remove background image
 * @param {number} options.padding - transparent padding in px
 * @param {string[]} options.fontFamilies - fonts to embed
 * @returns {Promise<Blob>}
 */
export async function exportToPNG(svgElement, options = {}) {
  const { scale = 2, textOnly = false, padding = 0, fontFamilies = [] } = options;
  
  // Clone the SVG
  const clone = svgElement.cloneNode(true);
  
  // Remove interaction handles
  const handles = clone.querySelectorAll('[data-interaction]');
  handles.forEach(h => h.remove());
  
  // Remove grid and guides
  const grids = clone.querySelectorAll('[data-grid], [data-guides]');
  grids.forEach(g => g.remove());

  if (textOnly) {
    // Remove background image
    const bgImages = clone.querySelectorAll('[data-background]');
    bgImages.forEach(bg => bg.remove());
  }

  // Embed fonts
  await embedFonts(clone, fontFamilies);

  // Get dimensions
  const viewBox = svgElement.getAttribute('viewBox');
  const [, , vw, vh] = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 1200, 800];
  
  const totalWidth = (vw + padding * 2) * scale;
  const totalHeight = (vh + padding * 2) * scale;

  // Set explicit dimensions on clone
  clone.setAttribute('width', totalWidth);
  clone.setAttribute('height', totalHeight);
  clone.setAttribute('viewBox', `${-padding} ${-padding} ${vw + padding * 2} ${vh + padding * 2}`);

  // Serialize to string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  
  // Create an image source from the SVG string
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = totalWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, totalWidth, totalHeight);
      ctx.drawImage(img, 0, 0, totalWidth, totalHeight);
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };
    img.onerror = (e) => {
      reject(new Error('Failed to render SVG to canvas'));
    };
    img.src = svgDataUrl;
  });
}

/**
 * Export SVG element as SVG file.
 * @param {SVGElement} svgElement
 * @param {string[]} fontFamilies
 * @returns {Promise<Blob>}
 */
export async function exportToSVG(svgElement, fontFamilies = []) {
  const clone = svgElement.cloneNode(true);
  
  // Remove interaction elements
  const handles = clone.querySelectorAll('[data-interaction]');
  handles.forEach(h => h.remove());
  const grids = clone.querySelectorAll('[data-grid], [data-guides]');
  grids.forEach(g => g.remove());

  await embedFonts(clone, fontFamilies);

  const serializer = new XMLSerializer();
  const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(clone);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}


/**
 * Trigger a file download.
 * @param {string} dataUrl - The data URL to download
 * @param {string} filename
 */
export async function downloadBlob(dataUrl, filename) {
  // Use modern File System Access API if available (Chrome/Edge)
  // This guarantees the exact filename and avoids all UUID/Blob download bugs
  try {
    if (window.showSaveFilePicker) {
      // Determine the extension from the filename
      const ext = filename.split('.').pop().toLowerCase();
      const mimeType = ext === 'json' ? 'application/json' : 
                       ext === 'svg' ? 'image/svg+xml' : 'image/png';
                       
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: ext.toUpperCase() + ' File',
          accept: { [mimeType]: ['.' + ext] },
        }],
      });
      const writable = await handle.createWritable();
      
      // Convert Data URL back to Blob for saving
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      await writable.write(blob);
      await writable.close();
      return; // Success!
    }
  } catch (err) {
    // If the user cancelled the save dialog, just return
    if (err.name === 'AbortError') return;
    console.error('File System API failed, falling back:', err);
  }

  // Fallback for Firefox/Safari
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}

/**
 * Export project state as JSON.
 * @param {object} state
 */
export function exportProjectJSON(state) {
  const projectData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    ...state,
  };
  const json = JSON.stringify(projectData, null, 2);
  const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
  downloadBlob(dataUrl, `curvelayer-project-${Date.now()}.json`);
}

/**
 * Load project state from JSON file.
 * @returns {Promise<object>} parsed project state
 */
export function loadProjectJSON() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return reject(new Error('No file selected'));
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          resolve(data);
        } catch (err) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };
    input.click();
  });
}

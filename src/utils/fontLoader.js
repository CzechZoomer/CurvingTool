/**
 * Google Fonts loading utility using CSS Font Loading API.
 */

// Curated list of popular Google Fonts organized by category
export const FONT_CATEGORIES = {
  'Popular': [
    'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 'Lato',
    'Oswald', 'Raleway', 'Nunito', 'Ubuntu', 'Playfair Display',
  ],
  'Sans Serif': [
    'Work Sans', 'Outfit', 'DM Sans', 'Manrope', 'Space Grotesk',
    'Plus Jakarta Sans', 'Figtree', 'Sora', 'Albert Sans', 'Urbanist',
    'Lexend', 'Quicksand', 'Nunito Sans', 'Barlow', 'Mulish',
  ],
  'Serif': [
    'Merriweather', 'Lora', 'Crimson Text', 'Source Serif 4', 'EB Garamond',
    'Cormorant Garamond', 'Libre Baskerville', 'DM Serif Display',
    'Playfair Display SC', 'Bitter', 'Vollkorn', 'Spectral',
  ],
  'Display': [
    'Bebas Neue', 'Anton', 'Righteous', 'Fredoka One', 'Pacifico',
    'Lobster', 'Abril Fatface', 'Alfa Slab One', 'Bungee',
    'Black Ops One', 'Russo One', 'Permanent Marker', 'Bangers',
    'Press Start 2P', 'Orbitron', 'Monoton', 'Bungee Shade',
  ],
  'Handwriting': [
    'Dancing Script', 'Great Vibes', 'Sacramento', 'Satisfy',
    'Caveat', 'Kalam', 'Indie Flower', 'Patrick Hand',
    'Shadows Into Light', 'Amatic SC', 'Comfortaa', 'Cookie',
  ],
  'Monospace': [
    'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Space Mono',
    'IBM Plex Mono', 'Roboto Mono', 'Ubuntu Mono',
  ],
};

// Flatten all fonts into a single array
export const ALL_FONTS = Object.values(FONT_CATEGORIES).flat();

// Track which fonts have been loaded
const loadedFonts = new Set(['Inter', 'JetBrains Mono']);

/**
 * Load a Google Font dynamically using CSS Font Loading API.
 * @param {string} fontFamily - the font family name
 * @returns {Promise<boolean>} true if loaded successfully
 */
export async function loadGoogleFont(fontFamily) {
  if (loadedFonts.has(fontFamily)) return true;
  
  try {
    // Load the CSS from Google Fonts
    const weights = [300, 400, 500, 600, 700, 800, 900];
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@${weights.join(';')}&display=swap`;
    
    // Check if link already exists
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    }
    
    // Wait for font to be available
    await document.fonts.load(`400 16px "${fontFamily}"`);
    loadedFonts.add(fontFamily);
    return true;
  } catch (e) {
    console.warn(`Failed to load font: ${fontFamily}`, e);
    return false;
  }
}

/**
 * Check if a font is already loaded.
 * @param {string} fontFamily
 * @returns {boolean}
 */
export function isFontLoaded(fontFamily) {
  return loadedFonts.has(fontFamily);
}

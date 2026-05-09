import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { FONT_CATEGORIES, ALL_FONTS, loadGoogleFont, isFontLoaded } from '../utils/fontLoader';

/**
 * Searchable font picker dropdown with font preview and categories.
 */
export default function FontPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loadingFont, setLoadingFont] = useState(null);
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      searchRef.current?.focus();
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = useCallback(async (font) => {
    setLoadingFont(font);
    await loadGoogleFont(font);
    setLoadingFont(null);
    onChange(font);
    setIsOpen(false);
    setSearch('');
  }, [onChange]);

  const filteredFonts = search
    ? ALL_FONTS.filter((f) => f.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="relative" ref={containerRef}>
      <span className="control-label">Font Family</span>
      <button
        className="btn w-full justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
        style={{ fontFamily: isFontLoaded(value) ? `"${value}", sans-serif` : undefined }}
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="dropdown-menu w-full max-h-[360px]">
          {/* Search */}
          <div className="sticky top-0 bg-bg-secondary p-2 border-b border-border z-10">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search fonts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="!pl-8 !py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="p-1">
            {filteredFonts ? (
              // Search results
              filteredFonts.length > 0 ? (
                filteredFonts.map((font) => (
                  <FontItem
                    key={font}
                    font={font}
                    isSelected={font === value}
                    isLoading={font === loadingFont}
                    onSelect={handleSelect}
                  />
                ))
              ) : (
                <div className="px-3 py-4 text-center text-text-muted text-xs">
                  No fonts found
                </div>
              )
            ) : (
              // Categories
              Object.entries(FONT_CATEGORIES).map(([category, fonts]) => (
                <div key={category}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    {category}
                  </div>
                  {fonts.map((font) => (
                    <FontItem
                      key={font}
                      font={font}
                      isSelected={font === value}
                      isLoading={font === loadingFont}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FontItem({ font, isSelected, isLoading, onSelect }) {
  const [loaded, setLoaded] = useState(isFontLoaded(font));

  // Lazy-load the font for preview when visible
  useEffect(() => {
    if (!loaded) {
      loadGoogleFont(font).then(() => setLoaded(true));
    }
  }, [font, loaded]);

  return (
    <button
      className={`dropdown-item w-full text-left flex items-center justify-between ${
        isSelected ? 'selected' : ''
      }`}
      onClick={() => onSelect(font)}
      style={{
        fontFamily: loaded ? `"${font}", sans-serif` : undefined,
      }}
    >
      <span className="truncate">{font}</span>
      {isLoading && (
        <span className="text-[10px] text-text-muted animate-pulse">Loading...</span>
      )}
    </button>
  );
}

import React, { useState, useRef, useCallback, useEffect } from 'react';

const PRESET_COLORS = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#f43f5e', '#14b8a6', '#8b5cf6', '#d946ef',
  '#0ea5e9',
];

/**
 * Inline color picker with hex input, opacity, and preset swatches.
 */
export default function ColorPicker({ color, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(color);
  const pickerRef = useRef(null);

  useEffect(() => {
    setHexInput(color);
  }, [color]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleHexChange = useCallback((val) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      onChange(val);
    }
  }, [onChange]);

  return (
    <div className="relative" ref={pickerRef}>
      {label && <span className="control-label">{label}</span>}
      <div className="flex items-center gap-2">
        <button
          className="color-swatch flex-shrink-0"
          style={{ backgroundColor: color }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Pick color"
        />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          className="flex-1 font-mono text-xs !py-1.5"
          maxLength={7}
          spellCheck={false}
        />
      </div>

      {isOpen && (
        <div className="dropdown-menu p-3 w-[240px]" style={{ left: 0 }}>
          {/* Native color input as fallback */}
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[120px] border-0 rounded-lg cursor-pointer mb-3 p-0"
            style={{ background: 'none' }}
          />
          
          {/* Preset swatches */}
          <div className="grid grid-cols-8 gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className="color-swatch !w-full aspect-square"
                style={{
                  backgroundColor: c,
                  borderColor: c === color ? 'var(--color-accent)' : undefined,
                }}
                onClick={() => {
                  onChange(c);
                  setHexInput(c);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

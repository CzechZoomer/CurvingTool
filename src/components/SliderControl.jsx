import React from 'react';

/**
 * Reusable slider control with label and value display.
 */
export default function SliderControl({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  suffix = '',
  showValue = true,
}) {
  return (
    <div className="mb-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-secondary">{label}</span>
        {showValue && (
          <span className="text-xs font-mono text-text-muted tabular-nums">
            {typeof value === 'number' ? (Number.isInteger(step) ? value : value.toFixed(1)) : value}
            {suffix}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

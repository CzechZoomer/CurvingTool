import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, Bold, Italic, Type, Palette, Waypoints,
  Layers, FlipHorizontal, RotateCcw,
} from 'lucide-react';
import useProjectStore from '../store/useProjectStore';
import SliderControl from './SliderControl';
import ColorPicker from './ColorPicker';
import FontPicker from './FontPicker';
import LayersPanel from './LayersPanel';

const CURVE_TYPES = [
  { value: 'arc-up', label: 'Arc Up' },
  { value: 'arc-down', label: 'Arc Down' },
  { value: 'circle', label: 'Circle' },
  { value: 'wave', label: 'Wave' },
  { value: 'spiral', label: 'Spiral' },
  { value: 'bezier', label: 'Bezier Path' },
  { value: 'freehand', label: 'Freehand Path' },
];

function Section({ title, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel-section">
      <button
        className="flex items-center gap-2 w-full text-left panel-title !mb-0 hover:text-text-primary transition-colors cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {Icon && <Icon size={13} />}
        <span className="flex-1">{title}</span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>
      {open && <div className="mt-3 animate-fade-in">{children}</div>}
    </div>
  );
}

export default function LeftSidebar() {
  const { layers, activeLayerId, updateLayer } = useProjectStore();
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  if (!activeLayer) {
    return (
      <div className="w-[320px] flex-shrink-0 bg-bg-secondary border-r border-border overflow-y-auto h-full flex items-center justify-center">
        <p className="text-text-muted text-sm">No layer selected</p>
      </div>
    );
  }

  const update = (key, value) => updateLayer(activeLayer.id, { [key]: value });
  const updateMulti = (updates) => updateLayer(activeLayer.id, updates);

  return (
    <div className="w-[320px] flex-shrink-0 bg-bg-secondary border-r border-border overflow-y-auto h-full">
      {/* ===== TEXT CONTENT ===== */}
      <Section title="Text Content" icon={Type} defaultOpen={true}>
        <div className="mb-3">
          <span className="control-label">Text</span>
          <textarea
            value={activeLayer.text}
            onChange={(e) => update('text', e.target.value)}
            rows={2}
            className="resize-none"
            placeholder="Enter your text..."
          />
        </div>

        <FontPicker
          value={activeLayer.fontFamily}
          onChange={(v) => update('fontFamily', v)}
        />

        <div className="mt-3">
          <SliderControl
            label="Font Size"
            value={activeLayer.fontSize}
            min={8}
            max={200}
            step={1}
            onChange={(v) => update('fontSize', v)}
            suffix="px"
          />
        </div>

        <div className="flex items-center gap-2 mb-2.5">
          <button
            className={`btn btn-sm btn-icon ${activeLayer.fontWeight >= 700 ? 'btn-primary' : ''}`}
            onClick={() => update('fontWeight', activeLayer.fontWeight >= 700 ? 400 : 700)}
            title="Bold"
          >
            <Bold size={14} />
          </button>
          <button
            className={`btn btn-sm btn-icon ${activeLayer.fontStyle === 'italic' ? 'btn-primary' : ''}`}
            onClick={() => update('fontStyle', activeLayer.fontStyle === 'italic' ? 'normal' : 'italic')}
            title="Italic"
          >
            <Italic size={14} />
          </button>
        </div>

        <SliderControl
          label="Letter Spacing"
          value={activeLayer.letterSpacing}
          min={-10}
          max={30}
          step={0.5}
          onChange={(v) => update('letterSpacing', v)}
          suffix="px"
        />
      </Section>

      {/* ===== STYLING ===== */}
      <Section title="Styling" icon={Palette} defaultOpen={true}>
        <div className="mb-3">
          <ColorPicker
            label="Text Color"
            color={activeLayer.fillColor}
            onChange={(v) => update('fillColor', v)}
          />
        </div>

        <SliderControl
          label="Opacity"
          value={activeLayer.opacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update('opacity', v)}
        />

        {/* Outline */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary">Text Outline</span>
          <div
            className={`toggle ${activeLayer.outlineEnabled ? 'active' : ''}`}
            onClick={() => update('outlineEnabled', !activeLayer.outlineEnabled)}
          />
        </div>
        {activeLayer.outlineEnabled && (
          <div className="ml-2 pl-2 border-l border-border animate-fade-in">
            <ColorPicker
              label="Outline Color"
              color={activeLayer.outlineColor}
              onChange={(v) => update('outlineColor', v)}
            />
            <div className="mt-2">
              <SliderControl
                label="Outline Width"
                value={activeLayer.outlineWidth}
                min={1}
                max={20}
                step={0.5}
                onChange={(v) => update('outlineWidth', v)}
                suffix="px"
              />
            </div>
          </div>
        )}

        {/* Shadow */}
        <div className="flex items-center justify-between mb-2 mt-3">
          <span className="text-xs text-text-secondary">Drop Shadow</span>
          <div
            className={`toggle ${activeLayer.shadowEnabled ? 'active' : ''}`}
            onClick={() => update('shadowEnabled', !activeLayer.shadowEnabled)}
          />
        </div>
        {activeLayer.shadowEnabled && (
          <div className="ml-2 pl-2 border-l border-border animate-fade-in">
            <ColorPicker
              label="Shadow Color"
              color={activeLayer.shadowColor}
              onChange={(v) => update('shadowColor', v)}
            />
            <div className="mt-2">
              <SliderControl
                label="Blur"
                value={activeLayer.shadowBlur}
                min={0}
                max={30}
                onChange={(v) => update('shadowBlur', v)}
                suffix="px"
              />
              <SliderControl
                label="Offset X"
                value={activeLayer.shadowOffsetX}
                min={-20}
                max={20}
                onChange={(v) => update('shadowOffsetX', v)}
                suffix="px"
              />
              <SliderControl
                label="Offset Y"
                value={activeLayer.shadowOffsetY}
                min={-20}
                max={20}
                onChange={(v) => update('shadowOffsetY', v)}
                suffix="px"
              />
            </div>
          </div>
        )}

        {/* Glow */}
        <div className="flex items-center justify-between mb-2 mt-3">
          <span className="text-xs text-text-secondary">Glow Effect</span>
          <div
            className={`toggle ${activeLayer.glowEnabled ? 'active' : ''}`}
            onClick={() => update('glowEnabled', !activeLayer.glowEnabled)}
          />
        </div>
        {activeLayer.glowEnabled && (
          <div className="ml-2 pl-2 border-l border-border animate-fade-in">
            <ColorPicker
              label="Glow Color"
              color={activeLayer.glowColor}
              onChange={(v) => update('glowColor', v)}
            />
            <div className="mt-2">
              <SliderControl
                label="Glow Blur"
                value={activeLayer.glowBlur}
                min={2}
                max={40}
                onChange={(v) => update('glowBlur', v)}
                suffix="px"
              />
            </div>
          </div>
        )}
      </Section>

      {/* ===== CURVE CONTROLS ===== */}
      <Section title="Curve Controls" icon={Waypoints} defaultOpen={true}>
        <div className="mb-3">
          <span className="control-label">Curve Type</span>
          <select
            value={activeLayer.curveType}
            onChange={(e) => update('curveType', e.target.value)}
          >
            {CURVE_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>{ct.label}</option>
            ))}
          </select>
        </div>

        {activeLayer.curveType !== 'circle' && (
          <SliderControl
            label="Curve Strength"
            value={activeLayer.curveStrength}
            min={0}
            max={100}
            onChange={(v) => update('curveStrength', v)}
            suffix="%"
          />
        )}

        {(activeLayer.curveType === 'circle' || activeLayer.curveType === 'spiral') && (
          <SliderControl
            label="Radius"
            value={activeLayer.curveRadius}
            min={50}
            max={500}
            onChange={(v) => update('curveRadius', v)}
            suffix="px"
          />
        )}

        <SliderControl
          label="Rotation"
          value={activeLayer.rotation}
          min={-180}
          max={180}
          step={1}
          onChange={(v) => update('rotation', v)}
          suffix="°"
        />

        <div className="flex items-center gap-2 mt-1">
          <button
            className={`btn btn-sm flex-1 ${activeLayer.flipPath ? 'btn-primary' : ''}`}
            onClick={() => update('flipPath', !activeLayer.flipPath)}
          >
            <FlipHorizontal size={14} />
            <span>Flip Path</span>
          </button>

          {activeLayer.curveType === 'circle' && (
            <button
              className={`btn btn-sm flex-1 ${activeLayer.insideCircle ? 'btn-primary' : ''}`}
              onClick={() => update('insideCircle', !activeLayer.insideCircle)}
            >
              <RotateCcw size={14} />
              <span>{activeLayer.insideCircle ? 'Inside' : 'Outside'}</span>
            </button>
          )}
        </div>
      </Section>

      {/* ===== LAYERS ===== */}
      <Section title="Layers" icon={Layers} defaultOpen={true}>
        <LayersPanel />
      </Section>
    </div>
  );
}

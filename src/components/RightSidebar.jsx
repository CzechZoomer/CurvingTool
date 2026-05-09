import React, { useState, useCallback } from 'react';
import {
  Download, Image, FileCode2, Save, FolderOpen,
  Sparkles, Loader2, X, FileImage,
} from 'lucide-react';
import useProjectStore from '../store/useProjectStore';
import { exportToPNG, exportToSVG, downloadBlob, exportProjectJSON, loadProjectJSON } from '../utils/exportUtils';
import SliderControl from './SliderControl';

const PRESETS = [
  {
    name: 'Circular Badge',
    settings: { curveType: 'circle', curveRadius: 160, fontSize: 32, curveStrength: 50 },
  },
  {
    name: 'Arc Banner',
    settings: { curveType: 'arc-up', curveStrength: 60, fontSize: 56 },
  },
  {
    name: 'Wave Text',
    settings: { curveType: 'wave', curveStrength: 40, fontSize: 44 },
  },
  {
    name: 'Spiral Logo',
    settings: { curveType: 'spiral', curveRadius: 140, curveStrength: 50, fontSize: 28 },
  },
  {
    name: 'Arc Down',
    settings: { curveType: 'arc-down', curveStrength: 55, fontSize: 48 },
  },
  {
    name: 'Tight Circle',
    settings: { curveType: 'circle', curveRadius: 100, fontSize: 20, insideCircle: true },
  },
];

export default function RightSidebar() {
  const [exportScale, setExportScale] = useState(2);
  const [exportPadding, setExportPadding] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('');

  const {
    layers, activeLayerId, updateLayer,
    backgroundImage, backgroundOpacity,
    setBackgroundOpacity, removeBackgroundImage,
    loadProject, getExportState,
    canvasWidth, canvasHeight, setCanvasSize,
  } = useProjectStore();

  const getFontFamilies = useCallback(() => {
    return layers.map((l) => l.fontFamily);
  }, [layers]);

  const handleExport = useCallback(async (textOnly = false) => {
    const svg = document.getElementById('main-canvas');
    if (!svg) return;

    setIsExporting(true);
    setExportType(textOnly ? 'text-only' : 'composite');

    try {
      const blob = await exportToPNG(svg, {
        scale: exportScale,
        textOnly,
        padding: exportPadding,
        fontFamilies: getFontFamilies(),
      });
      const name = textOnly ? 'curvelayer-text' : 'curvelayer-export';
      downloadBlob(blob, `${name}-${Date.now()}.png`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  }, [exportScale, exportPadding, getFontFamilies]);

  const handleExportSVG = useCallback(async () => {
    const svg = document.getElementById('main-canvas');
    if (!svg) return;

    setIsExporting(true);
    setExportType('svg');

    try {
      const blob = await exportToSVG(svg, getFontFamilies());
      downloadBlob(blob, `curvelayer-${Date.now()}.svg`);
    } catch (err) {
      console.error('SVG export failed:', err);
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  }, [getFontFamilies]);

  const handleSaveProject = useCallback(() => {
    exportProjectJSON(getExportState());
  }, [getExportState]);

  const handleLoadProject = useCallback(async () => {
    try {
      const data = await loadProjectJSON();
      loadProject(data);
    } catch (err) {
      if (err.message !== 'No file selected') {
        alert('Failed to load project: ' + err.message);
      }
    }
  }, [loadProject]);

  const handleApplyPreset = useCallback((preset) => {
    if (activeLayerId) {
      updateLayer(activeLayerId, preset.settings);
    }
  }, [activeLayerId, updateLayer]);

  return (
    <div className="w-[280px] flex-shrink-0 bg-bg-secondary border-l border-border overflow-y-auto h-full">
      {/* ===== EXPORT ===== */}
      <div className="panel-section">
        <div className="panel-title">Export</div>

        {/* Export buttons */}
        <button
          className="btn btn-primary w-full mb-2 justify-center"
          onClick={() => handleExport(true)}
          disabled={isExporting}
        >
          {isExporting && exportType === 'text-only' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          <span>Export Text Only (PNG)</span>
        </button>

        <button
          className="btn w-full mb-2 justify-center"
          onClick={() => handleExport(false)}
          disabled={isExporting}
        >
          {isExporting && exportType === 'composite' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <FileImage size={14} />
          )}
          <span>Export Composite (PNG)</span>
        </button>

        <button
          className="btn w-full mb-3 justify-center"
          onClick={handleExportSVG}
          disabled={isExporting}
        >
          {isExporting && exportType === 'svg' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <FileCode2 size={14} />
          )}
          <span>Export SVG</span>
        </button>

        {/* Export options */}
        <div className="mb-2">
          <span className="control-label">Resolution</span>
          <div className="flex gap-1">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                className={`btn btn-sm flex-1 ${exportScale === s ? 'btn-primary' : ''}`}
                onClick={() => setExportScale(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <SliderControl
          label="Transparent Padding"
          value={exportPadding}
          min={0}
          max={100}
          onChange={setExportPadding}
          suffix="px"
        />
      </div>

      {/* ===== PROJECT ===== */}
      <div className="panel-section">
        <div className="panel-title">Project</div>

        <div className="flex gap-2 mb-3">
          <button className="btn btn-sm flex-1 justify-center" onClick={handleSaveProject}>
            <Save size={13} />
            <span>Save</span>
          </button>
          <button className="btn btn-sm flex-1 justify-center" onClick={handleLoadProject}>
            <FolderOpen size={13} />
            <span>Load</span>
          </button>
        </div>

        {/* Canvas size */}
        <div className="mb-2">
          <span className="control-label">Canvas Size</span>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={canvasWidth}
              onChange={(e) => setCanvasSize(parseInt(e.target.value) || 1200, canvasHeight)}
              className="!py-1.5 text-xs font-mono text-center"
              min={100}
              max={4000}
            />
            <span className="text-text-muted text-xs">×</span>
            <input
              type="number"
              value={canvasHeight}
              onChange={(e) => setCanvasSize(canvasWidth, parseInt(e.target.value) || 800)}
              className="!py-1.5 text-xs font-mono text-center"
              min={100}
              max={4000}
            />
          </div>
        </div>
      </div>

      {/* ===== BACKGROUND ===== */}
      {backgroundImage && (
        <div className="panel-section">
          <div className="panel-title flex items-center justify-between">
            <span>Background Image</span>
            <button
              className="p-0.5 hover:text-danger transition-colors"
              onClick={removeBackgroundImage}
              title="Remove background"
            >
              <X size={13} />
            </button>
          </div>

          <SliderControl
            label="Opacity"
            value={backgroundOpacity}
            min={0}
            max={1}
            step={0.05}
            onChange={setBackgroundOpacity}
          />
        </div>
      )}

      {/* ===== PRESETS ===== */}
      <div className="panel-section">
        <div className="panel-title flex items-center gap-1.5">
          <Sparkles size={12} />
          <span>Presets</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              className="btn btn-sm text-xs justify-center"
              onClick={() => handleApplyPreset(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

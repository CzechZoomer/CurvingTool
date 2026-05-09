import React from 'react';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, Plus, Copy,
  ChevronUp, ChevronDown, Image as ImageIcon, Type,
} from 'lucide-react';
import useProjectStore from '../store/useProjectStore';

export default function LayersPanel() {
  const {
    layers, activeLayerId, backgroundImage,
    setActiveLayer, addLayer, removeLayer, duplicateLayer,
    toggleLayerVisibility, toggleLayerLock,
    moveLayerUp, moveLayerDown,
  } = useProjectStore();

  return (
    <div>
      {/* Background reference layer */}
      {backgroundImage && (
        <div className="layer-item opacity-60 mb-1">
          <ImageIcon size={14} className="text-text-muted flex-shrink-0" />
          <span className="flex-1 text-xs truncate">Background Image</span>
        </div>
      )}

      {/* Text layers (reversed for visual stacking order) */}
      {[...layers].reverse().map((layer) => (
        <div
          key={layer.id}
          className={`layer-item mb-1 group ${layer.id === activeLayerId ? 'active' : ''}`}
          onClick={() => setActiveLayer(layer.id)}
        >
          <Type size={14} className="text-text-muted flex-shrink-0" />
          <span className="flex-1 text-xs truncate">{layer.name}</span>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-1 hover:text-accent rounded transition-colors"
              onClick={(e) => { e.stopPropagation(); moveLayerUp(layer.id); }}
              title="Move up"
            >
              <ChevronUp size={12} />
            </button>
            <button
              className="p-1 hover:text-accent rounded transition-colors"
              onClick={(e) => { e.stopPropagation(); moveLayerDown(layer.id); }}
              title="Move down"
            >
              <ChevronDown size={12} />
            </button>
            <button
              className="p-1 hover:text-accent rounded transition-colors"
              onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
              title={layer.visible ? 'Hide' : 'Show'}
            >
              {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button
              className="p-1 hover:text-accent rounded transition-colors"
              onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
              title={layer.locked ? 'Unlock' : 'Lock'}
            >
              {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
            <button
              className="p-1 hover:text-accent rounded transition-colors"
              onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }}
              title="Duplicate"
            >
              <Copy size={12} />
            </button>
            {layers.length > 1 && (
              <button
                className="p-1 hover:text-danger rounded transition-colors"
                onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add layer button */}
      <button
        className="btn btn-sm w-full mt-2 justify-center"
        onClick={addLayer}
      >
        <Plus size={14} />
        <span>Add Text Layer</span>
      </button>
    </div>
  );
}

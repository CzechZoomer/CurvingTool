import React, { useEffect } from 'react';
import useProjectStore from './store/useProjectStore';
import Toolbar from './components/Toolbar';
import LeftSidebar from './components/LeftSidebar';
import Canvas from './components/Canvas';
import RightSidebar from './components/RightSidebar';

export default function App() {
  const {
    removeLayer, duplicateLayer, activeLayerId,
    zoomIn, zoomOut,
  } = useProjectStore();

  // ===== KEYBOARD SHORTCUTS =====
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useProjectStore.temporal.getState().undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useProjectStore.temporal.getState().redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        useProjectStore.temporal.getState().redo();
      }

      // Delete layer
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput && activeLayerId) {
        e.preventDefault();
        removeLayer(activeLayerId);
      }

      // Duplicate layer
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (activeLayerId) duplicateLayer(activeLayerId);
      }

      // Zoom
      if (e.key === '=' || e.key === '+') {
        if (!isInput) {
          e.preventDefault();
          zoomIn();
        }
      }
      if (e.key === '-') {
        if (!isInput) {
          e.preventDefault();
          zoomOut();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLayerId, removeLayer, duplicateLayer, zoomIn, zoomOut]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-bg-primary">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content: Left Sidebar | Canvas | Right Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <Canvas />
        <RightSidebar />
      </div>
    </div>
  );
}

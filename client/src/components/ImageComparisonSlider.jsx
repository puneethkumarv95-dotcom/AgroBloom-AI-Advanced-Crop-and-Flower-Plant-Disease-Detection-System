import React, { useState, useRef, useCallback } from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

const ImageComparisonSlider = ({
  originalImage,
  modifiedImage,
  originalLabel = 'Original Leaf Photo',
  modifiedLabel = 'Grad-CAM Attention Heatmap',
  aspectRatio = 'aspect-4/3'
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 px-1">
        <span className="flex items-center space-x-1.5 text-agro-700 dark:text-agro-400">
          <span className="w-2 h-2 rounded-full bg-agro-600"></span>
          <span>{originalLabel}</span>
        </span>
        <span className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{modifiedLabel}</span>
        </span>
      </div>

      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchMove}
        className={`relative w-full ${aspectRatio} max-h-[460px] rounded-2xl overflow-hidden cursor-ew-resize border border-slate-200 dark:border-slate-700 shadow-md bg-slate-900`}
      >
        {/* Background Image: Modified / Grad-CAM */}
        <img
          src={modifiedImage}
          alt={modifiedLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Foreground Image: Original (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={originalImage}
            alt={originalLabel}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
              maxWidth: 'none'
            }}
          />
        </div>

        {/* Vertical Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Draggable Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xl border-2 border-agro-600 flex items-center justify-center pointer-events-auto cursor-ew-resize">
            <SlidersHorizontal className="w-4 h-4 text-agro-700 dark:text-agro-400" />
          </div>
        </div>

        {/* Interactive Helper Pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-white pointer-events-none font-medium">
          Drag slider to compare attention
        </div>
      </div>
    </div>
  );
};

export default ImageComparisonSlider;


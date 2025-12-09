'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { getTooltipForIcon, getTooltipContext, TooltipData, TooltipContext } from '@/lib/tooltipLoader';

interface IconTooltipProps {
  iconPath?: string;
  context?: 'current' | 'proposed' | 'both';
  x: number;
  y: number;
  visible: boolean;
}

/**
 * IconTooltip Component
 *
 * Displays rich tooltip content for icons based on loaded tooltip data.
 * Automatically positions itself relative to cursor with smart boundary detection.
 */
export default function IconTooltip({
  iconPath,
  context = 'proposed',
  x,
  y,
  visible,
}: IconTooltipProps) {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipContext, setTooltipContext] = useState<TooltipContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Load tooltip data when icon changes
  useEffect(() => {
    if (!iconPath || !visible) {
      setTooltipData(null);
      setTooltipContext(null);
      return;
    }

    setLoading(true);
    getTooltipForIcon(iconPath).then(data => {
      setTooltipData(data);
      if (data) {
        setTooltipContext(getTooltipContext(data, context));
      }
      setLoading(false);
    });
  }, [iconPath, context, visible]);

  // Calculate optimal position after tooltip renders
  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width || 350; // Fallback width
    const tooltipHeight = tooltipRect.height || 300; // Fallback height
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Offset from cursor
    const offset = 15;
    const padding = 20; // Minimum distance from viewport edge
    
    // Calculate initial position (prefer bottom-right of cursor)
    let left = x + offset;
    let top = y + offset;
    
    // Check if tooltip would overflow right edge
    if (left + tooltipWidth > viewportWidth - padding) {
      // Flip to left side of cursor
      left = x - tooltipWidth - offset;
    }
    
    // Check if tooltip would overflow bottom edge
    if (top + tooltipHeight > viewportHeight - padding) {
      // Flip to above cursor
      top = y - tooltipHeight - offset;
    }
    
    // Ensure tooltip doesn't go off left edge
    if (left < padding) {
      left = padding;
    }
    
    // Ensure tooltip doesn't go off top edge
    if (top < padding) {
      top = padding;
    }
    
    // Final clamp to ensure tooltip stays fully visible
    left = Math.min(left, viewportWidth - tooltipWidth - padding);
    top = Math.min(top, viewportHeight - tooltipHeight - padding);
    
    setPosition({ left, top });
  }, [x, y, visible, tooltipData]);

  if (!visible || !tooltipData || !tooltipContext) {
    return null;
  }

  const tooltipStyle = {
    left: `${position.left}px`,
    top: `${position.top}px`,
  };

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] max-w-md pointer-events-none"
      style={tooltipStyle}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-h-[80vh] overflow-y-auto">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {tooltipContext.title}
        </h3>

        {/* Description */}
        {tooltipContext.description && (
          <p className="text-sm text-gray-700 mb-3">
            {tooltipContext.description}
          </p>
        )}

        {/* Performance Data */}
        {tooltipContext.performance && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-600 uppercase mb-1">
              Performance
            </h4>
            <div className="bg-blue-50 rounded p-2 space-y-1">
              {Object.entries(tooltipContext.performance).map(([key, value]) => (
                <div key={key} className="text-xs flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-gray-900 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problems */}
        {tooltipContext.problems && tooltipContext.problems.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-red-600 uppercase mb-1">
              Problems
            </h4>
            <ul className="space-y-1">
              {tooltipContext.problems.map((problem, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start">
                  <span className="text-red-500 mr-1">⚠️</span>
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {tooltipContext.improvements && tooltipContext.improvements.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-green-600 uppercase mb-1">
              Improvements
            </h4>
            <ul className="space-y-1">
              {tooltipContext.improvements.map((improvement, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start">
                  <span className="text-green-500 mr-1">✓</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {tooltipContext.benefits && tooltipContext.benefits.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-blue-600 uppercase mb-1">
              Benefits
            </h4>
            <ul className="space-y-1">
              {tooltipContext.benefits.map((benefit, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-1">→</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Value/Economic */}
        {tooltipContext.value && (
          <div className="bg-green-50 rounded p-2 border-l-4 border-green-500">
            <p className="text-xs font-semibold text-green-800">
              💰 {tooltipContext.value}
            </p>
          </div>
        )}

        {/* Context indicator */}
        <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
          <span>Context: {context}</span>
          <span className="text-gray-400">ℹ️</span>
        </div>
      </div>
    </div>
  );
}
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
    // Use actual measured dimensions or reasonable defaults
    const tooltipWidth = Math.max(tooltipRect.width, 300);
    const tooltipHeight = Math.max(tooltipRect.height, 200);
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const padding = 20; // Minimum distance from viewport edge
    
    // Determine which side of the viewport we're on
    const isRightSide = x > viewportWidth / 2;
    const isBottomArea = y > viewportHeight * 0.6; // Bottom 40% of viewport
    
    let left: number;
    let top: number;
    
    // Horizontal positioning - position on opposite side of viewport
    if (isRightSide) {
      // Cursor is on right side - show tooltip on far LEFT of viewport
      // This ensures no overlap with right-side icons
      left = padding;
    } else {
      // Cursor is on left side - show tooltip to the RIGHT of cursor
      const offset = 100; // Distance from cursor
      left = x + offset;
      // Make sure we don't go off right edge
      if (left + tooltipWidth > viewportWidth - padding) {
        left = viewportWidth - tooltipWidth - padding;
      }
    }
    
    // Vertical positioning
    if (isBottomArea) {
      // Cursor is in bottom area - position tooltip ABOVE the cursor
      const verticalOffset = 80; // Distance above cursor
      top = y - tooltipHeight - verticalOffset;
      // Ensure we don't go above viewport
      if (top < padding) {
        top = padding;
      }
    } else {
      // Normal positioning - center vertically relative to cursor
      top = y - tooltipHeight / 2;
      
      // Ensure tooltip stays within viewport bounds
      if (top < padding) {
        top = padding;
      } else if (top + tooltipHeight > viewportHeight - padding) {
        top = viewportHeight - tooltipHeight - padding;
      }
    }
    
    // Final safety clamps
    left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding));
    
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

        {/* Key Benefits (proposed system) - shown prominently at top */}
        {tooltipContext.key_benefits && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-green-600 uppercase mb-1">
              💰 Key Benefits
            </h4>
            <div className="bg-green-50 rounded p-2 space-y-1">
              {Object.entries(tooltipContext.key_benefits).map(([key, value]) => (
                <div key={key} className="text-xs flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-green-700 font-bold">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
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

        {/* Problems - only show for current context */}
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

        {/* How It Works (proposed system) */}
        {tooltipContext.how_it_works && tooltipContext.how_it_works.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-blue-600 uppercase mb-1">
              How It Works
            </h4>
            <ul className="space-y-1">
              {tooltipContext.how_it_works.map((step: string, idx: number) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-1">→</span>
                  <span>{step}</span>
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

        {/* Revenue Streams (proposed system) */}
        {tooltipContext.revenue_streams && tooltipContext.revenue_streams.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-green-600 uppercase mb-1">
              💵 Revenue Streams
            </h4>
            <ul className="space-y-1">
              {tooltipContext.revenue_streams.map((stream: string, idx: number) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start">
                  <span className="text-green-500 mr-1">$</span>
                  <span>{stream}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Configuration (proposed system) */}
        {tooltipContext.configuration && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-purple-600 uppercase mb-1">
              Configuration
            </h4>
            <div className="bg-purple-50 rounded p-2 space-y-1">
              {Object.entries(tooltipContext.configuration).map(([key, value]) => (
                <div key={key} className="text-xs flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-gray-900 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Operation (proposed system) */}
        {tooltipContext.operation && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-orange-600 uppercase mb-1">
              Operation
            </h4>
            <div className="bg-orange-50 rounded p-2 space-y-1">
              {Object.entries(tooltipContext.operation).map(([key, value]) => (
                <div key={key} className="text-xs flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-gray-900 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedstocks Accepted (proposed system) */}
        {tooltipContext.feedstocks_accepted && tooltipContext.feedstocks_accepted.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-amber-600 uppercase mb-1">
              Feedstocks Accepted
            </h4>
            <ul className="space-y-1">
              {tooltipContext.feedstocks_accepted.map((feedstock: string, idx: number) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start">
                  <span className="text-amber-500 mr-1">•</span>
                  <span>{feedstock}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Outputs (proposed system) */}
        {tooltipContext.outputs && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-teal-600 uppercase mb-1">
              Outputs
            </h4>
            <div className="bg-teal-50 rounded p-2 space-y-1">
              {Object.entries(tooltipContext.outputs).map(([key, value]) => (
                <div key={key} className="text-xs flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-gray-900 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outputs Per Tonne Litter (proposed system) */}
        {tooltipContext.outputs_per_tonne_litter && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-teal-600 uppercase mb-1">
              Outputs Per Tonne Litter
            </h4>
            <div className="bg-teal-50 rounded p-2 space-y-1">
              {Object.entries(tooltipContext.outputs_per_tonne_litter).map(([key, value]) => (
                <div key={key} className="text-xs flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-gray-900 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Energy Integration (proposed system) */}
        {tooltipContext.energy_integration && tooltipContext.energy_integration.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-yellow-600 uppercase mb-1">
              ⚡ Energy Integration
            </h4>
            <ul className="space-y-1">
              {tooltipContext.energy_integration.map((item: string, idx: number) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start">
                  <span className="text-yellow-500 mr-1">⚡</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Value/Economic */}
        {tooltipContext.value && (
          <div className="bg-green-50 rounded p-2 border-l-4 border-green-500 mb-3">
            <p className="text-xs font-semibold text-green-800">
              💰 {tooltipContext.value}
            </p>
          </div>
        )}

        {/* Bottom Line (proposed system) */}
        {tooltipContext.bottom_line && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded p-2 border-l-4 border-green-500">
            <p className="text-xs font-bold text-green-800">
              ✨ {tooltipContext.bottom_line}
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
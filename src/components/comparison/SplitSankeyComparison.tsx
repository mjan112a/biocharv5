'use client';

import React, { useState } from 'react';
import { CircularSankeyHomepage } from '@/components/d3/CircularSankeyHomepage';

interface DiagramData {
  metadata?: {
    title: string;
    description: string;
    type: string;
    system: string;
  };
  nodes: any[];
  links: any[];
  config: {
    width: number;
    height: number;
  };
}

interface SplitSankeyComparisonProps {
  currentDiagram: DiagramData | null;
  proposedDiagram: DiagramData;
  componentName: string;
  className?: string;
}

/**
 * SplitSankeyComparison - Displays toggleable comparison of current and proposed systems
 *
 * Features:
 * - Toggle switch to alternate between current and proposed views
 * - Smooth transition animations
 * - Handles cases where current system doesn't exist (new components)
 * - Full-width diagrams for maximum visibility
 * - Color-coded visual indicators
 */
export function SplitSankeyComparison({
  currentDiagram,
  proposedDiagram,
  componentName,
  className = ''
}: SplitSankeyComparisonProps) {
  // Default to showing proposed system
  const [showProposed, setShowProposed] = useState(true);
  
  return (
    <div className={`bg-card border border-border shadow-lg px-2 py-4 ${className}`}>
      {/* Animated View Container with floating toggle */}
      <div className="relative min-h-[700px]">
        
        {/* Floating Toggle - positioned on top of the diagram */}
        {currentDiagram && (
          <div className="absolute top-4 right-4 z-20">
            <div className="flex bg-white border-2 border-gray-300 p-1 shadow-sm rounded-lg">
              <button
                onClick={() => setShowProposed(false)}
                className={`px-6 py-2.5 text-sm font-bold transition-all duration-200 flex items-center gap-2 rounded-md ${
                  !showProposed
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>⚠️</span>
                Current
              </button>
              <button
                onClick={() => setShowProposed(true)}
                className={`px-6 py-2.5 text-sm font-bold transition-all duration-200 flex items-center gap-2 rounded-md ${
                  showProposed
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>✨</span>
                Proposed
              </button>
            </div>
          </div>
        )}
        
        {/* New component indicator */}
        {!currentDiagram && (
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium shadow-sm border border-primary/20">
              💡 New in proposed system
            </div>
          </div>
        )}
        
        {/* Current System View */}
        {currentDiagram && (
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              !showProposed
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
          >
            <div className="border border-border bg-white/50 backdrop-blur-sm shadow-inner overflow-hidden h-full">
              {/* Header */}
              <div className="bg-destructive/10 border-b-2 border-destructive px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="text-xl font-bold text-destructive uppercase tracking-wide">
                      Current System
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Linear Waste Model
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-2 bg-white min-h-[600px] flex items-center justify-center">
                <CircularSankeyHomepage
                  diagramData={currentDiagram}
                  width={1100}
                  height={600}
                  instanceId="current"
                />
              </div>
            </div>
          </div>
        )}

        {/* Proposed System View */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            showProposed
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="border border-border bg-white/50 backdrop-blur-sm shadow-inner overflow-hidden h-full">
            {/* Header */}
            <div className="bg-primary/10 border-b-2 border-primary px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="text-xl font-bold text-primary uppercase tracking-wide">
                    Proposed System
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Biochar Circular Economy Model
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-2 bg-white min-h-[600px] flex items-center justify-center">
              <CircularSankeyHomepage
                diagramData={proposedDiagram}
                width={1100}
                height={600}
                instanceId="proposed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`mt-6 p-4 rounded border-l-4 transition-colors duration-300 ${
        showProposed
          ? 'bg-primary/5 border-primary'
          : 'bg-destructive/5 border-destructive'
      }`}>
        <p className="text-sm text-foreground/80">
          <span className={`font-semibold ${showProposed ? 'text-primary' : 'text-destructive'}`}>
            {showProposed ? '✨ Benefits:' : '⚠️ Current Challenges:'}
          </span>{' '}
          {showProposed
            ? `The proposed system transforms ${componentName.toLowerCase()} operations through circular economy integration, converting waste into valuable resources while reducing environmental impact.`
            : currentDiagram
              ? `The current system faces challenges with waste disposal, environmental emissions, and missed opportunities for resource recovery.`
              : `${componentName} is a new innovation that addresses gaps in traditional poultry farming, creating value from materials that were previously wasted.`
          }
        </p>
      </div>
    </div>
  );
}

/**
 * NonExistentCurrentView - Shows educational message for components that don't exist in current practice
 */
function NonExistentCurrentView({ componentName }: { componentName: string }) {
  // Component-specific messages
  const messages: Record<string, { problems: string[]; opportunity: string }> = {
    'Anaerobic Digester': {
      problems: [
        'Organic waste (dead chickens, FOG) sent to landfills or rendering',
        'Valuable biogas energy potential completely wasted',
        'Greenhouse gas emissions from decomposition',
        'High waste disposal costs',
        'Missed opportunity for renewable energy generation'
      ],
      opportunity: 'The Anaerobic Digester converts organic waste into renewable biogas and valuable digestate, transforming a disposal problem into an energy solution.'
    },
    'Pyrolysis Unit': {
      problems: [
        'Used poultry litter has limited reuse options',
        'Direct land application can cause nutrient runoff',
        'Storage and handling challenges',
        'Environmental concerns with traditional disposal',
        'Ammonia and odor issues'
      ],
      opportunity: 'The Pyrolysis Unit transforms used litter into high-value biochar, bio-oils, and syngas, creating multiple revenue streams while solving a waste problem.'
    }
  };

  const info = messages[componentName] || {
    problems: ['Traditional system lacks this capability'],
    opportunity: 'This component adds significant value to the proposed system.'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto">
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 border-4 border-gray-300">
        <span className="text-5xl opacity-40">🚫</span>
      </div>

      {/* Title */}
      <h4 className="text-xl font-bold text-gray-800 mb-3 text-center">
        Innovation in Proposed System
      </h4>

      {/* Description */}
      <p className="text-sm text-gray-700 text-center mb-6 leading-relaxed">
        The <strong>{componentName}</strong> does not exist in current poultry farming practice.
        This represents a significant opportunity for improvement.
      </p>

      {/* Problems Without This Component */}
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h5 className="font-semibold text-red-900 mb-2 text-sm flex items-center gap-2">
          <span>⚠️</span>
          Problems Without This Component:
        </h5>
        <ul className="space-y-1.5">
          {info.problems.map((problem, idx) => (
            <li key={idx} className="text-xs text-red-800 leading-tight flex items-start">
              <span className="mr-2 mt-0.5">•</span>
              <span>{problem}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Opportunity */}
      <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4">
        <h5 className="font-semibold text-green-900 mb-2 text-sm flex items-center gap-2">
          <span>💡</span>
          The Opportunity:
        </h5>
        <p className="text-xs text-green-800 leading-relaxed">
          {info.opportunity}
        </p>
      </div>
    </div>
  );
}

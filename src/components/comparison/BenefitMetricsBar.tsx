'use client';

import React from 'react';

export interface BenefitItem {
  icon: string;
  text: string;
}

export interface ComponentBenefits {
  environmental: BenefitItem[];
  economic: BenefitItem[];
  operational: BenefitItem[];
}

interface BenefitsSummaryProps {
  benefits: ComponentBenefits;
  className?: string;
}

/**
 * BenefitsSummary - Displays potential benefits in a clean, minimal design
 *
 * Shows categorized benefits without making specific claims
 * Uses a subtle, professional appearance
 */
export function BenefitMetricsBar({ benefits, className = '' }: BenefitsSummaryProps) {
  const categories = [
    { key: 'environmental', label: 'Environmental Potential', color: 'text-green-700' },
    { key: 'economic', label: 'Economic Potential', color: 'text-green-700' },
    { key: 'operational', label: 'Operational Potential', color: 'text-green-700' },
  ] as const;

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Potential Benefits of the Proposed System
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Benefits will vary based on implementation and local conditions
        </p>
      </div>

      {/* Benefits in three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(({ key, label, color }) => (
          <div key={key} className="bg-white border border-gray-200 border-l-4 border-l-green-600 rounded-lg p-4 shadow-sm">
            <h4 className={`text-sm font-semibold ${color} mb-3 uppercase tracking-wide`}>
              {label}
            </h4>
            <ul className="space-y-2">
              {benefits[key].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Predefined benefit sets for each component - focused on potential rather than claims
 */
export const COMPONENT_METRICS: Record<string, ComponentBenefits> = {
  'farm': {
    environmental: [
      { icon: '💧', text: 'Reduced nutrient runoff to waterways' },
      { icon: '🌍', text: 'Carbon sequestration in soil' },
      { icon: '🌱', text: 'Lower synthetic fertilizer dependency' },
    ],
    economic: [
      { icon: '💰', text: 'Potential fertilizer cost reduction' },
      { icon: '📈', text: 'Improved crop yields over time' },
      { icon: '♻️', text: 'Value from waste materials' },
    ],
    operational: [
      { icon: '🌾', text: 'Enhanced soil water retention' },
      { icon: '🔬', text: 'Improved soil microbial activity' },
      { icon: '⚡', text: 'Reduced irrigation needs' },
    ],
  },
  'chicken-house': {
    environmental: [
      { icon: '😤', text: 'Reduced ammonia emissions' },
      { icon: '🌍', text: 'Lower greenhouse gas output' },
      { icon: '💨', text: 'Improved air quality in house' },
    ],
    economic: [
      { icon: '⚡', text: 'Potential ventilation cost savings' },
      { icon: '🐔', text: 'Improved bird productivity' },
      { icon: '💊', text: 'Reduced health-related costs' },
    ],
    operational: [
      { icon: '♻️', text: 'Extended litter life' },
      { icon: '🛠️', text: 'Simplified management' },
      { icon: '📊', text: 'Better growing conditions' },
    ],
  },
  'processing-plant': {
    environmental: [
      { icon: '🔥', text: 'Reduced fossil fuel dependency' },
      { icon: '♻️', text: 'Organic waste conversion' },
      { icon: '🌍', text: 'Lower carbon footprint' },
    ],
    economic: [
      { icon: '💡', text: 'On-site energy generation' },
      { icon: '📉', text: 'Reduced disposal costs' },
      { icon: '💰', text: 'New revenue from byproducts' },
    ],
    operational: [
      { icon: '⚙️', text: 'Integrated waste management' },
      { icon: '📈', text: 'Improved resource efficiency' },
      { icon: '🔄', text: 'Closed-loop systems' },
    ],
  },
  'waterways': {
    environmental: [
      { icon: '💧', text: 'Reduced nutrient pollution' },
      { icon: '🌊', text: 'Improved water quality' },
      { icon: '🐟', text: 'Better aquatic habitat' },
    ],
    economic: [
      { icon: '🎣', text: 'Preserved fishing resources' },
      { icon: '🏖️', text: 'Protected recreational value' },
      { icon: '💰', text: 'Avoided remediation costs' },
    ],
    operational: [
      { icon: '🌿', text: 'Healthier ecosystems' },
      { icon: '🦆', text: 'Biodiversity support' },
      { icon: '⚖️', text: 'Regulatory compliance' },
    ],
  },
  'anaerobic-digester': {
    environmental: [
      { icon: '♻️', text: 'Organic waste diversion' },
      { icon: '🌍', text: 'Methane capture and use' },
      { icon: '💧', text: 'Reduced water pollution' },
    ],
    economic: [
      { icon: '⚡', text: 'Biogas energy production' },
      { icon: '🌱', text: 'Digestate fertilizer value' },
      { icon: '📉', text: 'Lower disposal costs' },
    ],
    operational: [
      { icon: '🔄', text: 'Continuous processing' },
      { icon: '📊', text: 'Predictable outputs' },
      { icon: '🛠️', text: 'Established technology' },
    ],
  },
  'pyrolysis-unit': {
    environmental: [
      { icon: '🌍', text: 'Long-term carbon storage' },
      { icon: '♻️', text: 'Waste-to-resource conversion' },
      { icon: '💨', text: 'Reduced emissions vs. alternatives' },
    ],
    economic: [
      { icon: '💰', text: 'Multiple product streams' },
      { icon: '⚡', text: 'Energy from syngas' },
      { icon: '🧪', text: 'Bio-oil and biochar sales' },
    ],
    operational: [
      { icon: '🔥', text: 'Thermal processing efficiency' },
      { icon: '📦', text: 'Volume reduction' },
      { icon: '🔬', text: 'Customizable outputs' },
    ],
  },
};
'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SplitSankeyComparison } from '@/components/comparison/SplitSankeyComparison';
import { BenefitMetricsBar, COMPONENT_METRICS } from '@/components/comparison/BenefitMetricsBar';

// Import diagram data
import farmCurrentData from '@/data/diagrams/detail-farms-current.json';
import farmProposedData from '@/data/diagrams/detail-farms-proposed.json';
import chickenHouseCurrentData from '@/data/diagrams/detail-chicken-house-current.json';
import chickenHouseProposedData from '@/data/diagrams/detail-chicken-house-proposed.json';
import processingPlantCurrentData from '@/data/diagrams/detail-processing-plant-current.json';
import processingPlantProposedData from '@/data/diagrams/detail-processing-plant-proposed.json';
import waterwaysCurrentData from '@/data/diagrams/detail-waterways-current.json';
import waterwaysProposedData from '@/data/diagrams/detail-waterways-proposed.json';
import anaerobicDigesterProposedData from '@/data/diagrams/detail-anaerobic-digester-proposed.json';
import pyrolysisUnitProposedData from '@/data/diagrams/detail-pyrolysis-unit-proposed.json';

// Component configuration with diagram data
const COMPONENT_CONFIG = {
  'farm': {
    name: 'Farm Operations',
    icon: '/images/iconslibrary/farm-01.svg',
    description: 'Comprehensive overview of farm-level inputs and outputs, tracking feed, water, and energy consumption alongside waste generation.',
    currentDiagram: farmCurrentData,
    proposedDiagram: farmProposedData,
    hasCurrentSystem: true
  },
  'chicken-house': {
    name: 'Poultry Producer',
    icon: '/images/iconslibrary/chicken-house-01.svg',
    description: 'Detailed analysis of poultry producer operations, focusing on litter management, ammonia reduction, and bird health optimization.',
    currentDiagram: chickenHouseCurrentData,
    proposedDiagram: chickenHouseProposedData,
    hasCurrentSystem: true
  },
  'processing-plant': {
    name: 'Processing Plant',
    icon: '/images/iconslibrary/processing-plant-01.svg',
    description: 'Processing facility operations, managing offal, wastewater, and energy consumption while recovering value from processing byproducts.',
    currentDiagram: processingPlantCurrentData,
    proposedDiagram: processingPlantProposedData,
    hasCurrentSystem: true
  },
  'waterways': {
    name: 'Waterways',
    icon: '/images/iconslibrary/farm-waterways-01.svg',
    description: 'Impact analysis on local water systems, highlighting nutrient runoff reduction and water quality protection measures.',
    currentDiagram: waterwaysCurrentData,
    proposedDiagram: waterwaysProposedData,
    hasCurrentSystem: true
  },
  'anaerobic-digester': {
    name: 'Anaerobic Digester',
    icon: '/images/iconslibrary/anaerobic-digester-01.svg',
    description: 'Advanced waste treatment system converting organic matter into biogas for renewable energy and nutrient-rich digestate.',
    currentDiagram: null,
    proposedDiagram: anaerobicDigesterProposedData,
    hasCurrentSystem: false
  },
  'pyrolysis-unit': {
    name: 'Pyrolysis Unit',
    icon: '/images/iconslibrary/pyrolysis-unit-01.svg',
    description: 'Thermal conversion technology transforming poultry litter into stable biochar and renewable heat energy.',
    currentDiagram: null,
    proposedDiagram: pyrolysisUnitProposedData,
    hasCurrentSystem: false
  }
} as const;

type ComponentSlug = keyof typeof COMPONENT_CONFIG;

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

export default function ComponentDetailPage() {
  const params = useParams();
  const componentSlug = params.component as ComponentSlug;
  
  const config = COMPONENT_CONFIG[componentSlug];

  // Get diagram data from config (already imported)
  const currentDiagram = useMemo(() => {
    return config?.currentDiagram as DiagramData | null;
  }, [config]);

  const proposedDiagram = useMemo(() => {
    return config?.proposedDiagram as DiagramData;
  }, [config]);

  const benefits = COMPONENT_METRICS[componentSlug];

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 border border-destructive/20 bg-destructive/5">
          <h1 className="text-4xl font-bold text-destructive mb-4 uppercase tracking-wider">System Error</h1>
          <p className="text-muted-foreground mb-6 font-mono">COMPONENT_ID "{componentSlug}" NOT FOUND</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-mono text-sm"
          >
            <ArrowLeft size={20} />
            RETURN TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  if (!proposedDiagram) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 border border-destructive/20 bg-destructive/5">
          <h1 className="text-4xl font-bold text-destructive mb-4 uppercase tracking-wider">Data Error</h1>
          <p className="text-muted-foreground mb-6 font-mono">TELEMETRY DATA CORRUPTED</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-mono text-sm"
          >
            <ArrowLeft size={20} />
            RETURN TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50 w-full">
        <div className="w-full px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
                <div className="relative w-8 h-8">
                  <Image src={config.icon} alt="" fill className="object-contain" />
                </div>
                {config.name}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground font-light">
                a <span className="font-medium text-foreground">WasteHub</span> technology
              </span>
              <div className="h-8 w-px bg-border" />
              <Image
                src="/images/wastehub-logo.png"
                alt="WasteHub"
                width={160}
                height={48}
                className="h-10 w-auto"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full space-y-0">
        {/* Split Sankey Comparison */}
        <section className="w-full py-6 bg-secondary/30">
          <div className="w-full px-8">
             <SplitSankeyComparison
               currentDiagram={currentDiagram}
               proposedDiagram={proposedDiagram}
               componentName={config.name}
             />
          </div>
        </section>

        {/* Benefits Summary */}
        {benefits && (
          <section className="w-full py-12 px-8 bg-card border-t border-border">
            <div className="max-w-[1600px] mx-auto">
              <BenefitMetricsBar benefits={benefits} />
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="relative bg-slate-950 text-slate-50 w-full">
        <div className="w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Waste Hub <span className="text-primary font-light">Bioloop™</span>
              </h3>
              <p className="text-slate-500 text-sm">
                Contact Calvin Wohlert at <a href="mailto:Cwohlert@waste-hub.com" className="text-primary hover:text-emerald-400 transition-colors">Cwohlert@waste-hub.com</a>
              </p>
            </div>
            <a
              href="mailto:Cwohlert@waste-hub.com?subject=Bioloop Inquiry"
              className="bg-primary text-slate-950 font-bold px-6 py-2 hover:bg-emerald-400 transition-colors uppercase tracking-wider text-sm"
            >
              Contact Us
            </a>
          </div>
        </div>
        <div className="border-t border-slate-800 bg-slate-900/50 w-full">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
            <p className="text-xs text-slate-600 font-mono">
              © 2025 WASTE HUB SYSTEMS. ALL RIGHTS RESERVED.
            </p>
            <div className="text-xs text-slate-600 font-mono">
              {componentSlug.toUpperCase()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

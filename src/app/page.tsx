'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CircularSankeyHomepage } from '@/components/d3/CircularSankeyHomepage';

// Import the diagram data
import currentSystemData from '@/data/diagrams/system-overview-current.json';
import proposedSystemData from '@/data/diagrams/system-overview-proposed.json';

export default function HomePage() {
  const [showProposed, setShowProposed] = useState(false);
  // Track if we should animate the transition (only when switching TO proposed)
  const [animateTransition, setAnimateTransition] = useState(false);
  
  // Handle toggle with animation trigger
  const handleToggleToProposed = useCallback(() => {
    if (!showProposed) {
      // Switching to proposed - trigger animation and keep it on for pulse effect
      setAnimateTransition(true);
      setShowProposed(true);
      // Note: Don't reset animateTransition - let AD/Pyro pulse continue
    }
  }, [showProposed]);
  
  const handleToggleToCurrent = useCallback(() => {
    setAnimateTransition(false);
    setShowProposed(false);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm w-full">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">BiocharHub</h1>
            <span className="text-sm text-muted-foreground font-light">
              a <span className="font-medium text-foreground">WasteHub</span> technology
            </span>
            <div className="h-8 w-px bg-border ml-auto" />
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
      </header>

      {/* Main Content */}
      <main className="w-full space-y-0">
        {/* Hero Section */}
        <section className="w-full">
          <div className="relative h-[500px] overflow-hidden group">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src="/images/hero-biochar.jpg"
                alt="The Biochar Revolution"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {/* Technical Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
              <div className="absolute inset-0 bg-tech-grid opacity-20" />
            </div>

            {/* Content */}
            <div className="relative h-full max-w-[1440px] mx-auto flex items-center px-6 lg:px-12">
              <div className="max-w-3xl border-l-4 border-primary pl-8">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <span className="inline-block w-2 h-2 bg-primary animate-pulse" />
                  <span className="text-sm font-mono uppercase tracking-wider">Integrated Process Model</span>
                </div>
                <h2 className="text-6xl font-bold mb-4 text-white leading-none tracking-tight">
                  BIOCHAR<span className="text-primary">HUB</span>
                  <br />
                  <span className="text-3xl font-light text-slate-300">CIRCULAR SYSTEM VISUALIZATION</span>
                </h2>
                <p className="text-xl text-slate-300 max-w-xl border-t border-slate-700 pt-4 mt-4">
                  Integrated pyrolysis and anaerobic digestion for poultry operations. Explore how WasteHub&apos;s proprietary process converts organic waste streams into renewable energy, biochar co-products, and verified carbon credits—while improving bird health and feed conversion.
                </p>
              </div>
            </div>

            {/* WasteHub watermark */}
            <div className="absolute bottom-4 right-6 text-slate-400 text-xs font-mono tracking-widest">
              WASTEHUB TECHNOLOGIES // V2.0
            </div>
          </div>
          {/* Accent Bar */}
          <div className="w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
        </section>

        {/* Introduction Section - Compact */}
        <section className="w-full bg-gradient-to-b from-emerald-50/50 to-white">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-3 text-foreground">
                Turning Waste Into Value
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our circular system transforms poultry waste into valuable resources, closing the loop on agricultural byproducts.
              </p>
            </div>
            
            {/* Transformation Flow */}
            <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
              <div className="flex items-center gap-3 bg-white border border-border px-4 py-3 shadow-sm">
                <span className="text-2xl">🗑️</span>
                <span className="text-sm font-medium text-foreground">Poultry Waste</span>
              </div>
              <span className="text-2xl text-primary font-bold">→</span>
              <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-3 shadow-sm">
                <span className="text-2xl">⚡</span>
                <span className="text-sm font-medium text-foreground">Renewable Energy</span>
              </div>
              <span className="text-2xl text-primary font-bold hidden sm:inline">+</span>
              <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-3 shadow-sm">
                <span className="text-2xl">🌱</span>
                <span className="text-sm font-medium text-foreground">Biochar</span>
              </div>
              <span className="text-2xl text-primary font-bold hidden sm:inline">+</span>
              <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-3 shadow-sm">
                <span className="text-2xl">🌾</span>
                <span className="text-sm font-medium text-foreground">Fertilizer</span>
              </div>
            </div>

            {/* How to Use - Compact */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 flex items-center justify-center rounded-full text-primary font-bold text-xs">1</span>
                <span><strong>Toggle</strong> Current vs Proposed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 flex items-center justify-center rounded-full text-primary font-bold text-xs">2</span>
                <span><strong>Click</strong> icons to drill down</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 flex items-center justify-center rounded-full text-primary font-bold text-xs">3</span>
                <span><strong>Hover</strong> for details</span>
              </div>
            </div>
          </div>
        </section>

        {/* System Toggle & Diagram */}
        <section className="w-full bg-gradient-to-b from-slate-100 to-slate-50">
          <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8">
            <div className="bg-card border border-border shadow-lg">
            <div className="px-2 py-4">
              {/* Sankey Diagram with Toggle */}
              <div className="border border-border bg-white/50 backdrop-blur-sm shadow-inner">
                {/* Diagram Title Bar with Toggle */}
                <div className={`p-3 flex items-center justify-between border-b-2 transition-all duration-300 ${
                  showProposed
                    ? 'border-primary bg-primary/10'
                    : 'border-destructive bg-destructive/10'
                }`}>
                  {/* Title */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{showProposed ? '✨' : '⚠️'}</span>
                    <div>
                      <h2 className={`text-xl font-bold uppercase tracking-wide ${
                        showProposed ? 'text-primary' : 'text-destructive'
                      }`}>
                        {showProposed ? 'Proposed System' : 'Current System'}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {showProposed ? 'Biochar Circular Economy Model' : 'Linear Waste Model'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Buttons */}
                  <div className="flex bg-white border-2 border-gray-300 p-1 shadow-sm rounded-lg">
                    <button
                      onClick={handleToggleToCurrent}
                      className={`px-4 py-2 text-sm font-bold transition-all duration-200 flex items-center gap-2 rounded-md ${
                        !showProposed
                          ? 'bg-red-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span>⚠️</span>
                      Current
                    </button>
                    <button
                      onClick={handleToggleToProposed}
                      className={`px-4 py-2 text-sm font-bold transition-all duration-200 flex items-center gap-2 rounded-md ${
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

                {/* Diagram Container */}
                <div className="p-2">
                  <CircularSankeyHomepage
                    diagramData={showProposed ? proposedSystemData : currentSystemData}
                    width={1100}
                    height={600}
                    animateTransition={animateTransition}
                  />
                </div>

                {/* Legend */}
                <div className="border-t border-border bg-slate-50 p-4 flex justify-between items-center">
                  <div className="text-xs font-mono text-muted-foreground">
                    <span className="mr-4">LEGEND:</span>
                    <span className="mr-4">● NODES: COMPONENT SYSTEMS</span>
                    <span className="mr-4">〰 LINES: MASS FLOW</span>
                    <span className="mr-4">⟳ ANIMATION: DIRECTIONALITY</span>
                  </div>
                </div>
              </div>

              {/* Status Cards - Now below diagram */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* Current System Card */}
                <div className={`p-6 border transition-all ${
                  !showProposed
                    ? 'border-destructive/30 bg-destructive/5 ring-1 ring-destructive/20'
                    : 'border-border bg-secondary/10 opacity-60'
                }`}>
                  <h3 className="font-bold text-destructive mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-destructive" />
                    Current Practice Issues
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 bg-destructive/10 flex items-center justify-center text-destructive text-xs font-bold">!</span>
                      High ammonia emissions
                    </li>
                    <li className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 bg-destructive/10 flex items-center justify-center text-destructive text-xs font-bold">!</span>
                      Expensive waste disposal costs
                    </li>
                    <li className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 bg-destructive/10 flex items-center justify-center text-destructive text-xs font-bold">!</span>
                      Heavy fossil fuel dependency
                    </li>
                  </ul>
                </div>
                
                {/* Proposed System Card */}
                <div className={`p-6 border transition-all ${
                  showProposed
                    ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border bg-secondary/10 opacity-60'
                }`}>
                  <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary" />
                    Biochar System Benefits
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">✓</span>
                      Significant ammonia reduction
                    </li>
                    <li className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">✓</span>
                      Multiple new revenue streams
                    </li>
                    <li className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">✓</span>
                      More energy self-sufficient
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Key Benefits Section */}
        {showProposed && (
          <section className="w-full bg-white">
            {/* Top accent bar */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
              <div className="grid md:grid-cols-3 gap-8">
              {/* Environmental */}
              <div className="bg-card p-8 border border-border hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-2xl mb-6 text-primary group-hover:scale-110 transition-transform duration-300">🌍</div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Environmental Impact</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary mt-1.5" />
                    Net-negative carbon emissions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary mt-1.5" />
                    Significant reduction in water pollution
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary mt-1.5" />
                    Permanent carbon sequestration
                  </li>
                </ul>
              </div>

              {/* Economic */}
              <div className="bg-card p-8 border border-border hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center text-2xl mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">💰</div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Economic Benefits</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 mt-1.5" />
                    Carbon credit eligible
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 mt-1.5" />
                    Greater energy independence
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 mt-1.5" />
                    Reduce disposal costs
                  </li>
                </ul>
              </div>

              {/* Operational */}
              <div className="bg-card p-8 border border-border hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 bg-amber-500/10 flex items-center justify-center text-2xl mb-6 text-amber-600 group-hover:scale-110 transition-transform duration-300">⚡</div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Operational Gains</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 mt-1.5" />
                    Lower bird mortality rates
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 mt-1.5" />
                    Improved feed conversion
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 mt-1.5" />
                    Increased biogas production
                  </li>
                </ul>
              </div>
            </div>
            </div>
          </section>
        )}

      </main>

      {/* Call to Action Footer */}
      <footer className="relative bg-slate-950 text-slate-50 w-full">
        {/* Top accent bar */}
        <div className="w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-white">
                BiocharHub
              </h2>
              <p className="text-slate-400 mb-8 text-lg">
                Industrial-grade circular economy solutions. Transform liabilities into assets with our integrated pyrolysis and anaerobic digestion process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:Cwohlert@waste-hub.com?subject=BiocharHub Inquiry"
                  className="bg-primary text-slate-950 font-bold px-8 py-3 hover:bg-emerald-400 transition-colors uppercase tracking-wider text-sm text-center"
                >
                  Contact Us
                </a>
              </div>
              <p className="text-slate-500 text-sm mt-4">
                Contact Calvin Wohlert at <a href="mailto:Cwohlert@waste-hub.com" className="text-primary hover:text-emerald-400 transition-colors">Cwohlert@waste-hub.com</a>
              </p>
            </div>
            <div className="border-l border-slate-800 pl-12 hidden md:block">
               <div>
                 <h4 className="text-xs font-mono text-slate-500 uppercase mb-2">Core Technologies</h4>
                 <ul className="text-sm text-slate-300 space-y-2">
                   <li>Pyrolysis-Based Biochar Production</li>
                   <li>Anaerobic Digestion Integration</li>
                   <li>Renewable Energy Generation</li>
                   <li>Carbon Credit Verification</li>
                 </ul>
               </div>
            </div>
          </div>
        </div>
        
        {/* Copyright Bar */}
        <div className="border-t border-slate-800 bg-slate-900/50 w-full">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
            <p className="text-xs text-slate-600 font-mono">
              © 2025 WASTEHUB SYSTEMS. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-4 text-xs text-slate-600 font-mono">
              <span>PRIVACY PROTOCOL</span>
              <span>TERMS OF SERVICE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import IconTooltip from '@/components/ui/IconTooltip';

interface DiagramNode {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon: string;
  iconOnly?: boolean;
  showLabel?: boolean;
  fontSize?: number;
  labelOffset?: number;
}

interface DiagramLink {
  id: string;
  source: string;
  target: string;
  value: number;
  color: string;
  label?: string;
  labelPosition?: number; // 0-1 value for positioning label along the path (0.5 = center)
  animationFrequency?: number;
  animationRate?: number;
  animationSize?: number;
  particleIconSource?: string;
  particleIcon?: string;
  particleType?: string;
  returnY?: number; // Custom Y position for reverse/loopback connections
}

interface DiagramData {
  metadata?: {
    title: string;
    description: string;
    type: string;
    system: string;
  };
  nodes: DiagramNode[];
  links: DiagramLink[];
  config: {
    width: number;
    height: number;
    nodePadding?: number;
    nodeWidth?: number;
    circularLinkGap?: number;
  };
}

interface CircularSankeyHomepageProps {
  diagramData: DiagramData;
  width?: number;
  height?: number;
  enableNavigation?: boolean; // New prop to enable/disable click navigation
  instanceId?: string; // Unique ID to prevent DOM ID collisions when multiple diagrams exist
  animateTransition?: boolean; // New prop to enable staged reveal animation
}

// Animation phase type
interface AnimationPhase {
  nodes: string[];
  links: string[];
  delay: number;
  duration: number;
}

// Animation phase configuration for staged reveal
// Nodes and links are grouped by phase - each phase animates after the previous completes
const ANIMATION_PHASES: Record<string, AnimationPhase> = {
  // Phase 1: Anaerobic Digester appears first (the core new component)
  phase1: {
    nodes: ['anaerobic-digester'],
    links: [],
    delay: 0,
    duration: 800
  },
  // Phase 2: Connections TO the AD from existing components
  phase2: {
    nodes: [],
    links: ['link-house-to-ad', 'link-plant-to-ad'],
    delay: 600,
    duration: 600
  },
  // Phase 3: Pyrolysis unit appears
  phase3: {
    nodes: ['pyrolysis-unit'],
    links: [],
    delay: 400,
    duration: 800
  },
  // Phase 4: AD to Pyrolysis connection + House to Pyrolysis
  phase4: {
    nodes: [],
    links: ['link-ad-to-pyrolysis', 'link-house-to-pyrolysis'],
    delay: 400,
    duration: 600
  },
  // Phase 5: New output nodes appear
  phase5: {
    nodes: ['rng-output', 'co2-output', 'syngas-output', 'biochar-blend', 'node-1765493578436-0lnym20wl'],
    links: [],
    delay: 300,
    duration: 600
  },
  // Phase 6: All remaining new connections
  phase6: {
    nodes: [],
    links: ['link-ad-to-rng', 'link-ad-to-co2', 'link-pyrolysis-to-syngas', 'link-ad-to-blend', 'link-blend-to-farm'],
    delay: 300,
    duration: 600
  }
};

// Helper to determine which phase a node belongs to
function getNodePhase(nodeId: string): number | null {
  for (const [phaseName, phase] of Object.entries(ANIMATION_PHASES)) {
    if (phase.nodes.includes(nodeId)) {
      return parseInt(phaseName.replace('phase', ''));
    }
  }
  return null;
}

// Helper to determine which phase a link belongs to
function getLinkPhase(linkId: string): number | null {
  for (const [phaseName, phase] of Object.entries(ANIMATION_PHASES)) {
    if (phase.links.includes(linkId)) {
      return parseInt(phaseName.replace('phase', ''));
    }
  }
  return null;
}

// Calculate cumulative delay for a phase
function getPhaseStartTime(phaseNum: number): number {
  let totalDelay = 0;
  for (let i = 1; i < phaseNum; i++) {
    const phase = ANIMATION_PHASES[`phase${i}` as keyof typeof ANIMATION_PHASES];
    totalDelay += phase.delay + phase.duration;
  }
  const currentPhase = ANIMATION_PHASES[`phase${phaseNum}` as keyof typeof ANIMATION_PHASES];
  return totalDelay + (currentPhase?.delay || 0);
}

// Calculate total animation duration (for starting pulse after animation completes)
function getTotalAnimationDuration(): number {
  let total = 0;
  for (let i = 1; i <= 6; i++) {
    const phase = ANIMATION_PHASES[`phase${i}` as keyof typeof ANIMATION_PHASES];
    total += phase.delay + phase.duration;
  }
  return total;
}

// Pulse animation for AD and Pyrolysis nodes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function startPulseAnimation(selection: any, node: { x: number; y: number }) {
  function pulse() {
    selection
      .transition('pulse')
      .duration(1500)
      .ease(d3.easeSinInOut)
      .attr('transform', `translate(${node.x},${node.y}) scale(1.08)`)
      .transition('pulse')
      .duration(1500)
      .ease(d3.easeSinInOut)
      .attr('transform', `translate(${node.x},${node.y}) scale(1)`)
      .on('end', pulse);
  }
  pulse();
}

// Mapping of node IDs to component detail page slugs
const NODE_TO_COMPONENT_MAP: Record<string, string> = {
  'farm': 'farm',
  'farms': 'farm',
  'chicken-house': 'chicken-house',
  'chicken-houses': 'chicken-house',
  'processing-plant': 'processing-plant',
  'waterways': 'waterways',
  'farm-waterways': 'waterways',
  'anaerobic-digester': 'anaerobic-digester',
  'pyrolysis-unit': 'pyrolysis-unit',
  'pyrolysis': 'pyrolysis-unit'
};

export function CircularSankeyHomepage({
  diagramData,
  width: initialWidth = 850,
  height = 700,
  enableNavigation = true,
  instanceId = 'default',
  animateTransition = false
}: CircularSankeyHomepageProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initialWidth);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setWidth(entry.contentRect.width);
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  
  // Tooltip state
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipIconPath, setTooltipIconPath] = useState<string | undefined>();
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipContext, setTooltipContext] = useState<'current' | 'proposed'>('current');
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !diagramData) return;

    // Determine context from metadata
    const context = diagramData.metadata?.system === 'proposed' ? 'proposed' : 'current';
    setTooltipContext(context);
    
    // Check if this is the proposed system and animation is enabled
    const shouldAnimate = animateTransition && context === 'proposed';

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    
    // Create main group (centering will be applied after rendering)
    const g = svg.append('g')
      .attr('class', 'diagram-group');

    // Create node map for quick lookup
    const nodeMap = new Map(diagramData.nodes.map(node => [node.id, node]));

    // Generate link path (matching BuilderCanvas logic with circular support)
    const generateLinkPath = (link: DiagramLink, linkIndex: number, reverse = false): string => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
      
      if (!sourceNode || !targetNode) return '';

      const sx = sourceNode.x + sourceNode.width;
      const sy = sourceNode.y + sourceNode.height / 2;
      const tx = targetNode.x;
      const ty = targetNode.y + targetNode.height / 2;

      // Check if this is a reverse connection (target is left of source)
      const isReverse = tx < sx;
      
      if (isReverse) {
        // Calculate stagger to prevent overlaps - each link gets its own offset
        const stagger = linkIndex * 60; // Offset by 60px for each link
        const gap = 30; // Gap from nodes
        // Use custom returnY if provided, otherwise calculate staggered position
        const returnY = (link as any).returnY;
        const loopY = returnY !== undefined
          ? returnY
          : Math.max(sy, ty) + 100 + stagger;
        
        // Determine curve directions based on relative positions
        // Source side: curve toward loopY (up if source below loopY, down if above)
        const sourceCurveDir = sy < loopY ? 1 : -1;
        // Target side: curve toward target (up if target above loopY, down if below)
        const targetCurveDir = ty < loopY ? -1 : 1;
        
        // If reverse is true, generate path from target to source (for text)
        if (reverse) {
          return `
            M ${tx} ${ty}
            L ${tx - gap} ${ty}
            Q ${tx - gap - 20} ${ty} ${tx - gap - 20} ${ty - (20 * targetCurveDir)}
            L ${tx - gap - 20} ${loopY + (20 * targetCurveDir)}
            Q ${tx - gap - 20} ${loopY} ${tx - gap} ${loopY}
            L ${sx + gap} ${loopY}
            Q ${sx + gap + 20} ${loopY} ${sx + gap + 20} ${loopY - (20 * sourceCurveDir)}
            L ${sx + gap + 20} ${sy + (20 * sourceCurveDir)}
            Q ${sx + gap + 20} ${sy} ${sx + gap} ${sy}
            L ${sx} ${sy}
          `;
        }
        
        // Normal path from source to target
        return `
          M ${sx} ${sy}
          L ${sx + gap} ${sy}
          Q ${sx + gap + 20} ${sy} ${sx + gap + 20} ${sy + (20 * sourceCurveDir)}
          L ${sx + gap + 20} ${loopY - (20 * sourceCurveDir)}
          Q ${sx + gap + 20} ${loopY} ${sx + gap} ${loopY}
          L ${tx - gap} ${loopY}
          Q ${tx - gap - 20} ${loopY} ${tx - gap - 20} ${loopY + (20 * targetCurveDir)}
          L ${tx - gap - 20} ${ty - (20 * targetCurveDir)}
          Q ${tx - gap - 20} ${ty} ${tx - gap} ${ty}
          L ${tx} ${ty}
        `;
      }

      // Forward connection: use cubic Bezier curve for natural S-curves
      const midX = (sx + tx) / 2;
      return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
    };

    // Create defs for path references (for textPath)
    // Use instanceId to make IDs unique when multiple diagrams exist in DOM
    const defs = g.append('defs');
    diagramData.links.forEach((link, index) => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
      // Match builder logic: reverse if target is left of source's RIGHT edge (x + width)
      const isReverse = targetNode && sourceNode && targetNode.x < sourceNode.x + sourceNode.width;
      
      // Create normal path with unique ID
      defs.append('path')
        .attr('id', `link-path-${instanceId}-${link.id}`)
        .attr('d', generateLinkPath(link, index, false))
        .attr('fill', 'none');
      
      // Create reversed path for text on loopback connections
      if (isReverse) {
        defs.append('path')
          .attr('id', `link-path-${instanceId}-${link.id}-text`)
          .attr('d', generateLinkPath(link, index, true))
          .attr('fill', 'none');
      }
    });

    // Draw links
    const linksGroup = g.append('g').attr('class', 'links');
    
    diagramData.links.forEach((link, linkIndex) => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
      
      if (!sourceNode || !targetNode) return;

      const linkGroup = linksGroup.append('g');
      const path = generateLinkPath(link, linkIndex);
      
      // Check if this link should be animated
      const linkPhase = getLinkPhase(link.id);
      const isAnimatedLink = shouldAnimate && linkPhase !== null;
      
      // Calculate initial opacity based on animation state
      const baseOpacity = highlightedNode
        ? (highlightedNode === link.source || highlightedNode === link.target ? 0.8 : 0.1)
        : 0.6;
      const initialOpacity = isAnimatedLink ? 0 : baseOpacity;

      // Draw link path with proper width based on value
      const linkPath = linkGroup.append('path')
        .attr('d', path)
        .attr('stroke', link.color)
        .attr('stroke-width', link.value || 4) // Use link.value for width
        .attr('fill', 'none')
        .attr('opacity', initialOpacity)
        .attr('stroke-linecap', 'round')
        .attr('class', 'link-path') // Add class for selection
        .style('transition', 'opacity 0.3s ease');
      
      // Animate link if in animation mode
      if (isAnimatedLink && linkPhase) {
        const phaseConfig = ANIMATION_PHASES[`phase${linkPhase}` as keyof typeof ANIMATION_PHASES];
        const startTime = getPhaseStartTime(linkPhase);
        
        // Get path length for stroke animation
        const pathElement = linkPath.node() as SVGPathElement;
        const pathLength = pathElement?.getTotalLength() || 0;
        
        // Set up stroke-dasharray for drawing animation
        linkPath
          .attr('stroke-dasharray', pathLength)
          .attr('stroke-dashoffset', pathLength);
        
        // Animate the link drawing in
        linkPath.transition()
          .delay(startTime)
          .duration(phaseConfig.duration)
          .ease(d3.easeCubicOut)
          .attr('opacity', baseOpacity)
          .attr('stroke-dashoffset', 0);
      }

      // Add link label following the path
      if (link.label) {
        // Check if this is a reverse/loopback connection
        // Match builder logic: reverse if target is left of source's RIGHT edge (x + width)
        const isReverse = targetNode && sourceNode && targetNode.x < sourceNode.x + sourceNode.width;
        // Use reversed path for text on loopback connections to keep text upright
        // Include instanceId for unique reference
        const textPathId = isReverse ? `link-path-${instanceId}-${link.id}-text` : `link-path-${instanceId}-${link.id}`;
        
        // Use labelPosition from data (0-1 range), default to 0.5 (center)
        const labelOffset = `${((link.labelPosition ?? 0.5) * 100)}%`;
        
        linkGroup.append('text')
          .attr('font-size', '12')
          .attr('fill', '#374151')
          .attr('font-weight', '600')
          .attr('class', 'pointer-events-none select-none')
          .append('textPath')
          .attr('href', `#${textPathId}`)
          .attr('startOffset', labelOffset)
          .attr('text-anchor', 'middle')
          .style('paint-order', 'stroke')
          .style('stroke', 'white')
          .style('stroke-width', '3')
          .style('stroke-linejoin', 'round')
          .text(link.label);
      }

      // Store particle configuration for later initialization (after scaling)
      const particleCount = link.animationFrequency !== undefined ? link.animationFrequency : 3;
      const particleSize = link.animationSize || 4;
      const animationRate = link.animationRate || 3;
      const duration = (11 - animationRate) * 2;

      if (particleCount > 0) {
        const useIcon = link.particleIcon || (link.particleIconSource && link.particleIconSource !== 'dot');
        const iconPath = link.particleIcon || (useIcon ? link.particleIconSource : undefined);

        // Store configuration for particle initialization after scaling
        (link as any)._particleConfig = {
          count: particleCount,
          size: particleSize,
          duration,
          useIcon,
          iconPath,
          linkGroup
        };
      }
    });

    // Draw nodes
    const nodesGroup = g.append('g').attr('class', 'nodes');
    
    diagramData.nodes.forEach(node => {
      // Check if node is connected to highlighted node
      const isConnected = highlightedNode
        ? node.id === highlightedNode ||
          diagramData.links.some(l => (l.source === highlightedNode && l.target === node.id) || (l.target === highlightedNode && l.source === node.id))
        : true;
      
      // Check if this node should be animated
      const nodePhase = getNodePhase(node.id);
      const isAnimatedNode = shouldAnimate && nodePhase !== null;
      
      // Calculate initial opacity and scale
      const baseOpacity = isConnected ? 1 : 0.2;
      const initialOpacity = isAnimatedNode ? 0 : baseOpacity;
      const initialScale = isAnimatedNode ? 0.3 : 1;
      
      // Calculate center point for scale animation
      const centerX = node.x + node.width / 2;
      const centerY = node.y + node.height / 2;

      const nodeGroup = nodesGroup.append('g')
        .attr('class', 'node')
        .attr('transform', isAnimatedNode
          ? `translate(${centerX},${centerY}) scale(${initialScale}) translate(${-node.width/2},${-node.height/2})`
          : `translate(${node.x},${node.y})`)
        .attr('opacity', initialOpacity)
        .style('transition', 'opacity 0.3s ease');
      
      // Check if this node should pulse (AD and Pyrolysis in proposed system)
      const shouldPulseNode = shouldAnimate && (node.id === 'anaerobic-digester' || node.id === 'pyrolysis-unit');
      
      // Animate node if in animation mode
      if (isAnimatedNode && nodePhase) {
        const phaseConfig = ANIMATION_PHASES[`phase${nodePhase}` as keyof typeof ANIMATION_PHASES];
        const startTime = getPhaseStartTime(nodePhase);
        
        const transition = nodeGroup.transition()
          .delay(startTime)
          .duration(phaseConfig.duration)
          .ease(d3.easeBackOut.overshoot(1.2))
          .attr('transform', `translate(${node.x},${node.y})`)
          .attr('opacity', baseOpacity);
        
        // Start pulse animation after staged reveal completes for AD and Pyrolysis
        if (shouldPulseNode) {
          const totalAnimationTime = getTotalAnimationDuration();
          setTimeout(() => {
            startPulseAnimation(nodeGroup, node);
          }, totalAnimationTime + 500); // Start pulse 500ms after animation completes
        }
      }

      // Add icon
      nodeGroup.append('image')
        .attr('href', node.icon)
        .attr('xlink:href', node.icon) // Support xlink:href for compatibility
        .attr('width', node.width)
        .attr('height', node.height)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      // Add label if showLabel is true (matching BuilderCanvas logic)
      if (node.showLabel !== false) {
        // Split name by <br/> or <br> for multi-line support
        const lines = node.name.split(/<br\s*\/?>/i);
        const fontSize = node.fontSize || 12;
        const lineHeight = fontSize * 1.2;
        const labelOffset = node.labelOffset || 0; // User-adjustable offset (matches BuilderCanvas)
        // Position labels - matches BuilderCanvas logic exactly
        const yBase = node.iconOnly ? node.height : (node.icon ? node.height - 10 : node.height / 2);
        // Adjust y position to center multi-line text, plus user offset
        const yOffset = (lines.length > 1 ? -((lines.length - 1) * lineHeight) / 2 : 0) + labelOffset;
        
        const textGroup = nodeGroup.append('text')
          .attr('x', node.width / 2)
          .attr('y', yBase + yOffset)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#1f2937')
          .attr('font-size', fontSize)
          .attr('font-weight', '600')
          .attr('class', 'pointer-events-none select-none');

        lines.forEach((line, i) => {
          textGroup.append('tspan')
            .attr('x', node.width / 2)
            .attr('dy', i === 0 ? 0 : lineHeight)
            .text(line);
        });
      }

      // Add hover effects, tooltip, and click navigation
      nodeGroup
        .style('cursor', 'pointer')
        .on('mouseenter', function(event) {
          // Stop any pulsing animation on hover
          d3.select(this).interrupt('pulse');
          
          d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', `translate(${node.x},${node.y}) scale(1.15)`);
          
          setHighlightedNode(node.id);

          // Show tooltip
          if (node.icon) {
            setTooltipIconPath(node.icon);
            setTooltipPos({ x: event.clientX, y: event.clientY });
            setTooltipVisible(true);
          }
        })
        .on('mousemove', function(event) {
          if (tooltipVisible) {
            setTooltipPos({ x: event.clientX, y: event.clientY });
          }
        })
        .on('mouseleave', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', `translate(${node.x},${node.y}) scale(1)`);
          
          setHighlightedNode(null);

          // Hide tooltip
          setTooltipVisible(false);
          
          // Restart pulsing if this is a pulse node
          if (shouldPulseNode) {
            startPulseAnimation(d3.select(this), node);
          }
        })
        .on('click', function(event) {
          event.stopPropagation();
          
          // Only navigate if enableNavigation is true
          if (!enableNavigation) return;
          
          // Try to find a matching component slug from the node ID
          const nodeId = node.id.toLowerCase();
          const componentSlug = NODE_TO_COMPONENT_MAP[nodeId];
          
          if (componentSlug) {
            router.push(`/details/${componentSlug}`);
          } else {
            // Try partial matching for node IDs that contain component names
            for (const [key, slug] of Object.entries(NODE_TO_COMPONENT_MAP)) {
              if (nodeId.includes(key) || key.includes(nodeId)) {
                router.push(`/details/${slug}`);
                return;
              }
            }
            console.log(`No detail page found for node: ${node.id}`);
          }
        });
    });

    // Center and scale the diagram to fill available space
    // Force a re-calculation after a small delay to ensure particles don't mess up bbox initially
    // Actually, better to filter what we consider for bbox, but d3 getBBox is simple.
    // With particles initialized at startPoint (which is on the path), bbox should be correct.
    
    const bbox = g.node()?.getBBox();
    if (bbox) {
      // Calculate scale to fit within bounds with minimal padding
      const padding = 20; // Reduced padding for better fill
      const scaleX = (width - padding) / bbox.width;
      const scaleY = (height - padding) / bbox.height;
      const scale = Math.min(scaleX, scaleY) * 0.95; // Slight safety margin
      
      // Debug logging
      console.log('CircularSankeyHomepage scaling:', {
        width,
        height,
        bboxWidth: bbox.width,
        bboxHeight: bbox.height,
        scaleX,
        scaleY,
        finalScale: scale
      });
      
      // Calculate center position accounting for bbox offset
      const scaledWidth = bbox.width * scale;
      const scaledHeight = bbox.height * scale;
      const translateX = (width - scaledWidth) / 2 - bbox.x * scale;
      const translateY = (height - scaledHeight) / 2 - bbox.y * scale;
      
      g.attr('transform', `translate(${translateX},${translateY}) scale(${scale})`);
      
      // Now initialize particles AFTER scaling is applied
      diagramData.links.forEach((link) => {
        const config = (link as any)._particleConfig;
        if (!config) return;

        const { count, size, duration, useIcon, iconPath, linkGroup } = config;
        // Use instanceId for unique path element lookup
        const pathElement = document.getElementById(`link-path-${instanceId}-${link.id}`) as unknown as SVGPathElement;
        const pathLength = pathElement?.getTotalLength() || 0;
        const startPoint = pathElement?.getPointAtLength(0) || { x: 0, y: 0 };

        for (let i = 0; i < count; i++) {
          const delay = (i / count) * duration;
          
          if (useIcon && iconPath) {
            const icon = linkGroup.append('image')
              .attr('href', iconPath)
              .attr('xlink:href', iconPath)
              .attr('width', size * 4)
              .attr('height', size * 4)
              .attr('x', -size * 2)
              .attr('y', -size * 2)
              .attr('transform', `translate(${startPoint.x}, ${startPoint.y})`)
              .attr('opacity', highlightedNode
                ? (highlightedNode === link.source || highlightedNode === link.target ? 1 : 0.1)
                : 0.8)
              .attr('class', 'link-particle')
              .style('transition', 'opacity 0.3s ease');

            function animateIcon() {
              icon.transition()
                .duration(duration * 1000)
                .ease(d3.easeLinear)
                .delay(delay * 1000)
                .attrTween('transform', function() {
                  return function(t: number) {
                    if (!pathElement) return `translate(0,0)`;
                    const point = pathElement.getPointAtLength(t * pathLength);
                    return `translate(${point.x},${point.y})`;
                  };
                })
                .on('end', animateIcon);
            }
            animateIcon();
          } else {
            const circle = linkGroup.append('circle')
              .attr('r', size)
              .attr('fill', link.color)
              .attr('transform', `translate(${startPoint.x}, ${startPoint.y})`)
              .attr('opacity', highlightedNode
                ? (highlightedNode === link.source || highlightedNode === link.target ? 1 : 0.1)
                : 0.8)
              .attr('class', 'link-particle')
              .style('transition', 'opacity 0.3s ease');

            function animate() {
              circle.transition()
                .duration(duration * 1000)
                .ease(d3.easeLinear)
                .delay(delay * 1000)
                .attrTween('transform', function() {
                  return function(t: number) {
                    if (!pathElement) return `translate(0,0)`;
                    const point = pathElement.getPointAtLength(t * pathLength);
                    return `translate(${point.x},${point.y})`;
                  };
                })
                .on('end', animate);
            }
            animate();
          }
        }
      });
    }

  // Removed highlightedNode from dependency array to prevent full re-render on hover
  // Highlighting is now handled directly in the event handlers via D3
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagramData, width, height, animateTransition]);

  return (
    <div ref={containerRef} className="w-full relative" style={{ height: `${height}px` }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full"
        style={{ background: 'transparent' }}
      />
      
      {/* Tooltip */}
      <IconTooltip
        iconPath={tooltipIconPath}
        context={tooltipContext}
        x={tooltipPos.x}
        y={tooltipPos.y}
        visible={tooltipVisible}
      />
    </div>
  );
}

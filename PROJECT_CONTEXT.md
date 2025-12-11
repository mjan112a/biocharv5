# Biochar Website v5 - Project Context for LLMs

## Project Overview
A Next.js 14 web application showcasing WasteHub's biochar circular economy technology. The site visualizes complex material flows using interactive D3.js Sankey diagrams, comparing current linear waste systems with proposed circular economy models.

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with theme variables
- **Visualization**: D3.js for Sankey diagrams with animated particle flows
- **Repository**: https://github.com/mjan112a/biocharv5.git

## Key Architecture Concepts

### 1. Diagram Data Structure
Diagrams are defined in JSON files under `src/data/diagrams/`. Each diagram has:
```typescript
interface DiagramData {
  metadata: {
    title: string;
    description: string;
    type: string;           // "overview" | "detail"
    system: string;         // "current" | "proposed" - CRITICAL for tooltip context
  };
  nodes: DiagramNode[];     // Icons with x, y positions
  links: DiagramLink[];     // Connections with flow animations
  config: {
    width: number;          // NOTE: May not match actual content bounds
    height: number;
    nodePadding?: number;
    nodeWidth?: number;
  };
}
```

### 2. Circular Links (Return Flows)
Links can have `returnY` property for circular flows that loop back:
```typescript
interface DiagramLink {
  returnY?: number;  // Y coordinate for the return path loop
  // ... other properties
}
```
These create paths that go: source → right → down/up to returnY → left → target

### 3. Tooltip System
Tooltips are context-aware based on `metadata.system`:
- **Current system**: Shows problems, issues with existing approach
- **Proposed system**: Shows benefits, improvements, how it works
- Data source: `public/data/icon-tooltips.json`
- Component: `src/components/ui/IconTooltip.tsx`

### 4. DOM ID Collision Prevention
When multiple diagrams exist on same page (e.g., SplitSankeyComparison), use `instanceId` prop:
```tsx
<CircularSankeyHomepage instanceId="current" />
<CircularSankeyHomepage instanceId="proposed" />
```
Path IDs become: `link-path-${instanceId}-${link.id}`

## File Structure

### Pages
- `src/app/page.tsx` - Homepage with system overview diagrams
- `src/app/details/[component]/page.tsx` - Component detail pages

### Key Components
- `src/components/d3/CircularSankeyHomepage.tsx` - Main Sankey visualization
- `src/components/comparison/SplitSankeyComparison.tsx` - Toggle between current/proposed
- `src/components/comparison/BenefitMetricsBar.tsx` - Benefits display cards
- `src/components/ui/IconTooltip.tsx` - Rich tooltip component

### Data Files
- `src/data/diagrams/system-overview-current.json` - Homepage current system
- `src/data/diagrams/system-overview-proposed.json` - Homepage proposed system
- `src/data/diagrams/detail-*.json` - Component-specific diagrams
- `public/data/icon-tooltips.json` - Tooltip content per icon

## Current UI/UX Decisions

### Header
- TitleDropdown (select diagram) → "a WasteHub technology" text → WasteHub logo

### Footer
- Contact: Calvin Wohlert (Cwohlert@waste-hub.com)
- No compliance/certification claims (removed fake EPA/ISO badges)

### Tooltip Positioning
- Right-side icons: tooltip at far LEFT of viewport
- Bottom icons (y > 60% viewport): tooltip positioned ABOVE cursor
- Other icons: tooltip to right of cursor, vertically centered

### Benefits Cards
- Unified white backgrounds with green left accent bars
- Categories: Environmental, Economic, Operational Potential
- Uses icons for visual differentiation, not colored backgrounds

### Diagram Container
- Max-width: 1600px
- Reduced padding: `px-4 lg:px-6 py-8`
- Card padding: `px-2 py-4`
- Diagram dimensions: Fixed width/height (viewBox scaling was attempted but reverted)

## Known Issues / Future Considerations

### Diagram Sizing
The diagram content uses absolute pixel coordinates from JSON. The SVG `viewBox` approach was attempted but caused visual issues. Current solution: fixed dimensions that may not perfectly fill container.

Options for future:
1. Manually edit JSON coordinates for wider layout
2. Apply CSS transform scale (affects click coordinates)
3. Revisit viewBox with better bounds calculation

### Node Coordinates
Diagram node positions are absolute (e.g., x: 160, y: 348). The `config.width/height` in JSON may not match actual content bounds. Waterways node extends to ~1034px while config.width is 950px.

## Component Detail Pages
Supported components:
- `farm` - Farm Operations
- `chicken-house` - Poultry Producer
- `processing-plant` - Processing Plant
- `waterways` - Waterways
- `anaerobic-digester` - Anaerobic Digester (proposed only)
- `pyrolysis-unit` - Pyrolysis Unit (proposed only)

Components without current system (new in proposed): anaerobic-digester, pyrolysis-unit

## Animation System
Links can have particle animations:
```typescript
interface DiagramLink {
  animationFrequency?: number;  // How often particles spawn
  animationRate?: number;       // Speed of particle movement
  animationSize?: number;       // Particle size
  particleType?: string;        // "icon" for SVG icons, "dot" for circles
  particleIcon?: string;        // Path to SVG icon for particles
}
```

## Branding Colors
- Primary green: `#059669` / `green-600`
- Destructive red: `#EF4444` / `red-500`
- Background gradients: `slate-100` → `slate-50`
- Card backgrounds: White with subtle gray borders
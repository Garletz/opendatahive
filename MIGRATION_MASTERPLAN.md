# Babylon.js to Three.js Migration Master Plan

## 1. Feature Analysis (Current State)

### Core Engine
- **Engine**: Babylon.js 5.x `Engine` + `Scene`.
- **Camera**: `ArcRotateCamera` with custom Panning projection on Z=0 plane.
- **Coordinates**: Axial (U,V) mapped to Cartesian (X,Y) via `HexDefinition`.
- **Lighting**: PointLight + Ambient.

### The Grid (`InverseGridContext`)
- **Structure**: `SolidParticleSystem` (SPS) instancing a cylinder ~3000 times.
- **Visuals**: "Inverse" look (filled hexes with gaps). Flat cylinders (Z scale 0.01).
- **Animation**:
  - **Pulse**: Global sine wave on opacity/color.
  - **Elevation**: Sine wave on Z-scale based on coordinate variance.
  - **Infinite Scroll**: The grid mesh physically moves (snaps) to the camera's center hex to mimic infinite terrain.
- **Overrides**: Ability to programmatically color/extrude specific hexes (used by AI Chat).

### Items (Octos & Nodes)
- **Mesh Factory Pattern**: Different geometry/color per file type.
  - MD: Blue
  - Audio: Pink
  - Data: Green
  - Generic: Yellow Hexagon
- **Interaction**:
  - **Hover**: Scale up (1.1x).
  - **Selection**: Scale up (1.3x) + State flag.
  - **Movement**: "Teleport" style. Click Octo (Select) -> Click Empty Grid (Move).

---

## 2. Migration Architecture (Target State)

### Core Stack
- **Library**: `React Three Fiber` (R3F) + `@react-three/drei`.
- **Camera**: `MapControls` (Orthographic-like perspective, pan on plane). Z-Up configuration.
- **State**: React `useState` / `useRef` loops instead of imperative observers.

### The Grid (`ThreeHexGrid`)
- **Implementation**: `InstancedMesh` (Matches SPS performance).
- **Infinite Logic**: `useFrame` hook calculating `camera.position` -> `hexRound` -> `mesh.position`.
- **Shader**: Custom `ShaderMaterial` or `onBeforeCompile` for high-performance Pulse effect (avoiding CPU overhead).

### The Items (`OctoRenderer`)
- **Implementation**: React Components mapped from Arrays.
- **Performance**: `InstancedMesh` for identical items, or individual Groups for interactive ones (Octos are few enough for Groups).
- **Movement Logic**: Replicate the "Select -> Click Cell" workflow.

---

## 3. Implementation Steps

1.  **Scaffold**: Create `src/hexmap/three` directory structure.
2.  **Grid Component**: Implement `HexGrid.tsx` with `InstancedMesh` and Snapping Logic.
3.  **Renderer Component**: Implement `OctoRenderer.tsx` with visual differentiation (Sphere/Cylinder/Color).
4.  **Main View**: Implement `ThreeHexMap.tsx` wrapping the Canvas.
5.  **Integration**: Update `Map.tsx` (the wrapper) to switch engines while keeping UI.

## 4. Verification Checklist
- [ ] Grid looks "Infinite" (snaps to camera).
- [ ] Grid Pulses (visual effect).
- [ ] Octos appear at correct U/V coordinates.
- [ ] Clicking an Octo selects it (Visual feedback).
- [ ] Clicking a Grid cell while selected moves the Octo.
- [ ] Performance is 60fps+.

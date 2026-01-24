# Babylon.js to Three.js Migration: Functional Mapping

This document outlines the strict functional mapping for migrating the Hive Engine from Babylon.js to React Three Fiber (R3F). The goal is to replicate logic 1:1.

## 1. Core Engine & Camera

| Feature | Babylon.js Implementation | Three.js / R3F Equivalent | Implementation Detail |
| :--- | :--- | :--- | :--- |
| **Coordinate System** | `HexDefinition.ts` (Maths) | `HexDefinition.ts` (Shared) | Reuse existing math class. Configure Three.js camera to **Z-UP** (`up={[0,0,1]}`). |
| **Camera Type** | `ArcRotateCamera` | `MapControls` (Orthographic-like) | Configure `MapControls` to lock panning to the Z=0 plane (`screenSpacePanning={false}`). |
| **Zoom/Pan Limits** | `lowerRadius`, `upperRadius` in `HexBoard.ts` | `minDistance`, `maxDistance` in `MapControls` | Port strict values: Min 50, Max 3000. |

## 2. The Grid (InverseGridContext)

| Feature | Babylon.js Implementation | Three.js / R3F Equivalent | Implementation Detail |
| :--- | :--- | :--- | :--- |
| **Infinite Illusion** | `GridContext.updatePosition()`: Teleports grid mesh to camera's center hex. | `useFrame`: Snap `group.position` to camera center. | **Copy Logic**: `newPos = centerHex * hexWidth`. This ensures the grid pattern never "slides", it steps. |
| **Visual Structure** | `SolidParticleSystem` (Cylinders). | `InstancedMesh` (Cylinders). | Use `CylinderGeometry(radius, radius, height, 6)` rotated X 90°. |
| **Pulse Effect** | CPU Loop in `GridContext.ts` updating particle colors. | Custom **ShaderMaterial**. | Inject the exact mathematical sine wave formula into the fragment shader for 60FPS performance. |
| **Hex Overrides** | `hexOverrides` Map (color/height per U,V). | `InstancedAttribute` (Color/Scale). | Use `instanceColor` buffer to allow specific cells (AI drawn paths) to change color. |

## 3. Items (Octos & Nodes)

| Feature | Babylon.js Implementation | Three.js / R3F Equivalent | Implementation Detail |
| :--- | :--- | :--- | :--- |
| **File Type Logic** | `Map.tsx` huge `itemMap` switch statement. | `<OctoMesh />` Component props. | Port the logic: `if (md) color=Blue`, `if (mp3) color=Pink`, etc. strictly. |
| **Hover Effect** | `ActionManager.OnPointerOver` -> `mesh.scaling = 1.1` | `onPointerOver` -> `useSpring({ scale: 1.1 })` | Use React Spring for smoother but identical visual feedback. |
| **Selection** | `ActionManager.OnPick` -> `mesh.scaling = 1.3` | `onClick` -> `useState(selected)` | Clicking toggles "Selected" state. |
| **Labels** | Babylon GUI (Textblock). | `@react-three/drei/Html`. | Render HTML labels floating above the mesh for better text readability. |

## 4. Interaction Logic (Map.tsx)

| Feature | Babylon.js Implementation | Three.js / R3F Equivalent | Implementation Detail |
| :--- | :--- | :--- | :--- |
| **Move Item** | 1. Select Octo.<br>2. Click Empty Hex.<br>3. `addObjectAtPosition` / `updatePosition`. | 1. `onClick` (Octo) sets State.<br>2. `onClick` (Grid) triggers callback.<br>3. Parent updates data. | Preserve the **Two-Step** interaction (Click-Click), do NOT switch to Drag&Drop yet to keep strict parity. |
| **Raycasting** | `scene.pick` on `ZeroPlane`. | `useThree().raycaster` on invisible Plane. | Use a massive invisible `PlaneGeometry` at Z=0 to capture mouse coordinates for the Grid. |

## 5. Directory Structure (v2)

```text
src/hexmap/v2/
├── Core/
│   ├── HiveEngine.tsx      <-- The <Canvas> wrapper
│   └── CameraController.tsx <-- Wrapper for Controls
├── Grid/
│   ├── InfiniteGrid.tsx    <-- The Hex Grid logic
│   └── GridShader.ts       <-- The Pulse/Color logic
├── Items/
│   ├── OctoMesh.tsx        <-- The Octo visual
│   └── NodeMesh.tsx        <-- The Project Node visual
└── Utils/
    └── HexMath.ts          <-- (Imported from legacy or local helper)
```

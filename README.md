# OpenDataHive - 3D Hexagonal Grid Visualization Framework

> A powerful spatial interface framework for organizing and visualizing data in immersive 3D hexagonal grids. Built with React, Three.js, and Babylon.js.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.182-black.svg)](https://threejs.org/)
[![Babylon.js](https://img.shields.io/badge/Babylon.js-7.54-red.svg)](https://www.babylonjs.com/)

---

## Overview

**OpenDataHive** is a production-ready 3D hexagonal grid visualization framework designed for modern web applications. It provides developers with a robust spatial interface system for building interactive data exploration tools, project management applications, and immersive user experiences.

### Core Use Cases

- **Spatial Project Management** - Organize projects and resources in 3D workspace environments
- **Data Visualization Platforms** - Display complex datasets with intuitive hexagonal layouts
- **Interactive Mapping** - Build custom spatial interfaces and navigation systems
- **Game Development** - Create hex-based strategy games and tactical interfaces
- **Educational Tools** - Teach spatial reasoning and coordinate system concepts

---

## Screenshots
<img width="2560" height="1600" alt="localhost_3000_(Nest Hub Max) (2)" src="https://github.com/user-attachments/assets/5d932348-d341-4f53-a8c1-e81a37821e09" />
<img width="2560" height="1600" alt="opendatahive com_(Nest Hub Max)" src="https://github.com/user-attachments/assets/55eddb77-4e09-489e-809a-26656469bf90" />
<img width="2560" height="1600" alt="localhost_3000_(Nest Hub Max)" src="https://github.com/user-attachments/assets/f99512de-d87d-4aab-9a07-30bd1519bf1f" />
<img width="2560" height="1600" alt="localhost_3000_(Nest Hub Max) (1)" src="https://github.com/user-attachments/assets/c4ce5948-88a5-4f82-9ea7-10087146a946" />


---

## Key Features

### Dual Rendering Engine Architecture

- **Three.js (React Three Fiber)** - Modern, performant WebGL rendering with declarative React components
- **Babylon.js** - Enterprise-grade 3D engine with advanced features and broad compatibility
- **Runtime Engine Switching** - Toggle between engines without page reload for A/B testing and fallback support

### Advanced Hexagonal Grid System

- **Infinite Scrolling** - Seamlessly navigate unlimited grid space with automatic culling
- **Spiral Layout Algorithm** - Optimal automatic positioning for data objects
- **Honeycomb Coordinates** - Industry-standard axial coordinate system (honeycomb-grid library)
- **Distance-Based Fade** - Horizon fade effect for depth perception and performance

### Professional Camera Controls

- **6-DOF Movement** - Pan, tilt, spin, and zoom with smooth interpolation
- **Keyboard Navigation** - Full WASD + arrow key support with customizable bindings
- **Mouse Interaction** - Drag to pan, wheel to zoom, context-aware controls
- **Rotation Adaptation** - Pan direction automatically adjusts to camera orientation

### Rich Data Visualization

- **Octo Objects** - 3D hexagonal containers for data with customizable appearance
- **File Type Detection** - Automatic color coding for 12+ file formats (JSON, CSV, PDF, etc.)
- **Z-Index Layering** - Intelligent stacking for overlapping objects
- **HTML Label System** - Billboard labels that always face the camera

### Modern Technology Stack

- **React 19** - Latest React features with concurrent rendering
- **TypeScript 5.6+** - Full type safety and IntelliSense support
- **Tailwind CSS 3.4** - Utility-first styling framework
- **Firebase 11.9** - Authentication and real-time database
- **GunDB** - Optional decentralized P2P synchronization
- **Vite 7.0** - Lightning-fast build tool and dev server

---

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone repository
git clone https://github.com/Garletz/opendatahive.git
cd opendatahive

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npm run dev
```

Navigate to `http://localhost:3000` to see the application.

---

## Project Structure

```
src/
├── hexmap/                 # Core hexagonal grid engine
│   ├── core/              # Babylon.js implementation
│   │   ├── engine/        # HexBoard, camera controls
│   │   └── grid/          # Grid rendering and particle systems
│   ├── three/             # Three.js (R3F) implementation
│   │   ├── core/          # HiveCamera, ThreeEngine
│   │   ├── grid/          # InfiniteGrid component
│   │   └── meshes/        # OctoRenderer, custom geometries
│   ├── shared/            # Shared utilities
│   │   └── utils/         # Hex math, coordinate conversion
│   └── components/        # React components (Map, controls)
├── components/            # UI components
│   ├── auth/             # Authentication
│   ├── modals/           # Modal dialogs
│   └── layout/           # Layout components
├── context/              # React Context providers
├── types/                # TypeScript definitions
└── utils/                # Utility functions
```

---

## Usage Examples

### Basic Hexagonal Map

```tsx
import { Map } from './hexmap/components/Map';

function App() {
  const data = [
    { id: '1', u: 0, v: 0, type: 'json', title: 'config.json' },
    { id: '2', u: 1, v: 0, type: 'pdf', title: 'report.pdf' },
    { id: '3', u: 0, v: 1, type: 'csv', title: 'data.csv' }
  ];

  return (
    <Map
      octos={data}
      viewMode="public"
      onOctoClick={(octo) => console.log('Clicked:', octo)}
      backgroundColor="#000000"
      gridColor="#808080"
    />
  );
}
```

### Switching Render Engines

```tsx
// Use Three.js engine
<Map useThreeJs={true} {...props} />

// Use Babylon.js engine (default)
<Map useThreeJs={false} {...props} />
```

### Custom Hex Grid Configuration

```typescript
import HexDefinition from './hexmap/shared/utils/cartesian-hexagonal';

const hexDimensions = new HexDefinition(
  55,   // Hex size in pixels
  1,    // Spacing multiplier
  0,    // U offset
  3     // V offset
);
```

---

## API Reference

### Map Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `octos` | `OctoType[]` | `[]` | Array of data objects to visualize |
| `viewMode` | `'public' \| 'personal' \| 'all-users' \| 'chat'` | `'public'` | Display mode |
| `onOctoClick` | `(octo: OctoType) => void` | - | Click event handler |
| `backgroundColor` | `string` | `'#000000'` | Scene background color |
| `gridColor` | `string` | `'#808080'` | Hexagonal grid line color |
| `pulseEnabled` | `boolean` | `false` | Enable grid pulse animation |
| `useThreeJs` | `boolean` | `false` | Use Three.js instead of Babylon.js |

### Global Camera API

```typescript
// Access via window object
window.__hiveCamera.setMode('pan' | 'tilt' | 'spin' | 'zoom');
window.__hiveCamera.resetRotation();
```

### Keyboard Shortcuts

- **WASD / Arrow Keys** - Pan camera
- **+/-** - Zoom in/out
- **H** - Toggle help
- **R** - Reset rotation
- **1-4** - Switch camera modes (pan/tilt/spin/zoom)

---

## Advanced Configuration

### Custom Color Schemes

```tsx
<Map
  backgroundColor="#0a0a0a"
  gridColor="#4a5568"
  pulseEnabled={true}
/>
```

### File Type Customization

Edit `src/hexmap/three/meshes/OctoMesh.tsx` or `src/hexmap/core/meshes/OctoMeshFactory.ts`:

```typescript
const FILE_TYPE_COLORS = {
  json: '#FFD600',
  csv: '#4CAF50',
  pdf: '#F44336',
  // Add custom types...
};
```

---

## Development

### Available Scripts

```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

### Technology Stack

**Frontend**
- React 19.1+ with TypeScript 5.6+
- Three.js 0.182 + React Three Fiber 9.5
- Babylon.js 7.54
- Framer Motion 11.18 for animations

**3D & Spatial**
- Honeycomb-grid 4.1.5 (hexagonal mathematics)
- React Three Drei (R3F helpers)
- React Three Postprocessing (effects)

**Backend & Data**
- Firebase 11.9 (Authentication, Firestore)
- GunDB 0.2020 (decentralized sync)

**Build & Tooling**
- Vite 7.0
- Tailwind CSS 3.4
- PostCSS + Autoprefixer

---

## Documentation

- **[Architecture Guide](./ARCHITECTURE.md)** - System design and technical decisions
- **[Project Hive Concept](./PROJECT_HIVE_CONCEPT.md)** - Vision and roadmap
- **[Migration Guide](./MIGRATION_MAPPING.md)** - Babylon to Three.js migration reference
- **[Changelog](./CHANGELOG.md)** - Version history and updates

---

## Contributing

Contributions are welcome! OpenDataHive is designed as a reusable framework for spatial interfaces.

### Contribution Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards

- Follow existing TypeScript and ESLint conventions
- Add JSDoc comments for public APIs
- Include unit tests for new features
- Update documentation as needed

---

## Community Projects

OpenDataHive is used as the foundation for various spatial data visualization projects:

- Interactive geographic data mapping
- 3D spatial dashboards and analytics
- Hex-based strategy game prototypes
- Collaborative workspace organizers

*Using OpenDataHive in your project? Open an issue to get featured here.*

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **honeycomb-grid** - Hexagonal coordinate mathematics
- **Three.js** and **React Three Fiber** communities
- **Babylon.js** development team
- All open-source contributors

---

## Support

- **Issues**: [GitHub Issues](https://github.com/Garletz/opendatahive/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Garletz/opendatahive/discussions)

---

**Keywords**: hexagonal grid, hex map, 3D visualization, spatial data, React Three Fiber, Babylon.js, Three.js, data visualization framework, honeycomb grid, hexagonal coordinates, spatial interface, immersive data, TypeScript, WebGL

---

<div align="center">

**Star this repository if you find it useful**

Made by the OpenDataHive Team

</div>

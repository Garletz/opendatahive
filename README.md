# 🌐 OpenDataHive - 3D Hexagonal Grid Framework for Data Visualization

> **Transform your data into an immersive 3D spatial experience** with our powerful hexagonal grid visualization framework. Perfect for project management, data exploration, and creating interactive spatial interfaces.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.182-black.svg)](https://threejs.org/)
[![Babylon.js](https://img.shields.io/badge/Babylon.js-7.54-red.svg)](https://www.babylonjs.com/)

---

## 🎯 What is OpenDataHive?

**OpenDataHive** is a cutting-edge **3D hexagonal grid visualization framework** built for modern web applications. It provides an intuitive spatial interface for organizing, visualizing, and interacting with data in three-dimensional space.

### 🌟 Perfect For:
- 🗂️ **Spatial Project Management** - Organize projects in an immersive 3D workspace
- 📊 **Data Visualization** - Display complex datasets on an interactive hexagonal grid
- 🎮 **Game Development** - Hex-based game maps and strategic interfaces
- 🏗️ **Architecture & Design** - Spatial planning and layout visualization
- 🤖 **AI-Powered Interfaces** - Context-aware spatial organization systems

---

## 🚀 Key Features

### **Dual Rendering Engine**
- ⚡ **Three.js (React Three Fiber)** - Modern, performant 3D rendering
- 🏺 **Babylon.js** - Robust fallback with advanced features
- 🔄 **Real-time Engine Switching** - Toggle between engines on-the-fly

### **Hexagonal Grid System**
- 🔷 **Infinite Scrolling Grid** - Seamlessly pan across unlimited space
- 🌀 **Spiral Layout Algorithm** - Automatic positioning for optimal spacing
- 📐 **Honeycomb Coordinate System** - Industry-standard hexagonal math
- ✨ **Alpha Fade Effect** - Beautiful horizon fade for depth perception

### **Interactive Camera Controls**
- 🎥 **Pan, Tilt, Spin, Zoom** - Intuitive 6-DOF camera movement
- ⌨️  **Keyboard Shortcuts** - WASD navigation, R to reset
- 🖱️ **Mouse Controls** - Drag to pan, wheel to zoom
- 🔄 **Rotation-Aware** - Pan direction adapts to camera orientation

### **Data Visualization**
- 📦 **Octo Objects** - 3D hexagonal data containers
- 🎨 **File Type Colors** - Automatic color coding (JSON, CSV, PDF, etc.)
- 📊 **Z-Stacking** - Layer management for overlapping items
- 🏷️ **HTML Labels** - Readable, always-facing text annotations

### **Modern Tech Stack**
- ⚛️ **React 19** - Latest React with concurrent features
- 📘 **TypeScript** - Full type safety
- 🎨 **Tailwind CSS** - Utility-first styling
- 🔥 **Firebase** - Authentication and real-time database
- 🔫 **GunDB** - Decentralized data synchronization

---

## 📦 Installation

### Prerequisites
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/opendatahive.git
cd opendatahive

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see OpenDataHive in action! 🎉

---

## 🏗️ Project Structure

```
src/
├── hexmap/              # 🎯 Core hexagonal grid engine
│   ├── core/           # Babylon.js implementation
│   ├── three/          # Three.js (R3F) implementation
│   ├── shared/         # Shared utilities (coordinates, hex math)
│   └── components/     # React components (Map, Grid)
├── components/          # 🧩 UI components
│   ├── auth/           # Authentication components
│   ├── modals/         # Modal dialogs
│   └── layout/         # Layout components
├── context/            # 🔌 React Context providers
├── types/              # 📘 TypeScript definitions
└── utils/              # 🛠️ Utility functions
```

---

## 💡 Usage Examples

### Basic Hexagonal Map

```tsx
import { Map } from './hexmap/components/Map';

function App() {
  return (
    <Map
      octos={yourDataArray}
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
// Toggle between Three.js and Babylon.js
<Map
  useThreeJs={true}  // false for Babylon.js
  {...props}
/>
```

### Custom Data Visualization

```tsx
const myData = [
  { id: '1', u: 0, v: 0, type: 'json', title: 'Config' },
  { id: '2', u: 1, v: 0, type: 'pdf', title: 'Report' },
  { id: '3', u: 0, v: 1, type: 'csv', title: 'Data' }
];

<Map octos={myData} onOctoClick={handleClick} />
```

---

## 🎨 Customization

### Grid Configuration

```typescript
// Customize hex dimensions
const hexDimensions = new HexDefinition(
  55,   // Size
  1,    // Spacing
  0,    // U offset
  3     // V offset
);
```

### Color Schemes

```tsx
<Map
  backgroundColor="#0a0a0a"
  gridColor="#808080"
  pulseEnabled={true}
/>
```

---

## 🔧 API Reference

### Map Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `octos` | `OctoType[]` | `[]` | Array of data objects to display |
| `viewMode` | `'public' \| 'personal' \| 'all-users' \| 'chat'` | `'public'` | Display mode |
| `onOctoClick` | `(octo: OctoType) => void` | - | Click handler |
| `backgroundColor` | `string` | `'#000000'` | Scene background color |
| `gridColor` | `string` | `'#808080'` | Hexagonal grid color |
| `pulseEnabled` | `boolean` | `false` | Enable pulse animation |
| `useThreeJs` | `boolean` | `false` | Use Three.js instead of Babylon.js |

### Camera Controls (Global)

```typescript
// Available via window.__hiveCamera
window.__hiveCamera.setMode('pan' | 'tilt' | 'spin' | 'zoom');
window.__hiveCamera.resetRotation();
```

---

## 🎯 Use Cases

### 1. **Spatial Project Manager**
Transform your project workflow with a 3D workspace where resources are organized spatially.

### 2. **Data Exploration Platform**
Visualize complex datasets in an intuitive hexagonal layout with automatic positioning.

### 3. **Decentralized Data Sharing**
Built-in Firebase and GunDB support for collaborative, real-time data synchronization.

### 4. **Educational Tools**
Interactive 3D interfaces for teaching coordinate systems, spatial reasoning, and data structures.

### 5. **Game Development**
Perfect foundation for hex-based strategy games, board game simulations, or tactical interfaces.

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format with Prettier
npm run type-check   # TypeScript type checking
```

### Tech Stack Details

- **Frontend Framework:** React 19.1+ with TypeScript 5.6+
- **3D Rendering:** Three.js 0.182 + React Three Fiber 9.5
- **Alt Rendering:** Babylon.js 7.54
- **Coordinate System:** Honeycomb-grid 4.1.5
- **Build Tool:** Vite 7.0
- **Styling:** Tailwind CSS 3.4
- **Backend:** Firebase 11.9 + GunDB 0.2020
- **Animation:** Framer Motion 11.18

---

## 📚 Documentation

- 📖 **[Architecture Guide](./ARCHITECTURE.md)** - Detailed system architecture
- 🏗️ **[Project Hive Concept](./PROJECT_HIVE_CONCEPT.md)** - Vision and roadmap
- 🔄 **[Migration Guide](./MIGRATION_MAPPING.md)** - Babylon → Three.js migration
- 📝 **[Changelog](./CHANGELOG.md)** - Version history

---

## 🤝 Contributing

We welcome contributions! OpenDataHive is designed to be a reusable framework for anyone building spatial interfaces.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🌍 Community Projects Using OpenDataHive

OpenDataHive serves as the foundation for various spatial data visualization projects:

- 🗺️ **Interactive Data Maps** - Geographic and conceptual data mapping
- 📊 **Dashboard Replacements** - 3D spatial dashboards
- 🎮 **Hex-Based Games** - Strategy and board game implementations
- 🏗️ **Workspace Organizers** - Spatial project management tools

*Using OpenDataHive? Let us know! We'd love to feature your project.*

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Honeycomb-grid** - Hexagonal coordinate mathematics
- **Three.js Community** - 3D rendering ecosystem
- **Babylon.js Team** - Robust 3D engine
- **React Three Fiber** - Declarative Three.js in React

---

## 📞 Contact & Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/yourusername/opendatahive/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/yourusername/opendatahive/discussions)
- 📧 **Email:** contact@opendatahive.dev

---

## 🎯 Keywords (SEO)

`hexagonal grid` `hex map` `3D visualization` `spatial data` `React Three Fiber` `Babylon.js` `Three.js` `data visualization framework` `honeycomb grid` `hexagonal coordinates` `spatial interface` `3D UI` `immersive data` `project management 3D` `hex-based` `coordinate system` `TypeScript grid` `React 3D` `interactive map` `data exploration` `spatial organization`

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ by the OpenDataHive Team

</div>

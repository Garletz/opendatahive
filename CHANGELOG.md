# Changelog - Opendatahive

## 🚀 Version 2.0 - Major Update

### ✨ New Features

#### 🌐 Interactive 3D Map
- **3D Sphere with 500 hexagons** : Immersive visualization of octos on a sphere
- **Smooth navigation** : Rotation, zoom, recentering with OrbitControls
- **Spectacular transitions** : Rewind animation 2D → 3D and vice-versa
- **Complete interactivity** : Click, hover, and touch navigation
- **Optimized positioning** : Hexagons tangent to sphere (Fibonacci sphere)

#### 🎮 Advanced Controls
- **Persistent control panel** : Zoom, recenter, keyboard mode, 2D/3D toggle
- **Keyboard navigation** : Movement with arrow keys and WASD
- **3D mode** : OrbitControls with inertia and auto-rotation

### 📱 Responsive & Mobile Improvements

#### 🎨 Modern Header
- **YouTube-inspired design** : Burger menu on left, centered logo, login on right
- **Smart navigation** : Automatic desktop/mobile switch based on space
- **Mobile side menu** : Secondary navigation accessible via burger menu

#### 📐 Responsive Layout
- **Adaptive sidebar** : Automatic hiding on mobile
- **Flexible grids** : Automatic adaptation based on screen size
- **Optimized modals** : Correct display on all devices

### 🐛 Bug Fixes

#### 🎯 User Interface
- **"Keyboard Navigation" panel** : No longer displays on load
- **Mobile overlaps** : Header and sidebar correctly positioned
- **Modals** : Display and closing fixed on mobile

#### ⚡ Performance
- **Optimized 2D grid** : Progressive animation for first 100 hexagons
- **Instant loading** : Immediate display of remaining grid
- **Hook cleanup** : Removal of unused states and imports

### 🔧 Technical Optimizations

#### 🏗️ Architecture
- **Code refactoring** : Clear separation of 2D/3D components
- **Optimized contexts** : Simplified and performant state management
- **Cleaned imports** : Removal of unused dependencies

#### 🎨 UX/UI
- **Streamlined interface** : Removal of obsolete loading window
- **Smooth transitions** : Performance-optimized animations
- **Accessibility** : Improved keyboard and touch navigation

### 📦 Added Dependencies
- `@react-three/fiber` : React 3D rendering
- `@react-three/drei` : 3D controls and utilities
- `three` : Underlying 3D engine

---

*Last updated : June 26, 2025* 
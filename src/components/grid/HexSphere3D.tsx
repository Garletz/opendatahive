import React, { forwardRef, useImperativeHandle } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Octo } from '../../types/octo';
import { useModal } from '../../context/ModalContext';

interface HexSphere3DProps {
  octos: Octo[];
}

// Fonction pour générer 500 points uniformément répartis sur une sphère (Fibonacci sphere)
function fibonacciSphere(samples: number, radius: number) {
  const points = [];
  const offset = 2 / samples;
  const increment = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = ((i * offset) - 1) + (offset / 2);
    const r = Math.sqrt(1 - y * y);
    const phi = i * increment;
    const x = Math.cos(phi) * r;
    const z = Math.sin(phi) * r;
    points.push([x * radius, y * radius, z * radius]);
  }
  return points;
}

const HEX_COUNT = 500;
const SPHERE_RADIUS = 10;

const HexSphere3D = forwardRef<any, HexSphere3DProps>(({ octos }, ref) => {
  const positions = React.useMemo(() => fibonacciSphere(HEX_COUNT, SPHERE_RADIUS), []);
  const { openDetailModal } = useModal();
  const [hovered, setHovered] = React.useState<number | null>(null);
  const controlsRef = React.useRef<any>(null);

  // Calcule la rotation pour aligner l'hexagone tangent à la sphère
  const getHexRotation = (pos: [number, number, number]) => {
    const [x, y, z] = pos;
    const normal = new THREE.Vector3(x, y, z).normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return new THREE.Euler().setFromQuaternion(quaternion);
  };

  // Expose les méthodes de contrôle pour les boutons
  useImperativeHandle(ref, () => ({
    zoomIn: () => controlsRef.current && controlsRef.current.dollyOut(1.2),
    zoomOut: () => controlsRef.current && controlsRef.current.dollyIn(1.2),
    resetView: () => controlsRef.current && controlsRef.current.reset(),
  }));

  return (
    <Canvas camera={{ position: [0, 0, 30], fov: 60 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={0.7} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={8}
        maxDistance={30}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI - 0.2}
        enableDamping
        dampingFactor={0.1}
        makeDefault
      />
      {positions.map((pos, i) => (
        <mesh
          key={i}
          position={pos as [number, number, number]}
          rotation={getHexRotation(pos as [number, number, number])}
          onPointerOver={() => setHovered(i)}
          onPointerOut={() => setHovered(null)}
          onClick={() => octos[i] && openDetailModal(octos[i])}
        >
          <cylinderGeometry args={[0.7, 0.7, 0.2, 6]} />
          <meshStandardMaterial
            color={
              hovered === i
                ? (octos[i] ? '#f59e42' : '#a3a3a3')
                : (octos[i] ? '#fbbf24' : '#e5e7eb')
            }
            emissive={hovered === i ? '#fbbf24' : '#000000'}
            emissiveIntensity={hovered === i ? 0.5 : 0}
          />
        </mesh>
      ))}
    </Canvas>
  );
});

export default HexSphere3D; 
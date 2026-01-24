/**
 * ThreeEngine - Main R3F Canvas wrapper for the Hive Map
 * Replaces HexBoard.ts as the engine entry point
 */

import React, { Suspense, useMemo, useCallback, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { HiveCamera } from './HiveCamera';
import { InfiniteGrid } from '../grid/InfiniteGrid';
import { OctoRenderer } from '../meshes/OctoMesh';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import HexDefinition from '../../shared/utils/cartesian-hexagonal';
import { HexDimensions } from '../../types';

interface ThreeEngineProps {
    octos?: any[];
    projectNodes?: any[];
    onOctoClick?: (octo: any) => void;
    onNodeClick?: (node: any) => void;
    onGridClick?: (u: number, v: number) => void;
    onShowOctos?: () => void;  // Callback to load octos
    onUserClick?: (userId: string) => void; // Callback for user click
    backgroundColor?: string;
    gridColor?: string;
    pulseEnabled?: boolean;
    selectedOctoId?: string | null;
    viewMode?: 'public' | 'personal' | 'all-users' | 'chat' | string;
    showAllUsers?: boolean; // Whether to show user avatars instead of octos
    gun?: any; // GunDB instance for user data
}

// Sun/Star component with spin animation (matching Map.tsx lines 546-562)
const Sun: React.FC<{ onShowOctos?: () => void }> = ({ onShowOctos }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [isVivid, setIsVivid] = useState(false);

    // Animation loop for spinning
    useFrame((state, delta) => {
        if (meshRef.current && isSpinning) {
            meshRef.current.rotation.z += delta * 2; // Spin speed
        }
    });

    const handleClick = () => {
        // Start spinning
        setIsSpinning(true);
        // Boost colors
        setIsVivid(true);
        // Trigger octo loading
        if (onShowOctos) {
            onShowOctos();
        }
        console.log('Sun clicked - starting rotation and loading octos');
    };

    return (
        <mesh
            ref={meshRef}
            position={[0, 0, 5]}
            rotation={[Math.PI / 2, 0, 0]}
            onClick={handleClick}
        >
            <torusGeometry args={[40, 12, 16, 50]} />
            <meshStandardMaterial
                color={isVivid ? "#ffff00" : "#ffff14"}
                emissive={isVivid ? "#ff8800" : "#f97306"}
                emissiveIntensity={isVivid ? 3.0 : 2.0}
                metalness={0.3}
                roughness={0.4}
            />
        </mesh>
    );
};

// Separate component to access Three context
const SceneContent: React.FC<ThreeEngineProps & { hexDimensions: HexDimensions }> = ({
    hexDimensions,
    octos,
    projectNodes,
    onOctoClick,
    onNodeClick,
    onGridClick,
    onShowOctos,
    onUserClick,
    gridColor,
    pulseEnabled,
    selectedOctoId,
    viewMode,
    showAllUsers,
    gun,
}) => {
    // State to control octo visibility - starts hidden, shown on sun click (like Babylon.js)
    const [octosVisible, setOctosVisible] = useState(false);

    // Grid pan handler - connects camera to grid snapping
    const handlePan = useCallback((middleX: number, middleY: number) => {
        // This will be used by InfiniteGrid for snapping
        (window as any).__gridMiddle = { x: middleX, y: middleY };
    }, []);

    // Handler for sun click - show octos in spiral
    const handleSunClick = useCallback(() => {
        setOctosVisible(true);
        onShowOctos?.();
    }, [onShowOctos]);

    return (
        <>
            {/* Custom Camera Controller (port of HexBoard controls) */}
            <HiveCamera
                hexDimensions={hexDimensions}
                onPan={handlePan}
            />

            {/* No scene fog - Babylon.js uses per-hex alpha fade in InfiniteGrid */}

            {/* Lights (matching HexBoard.init, lines 322-330) */}
            <ambientLight intensity={0.3} color="#ffffff" />
            <pointLight position={[0, 0, 500]} intensity={0.5} />

            {/* Background Stars (matching StarryContext) */}
            <Stars
                radius={2500}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />

            {/* The Infinite Hex Grid (port of InverseGridContext) */}
            <InfiniteGrid
                hexDimensions={hexDimensions}
                color={gridColor || '#808080'}
                radius={15}
                fadeRadius={15}
                baseAlpha={0.5}
                pulseEnabled={pulseEnabled}
                onCellClick={onGridClick}
            />

            {/* Sun/Star at center with click-to-spin behavior */}
            <Sun onShowOctos={handleSunClick} />

            {/* Mode-based rendering */}
            {showAllUsers ? (
                // All Users Mode: Show user avatars instead of octos
                <group>
                    {/* TODO: Implement UserRenderer component */}
                    {/* Uses gun for user data, onUserClick for interactions */}
                    <mesh position={[0, 0, 50]}>
                        <sphereGeometry args={[20, 32, 32]} />
                        <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={0.5} />
                    </mesh>
                </group>
            ) : (
                <>
                    {/* Octo Items - only show after sun click (octosVisible) */}
                    {octosVisible && octos && octos.length > 0 && (
                        <OctoRenderer
                            octos={octos}
                            hexDimensions={hexDimensions}
                            selectedOctoId={selectedOctoId}
                            onOctoClick={onOctoClick}
                        />
                    )}

                    {/* Project Nodes - show when projectNodes available */}
                    {projectNodes && projectNodes.length > 0 && (
                        <group>
                            {/* TODO: Implement NodeRenderer similar to OctoRenderer */}
                            {projectNodes.map((node: any, i: number) => (
                                <mesh
                                    key={node.id || i}
                                    position={[node.x || i * 50, node.y || 0, 10]}
                                    onClick={() => onNodeClick?.(node)}
                                >
                                    <boxGeometry args={[30, 30, 30]} />
                                    <meshStandardMaterial color="#10b981" />
                                </mesh>
                            ))}
                        </group>
                    )}
                </>
            )}
        </>
    );
};

export const ThreeEngine: React.FC<ThreeEngineProps> = (props) => {
    // Create HexDefinition once (matches Map.tsx line 388)
    const hexDimensions = useMemo(() => new HexDefinition(55, 1, 0, 3), []);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                background: props.backgroundColor || '#000000',
                position: 'absolute',
                top: 0,
                left: 0,
            }}
        >
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.0,
                    powerPreference: 'high-performance',
                }}
                style={{ outline: 'none' }}
            >
                {/* Z-UP Camera (matching HexBoard camera.upVector, line 80) */}
                <PerspectiveCamera
                    makeDefault
                    position={[0, -1000, 1000]}
                    fov={45}
                    near={1}
                    far={10000}
                    up={[0, 0, 1]}
                />

                <Suspense fallback={null}>
                    <SceneContent {...props} hexDimensions={hexDimensions} />

                    {/* Post-processing effects */}
                    <EffectComposer>
                        <Bloom
                            luminanceThreshold={0.6}
                            luminanceSmoothing={0.9}
                            intensity={0.8}
                            mipmapBlur
                        />
                        <Vignette eskil={false} offset={0.1} darkness={0.6} />
                    </EffectComposer>
                </Suspense>
            </Canvas>
        </div>
    );
};

export default ThreeEngine;

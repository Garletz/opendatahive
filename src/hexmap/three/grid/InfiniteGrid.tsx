/**
 * InfiniteGrid - Port of InverseGridContext.ts
 * Renders the hexagonal grid with snapping and pulse animation
 */

import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { HexDimensions } from '../../types';

interface InfiniteGridProps {
    hexDimensions: HexDimensions;
    color: string;
    radius: number;
    fadeRadius: number;
    baseAlpha: number;
    pulseEnabled?: boolean;
    onCellClick?: (u: number, v: number) => void;
}

export const InfiniteGrid: React.FC<InfiniteGridProps> = ({
    hexDimensions,
    color,
    radius,
    fadeRadius,
    baseAlpha,
    pulseEnabled = false,
    onCellClick,
}) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    // Parse color to RGB (matching hexToRgb utility)
    const colorRGB = useMemo(() => {
        const c = new THREE.Color(color);
        return { r: c.r, g: c.g, b: c.b };
    }, [color]);

    // Geometry: Hexagonal shape using THREE.Shape (proper flat hexagon)
    // This creates a true hexagonal top-down view, unlike CylinderGeometry which shows triangular sides
    const geometry = useMemo(() => {
        const size = hexDimensions.hexagon_half_wide_width - 2; // Match Babylon: diameter minus gap

        // Create hexagon shape (pointy-top orientation to match Babylon.js)
        const shape = new THREE.Shape();
        const angleOffset = Math.PI / 6; // 30 degrees for pointy-top

        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + angleOffset;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        }
        shape.closePath();

        // Extrude to create a thin prism (matching Babylon height: 1)
        const extrudeSettings = {
            depth: 1,
            bevelEnabled: false,
        };

        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // Center the geometry on Z axis (extrude goes from 0 to depth, we want -0.5 to 0.5)
        geo.translate(0, 0, -0.5);

        return geo;
    }, [hexDimensions]);

    // Position array (matching createPositionArray, lines 306-339)
    const { count, positions } = useMemo(() => {
        const posArray: { x: number; y: number }[] = [];
        const totalRadius = radius + fadeRadius;

        // Center hex
        posArray.push({ x: 0, y: 0 });

        // Spiral outward (exact copy of InverseGridContext algorithm)
        for (let i = 1; i < totalRadius + 1; i++) {
            // Top-right to bottom-right
            for (let v = -i; v <= 0; v++) {
                const pix = hexDimensions.getPixelCoordinates(i, v);
                posArray.push({ x: pix.x, y: pix.y });
            }
            // Bottom-left to top-left
            for (let v = 0; v <= i; v++) {
                const pix = hexDimensions.getPixelCoordinates(-i, v);
                posArray.push({ x: pix.x, y: pix.y });
            }
            // Top edge
            for (let u = -i + 1; u <= 0; u++) {
                const pix = hexDimensions.getPixelCoordinates(u, i);
                posArray.push({ x: pix.x, y: pix.y });
            }
            // Bottom edge
            for (let u = 0; u < i; u++) {
                const pix = hexDimensions.getPixelCoordinates(u, -i);
                posArray.push({ x: pix.x, y: pix.y });
            }
            // Diagonal 1
            for (let u = -i + 1, v = -1; v > -i; u++, v--) {
                const pix = hexDimensions.getPixelCoordinates(u, v);
                posArray.push({ x: pix.x, y: pix.y });
            }
            // Diagonal 2
            for (let u = i - 1, v = 1; v < i; u--, v++) {
                const pix = hexDimensions.getPixelCoordinates(u, v);
                posArray.push({ x: pix.x, y: pix.y });
            }
        }

        return { count: posArray.length, positions: posArray };
    }, [hexDimensions, radius, fadeRadius]);

    // Initialize instance matrices
    useEffect(() => {
        if (!meshRef.current) return;

        const tempObject = new THREE.Object3D();
        const tempColor = new THREE.Color();

        for (let i = 0; i < count; i++) {
            tempObject.position.set(positions[i].x, positions[i].y, -1);
            // No rotation needed - ExtrudeGeometry is already flat on XY plane
            tempObject.rotation.set(0, 0, 0);
            tempObject.scale.set(1, 1, 0.01); // Very thin to look like Babylon
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObject.matrix);

            // Set initial color
            tempColor.setRGB(colorRGB.r, colorRGB.g, colorRGB.b);
            meshRef.current.setColorAt(i, tempColor);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }
    }, [count, positions, colorRGB]);

    // Animation frame (matching InverseGridContext render observer, lines 216-235)
    const timeRef = useRef(0);
    const middleRef = useRef({ x: 0, y: 0 });

    useFrame((state, delta) => {
        if (!meshRef.current || !groupRef.current) return;

        timeRef.current += delta;

        // Get camera target (middle of view)
        const middleX = (window as any).__gridMiddle?.x || camera.position.x;
        const middleY = (window as any).__gridMiddle?.y || camera.position.y;

        // Calculate grid snap position (matching lines 221-234)
        const hexCoords = hexDimensions.getReferencePoint(middleX, middleY);
        const centerHexPixel = hexDimensions.getPixelCoordinates(hexCoords.u, hexCoords.v);

        // Move the grid to snap to hex center
        groupRef.current.position.x = centerHexPixel.x;
        groupRef.current.position.y = centerHexPixel.y;

        // Update middle offset for fade calculation
        middleRef.current.x = middleX - centerHexPixel.x;
        middleRef.current.y = middleY - centerHexPixel.y;

        // Update particles (matching updateParticle, lines 81-197)
        const tempObject = new THREE.Object3D();
        const tempColor = new THREE.Color();
        const tempMatrix = new THREE.Matrix4();

        for (let i = 0; i < count; i++) {
            const posX = positions[i].x;
            const posY = positions[i].y;

            // Calculate world position
            const worldX = posX + groupRef.current.position.x;
            const worldY = posY + groupRef.current.position.y;

            // Distance from view center for fade (matching lines 82-105)
            const distanceFromView = Math.sqrt(
                Math.pow(posX - middleRef.current.x, 2) +
                Math.pow(posY - middleRef.current.y, 2)
            );

            let alpha = baseAlpha;
            const innerRadius = radius * hexDimensions.hexagon_narrow_width;
            const outerRadius = (radius + fadeRadius) * hexDimensions.hexagon_narrow_width;

            if (distanceFromView > innerRadius && distanceFromView < outerRadius) {
                alpha = -baseAlpha / (fadeRadius * hexDimensions.hexagon_narrow_width) *
                    (distanceFromView - innerRadius) + baseAlpha;
            } else if (distanceFromView >= outerRadius) {
                alpha = 0;
            }

            // Get hex coordinates for effects
            const hexPos = hexDimensions.getReferencePoint(worldX, worldY);

            let r = colorRGB.r;
            let g = colorRGB.g;
            let b = colorRGB.b;
            let currentHeight = 0.01;

            if (pulseEnabled) {
                // Pulse effect (matching lines 144-196)
                const time = timeRef.current;

                // Global pulse
                const globalPulse = Math.sin(time * 0.8) * 0.15 + 0.85;

                // Wave pulse
                const distance = Math.sqrt(worldX * worldX + worldY * worldY);
                const wavePhase = distance * 0.003 - time * 2.0;
                const wavePulse = Math.sin(wavePhase) * 0.2 + 1.0;

                // Hex pulse
                const hexPhase = (hexPos.u + hexPos.v) * 0.5;
                const hexPulse = Math.sin(time * 1.5 + hexPhase) * 0.1 + 1.0;

                const pulseMultiplier = globalPulse * wavePulse * hexPulse;

                r = Math.min(1.0, colorRGB.r * pulseMultiplier);
                g = Math.min(1.0, colorRGB.g * pulseMultiplier);
                b = Math.min(1.0, colorRGB.b * pulseMultiplier);

                // Alpha pulse
                const alphaPulse = Math.sin(time * 1.2 + hexPhase * 0.3) * 0.1 + 1.0;
                alpha = alpha * Math.min(1.0, alphaPulse);

                // Elevation effect
                const elevationSeed = Math.sin(hexPos.u * 17.3 + hexPos.v * 51.7) * 100;
                const elevationPhase = time * 0.6 + elevationSeed;
                const heightCycle = Math.sin(elevationPhase);
                const heightFactor = Math.max(0, heightCycle);
                const smoothHeight = heightFactor * heightFactor;
                const maxElevation = 50;
                const minHeight = 0.5;
                currentHeight = minHeight + smoothHeight * maxElevation;
            }

            // Update matrix
            tempObject.position.set(posX, posY, -1 + currentHeight / 2);
            tempObject.rotation.set(0, 0, 0); // No rotation needed for ExtrudeGeometry
            tempObject.scale.set(1, 1, currentHeight);
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObject.matrix);

            // Update color with alpha baked in (using emissive intensity instead)
            tempColor.setRGB(r * alpha, g * alpha, b * alpha);
            meshRef.current.setColorAt(i, tempColor);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }
    });

    // Click handler
    const handlePointerDown = useCallback((e: any) => {
        if (!onCellClick) return;
        e.stopPropagation();

        const worldX = e.point.x;
        const worldY = e.point.y;
        const hex = hexDimensions.getReferencePoint(worldX, worldY);
        onCellClick(hex.u, hex.v);
    }, [hexDimensions, onCellClick]);

    // Material - Use MeshBasicMaterial for proper transparency
    // MeshStandardMaterial doesn't handle transparency well with emissive
    const material = useMemo(() => {
        const c = new THREE.Color(color);
        return new THREE.MeshBasicMaterial({
            color: c,
            transparent: true,
            opacity: 0.5, // Match Babylon's visible look (was 0.15, too transparent)
            side: THREE.DoubleSide,
            depthWrite: false,
        });
    }, [color]);

    return (
        <group ref={groupRef}>
            <instancedMesh
                ref={meshRef}
                args={[geometry, material, count]}
                frustumCulled={false}
            />

            {/* Invisible plane for raycasting (matching HexBoard pickerPlane) */}
            <mesh
                visible={false}
                onPointerDown={handlePointerDown}
                position={[0, 0, 0]}
            >
                <planeGeometry args={[100000, 100000]} />
                <meshBasicMaterial />
            </mesh>
        </group>
    );
};

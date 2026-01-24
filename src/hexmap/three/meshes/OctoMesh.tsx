/**
 * OctoMesh - Mesh component for Octo items
 * Port of Map.tsx itemMap.octo logic (lines 569-657)
 */

import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface OctoMeshProps {
    item: any;
    position: [number, number, number];
    isSelected?: boolean;
    onClick?: () => void;
}

// File type detection (matching Map.tsx lines 571-590)
const getFileInfo = (item: any): { type: string; color: string } => {
    let fileName = '';
    let fileType = '';

    if (item.octoData?.files?.[0]) {
        fileName = (item.octoData.files[0].name || '').toLowerCase();
        fileType = (item.octoData.files[0].type || '').toLowerCase();
    }

    // Color mapping (matching mesh factories)
    if (fileName.endsWith('.md') || fileType === 'md') {
        return { type: 'md', color: '#ffffff' }; // White with blue emissive
    }
    if (fileName.endsWith('.mp3') || fileType === 'mp3') {
        return { type: 'mp3', color: '#ff69b4' }; // Pink
    }
    if (fileName.endsWith('.csv') || fileType === 'csv') {
        return { type: 'csv', color: '#32cd32' }; // Green
    }
    if (fileName.endsWith('.json') || fileType === 'json') {
        return { type: 'json', color: '#ffa500' }; // Orange
    }
    if (fileName.endsWith('.pdf') || fileType === 'pdf') {
        return { type: 'pdf', color: '#ff4444' }; // Red
    }
    if (fileName.endsWith('.png') || fileType === 'png') {
        return { type: 'png', color: '#87ceeb' }; // Light blue
    }
    if (fileName.endsWith('.webp') || fileType === 'webp') {
        return { type: 'webp', color: '#9370db' }; // Purple
    }
    if (fileName.endsWith('.webm') || fileType === 'webm') {
        return { type: 'webm', color: '#ff6347' }; // Tomato
    }
    if (fileName.endsWith('.xml') || fileType === 'xml') {
        return { type: 'xml', color: '#708090' }; // Slate gray
    }
    if (fileName.endsWith('.glb') || fileType === 'glb') {
        return { type: 'glb', color: '#4169e1' }; // Royal blue
    }
    if (fileName.endsWith('.graphml') || fileType === 'graphml') {
        return { type: 'graphml', color: '#20b2aa' }; // Light sea green
    }
    if (fileName.endsWith('.odhc') || fileType === 'odhc') {
        return { type: 'odhc', color: '#ffd700' }; // Gold
    }

    // Default: Yellow hexagon (matching lines 630-637)
    return { type: 'default', color: '#FFD600' };
};

export const OctoMesh: React.FC<OctoMeshProps> = ({
    item,
    position,
    isSelected = false,
    onClick,
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const fileInfo = useMemo(() => getFileInfo(item), [item]);

    // Hover/selection scale (matching ActionManager behavior)
    const targetScale = isSelected ? 1.3 : hovered ? 1.1 : 1.0;
    const scaleRef = useRef(1.0);

    useFrame((_, delta) => {
        if (meshRef.current) {
            // Smooth scale transition
            scaleRef.current += (targetScale - scaleRef.current) * delta * 10;
            meshRef.current.scale.setScalar(scaleRef.current);
        }
    });

    // Geometry based on type
    const geometry = useMemo(() => {
        const size = item.size || 22;
        const thickness = item.thickness || 3;

        switch (fileInfo.type) {
            case 'md':
                // Box for markdown (matching MdMeshFactory)
                return new THREE.BoxGeometry(size * 0.8, size * 1.1, thickness);
            case 'mp3':
                // Cylinder for audio
                return new THREE.CylinderGeometry(size / 2, size / 2, thickness, 32);
            default:
                // Hexagon for others (matching RegularPolygonMeshFactory)
                return new THREE.CylinderGeometry(size, size, thickness, 6);
        }
    }, [fileInfo.type, item.size, item.thickness]);

    // Material
    const material = useMemo(() => {
        const color = new THREE.Color(fileInfo.color);
        return new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: isSelected ? 0.4 : 0.2,
            metalness: 0.3,
            roughness: 0.7,
        });
    }, [fileInfo.color, isSelected]);

    // Title for label
    const title = item.octoData?.title || item.title || item.id?.substring(0, 8) || 'Octo';

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                geometry={geometry}
                material={material}
                rotation={[Math.PI / 2, 0, 0]}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    setHovered(false);
                    document.body.style.cursor = 'auto';
                }}
            />

            {/* Selection ring */}
            {isSelected && (
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
                    <torusGeometry args={[30, 1, 16, 6]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            )}

            {/* Label (matching Babylon GUI behavior) */}
            <Html
                position={[0, 0, 20]}
                center
                distanceFactor={800}
                style={{ pointerEvents: 'none' }}
            >
                <div
                    style={{
                        color: 'white',
                        background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.6)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                        border: isSelected ? '1px solid white' : 'none',
                    }}
                >
                    {title}
                </div>
            </Html>
        </group>
    );
};

/**
 * OctoRenderer - Renders all octos with Z-stacking
 * Port of ZStackingPipelineNode behavior
 */
interface OctoRendererProps {
    octos: any[];
    hexDimensions: {
        getPixelCoordinates: (u: number, v: number) => { x: number; y: number };
    };
    selectedOctoId?: string | null;
    onOctoClick?: (octo: any) => void;
}

export const OctoRenderer: React.FC<OctoRendererProps> = ({
    octos,
    hexDimensions,
    selectedOctoId,
    onOctoClick,
}) => {
    // Z-stacking logic (matching ZStackingPipelineNode)
    const stackedOctos = useMemo(() => {
        const positionMap = new Map<string, number>();

        return octos.map((octo) => {
            const u = octo.u ?? octo.gridU ?? 0;
            const v = octo.v ?? octo.gridV ?? 0;
            const key = `${u},${v}`;

            const stackIndex = positionMap.get(key) || 0;
            positionMap.set(key, stackIndex + 1);

            const pixel = hexDimensions.getPixelCoordinates(u, v);
            const zHeight = 10; // Stack height (matching ZStackingPipelineNode zIncrement)

            return {
                ...octo,
                position: [pixel.x, pixel.y, stackIndex * zHeight] as [number, number, number],
                stackIndex,
            };
        });
    }, [octos, hexDimensions]);

    return (
        <group>
            {stackedOctos.map((octo) => (
                <OctoMesh
                    key={octo.id}
                    item={octo}
                    position={octo.position}
                    isSelected={selectedOctoId === octo.id}
                    onClick={() => onOctoClick?.(octo.octoData || octo)}
                />
            ))}
        </group>
    );
};

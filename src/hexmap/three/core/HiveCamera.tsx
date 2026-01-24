/**
 * HiveCamera - Custom camera controller for the hex map
 * Port of HexBoard.ts camera logic to Three.js
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HiveCameraProps {
    hexDimensions: {
        getReferencePoint: (x: number, y: number) => { u: number; v: number };
        getPixelCoordinates: (u: number, v: number) => { x: number; y: number };
    };
    onPan?: (middleX: number, middleY: number) => void;
    onCameraChange?: (x: number, y: number, z: number) => void;
}

export const HiveCamera: React.FC<HiveCameraProps> = ({
    hexDimensions,
    onPan,
    onCameraChange
}) => {
    const { camera, gl } = useThree();

    // Camera state (matching HexBoard.ts lines 23-28)
    const cameraState = useRef({
        targetX: 0,
        targetY: 0,
        alpha: Math.PI / 4,    // Tilt angle (vertical rotation)
        beta: 0,               // Spin angle (horizontal rotation)
        radius: Math.sqrt(1000 * 1000 + 1000 * 1000), // Distance from target
        mode: 'pan' as 'pan' | 'tilt' | 'spin' | 'zoom',
        disablePan: false,
    });

    // Drag state
    const dragState = useRef({
        isDragging: false,
        lastX: 0,
        lastY: 0,
        lastUpdateTime: 0,
    });

    const THROTTLE_MS = 16; // 60fps

    // Update camera position (port of updateCameraPosition, lines 377-399)
    const updateCameraPosition = useCallback(() => {
        const state = cameraState.current;

        // Calculate camera position using spherical coordinates
        // Note: Three.js uses Y-up by default, we use Z-up
        const x = state.targetX + state.radius * Math.sin(state.alpha) * Math.cos(state.beta);
        const y = state.targetY + state.radius * Math.sin(state.alpha) * Math.sin(state.beta);
        const z = state.radius * Math.cos(state.alpha);

        camera.position.set(x, y, z);
        camera.lookAt(state.targetX, state.targetY, 0);
        camera.up.set(0, 0, 1); // Z-UP

        onCameraChange?.(camera.position.x, camera.position.y, camera.position.z);
    }, [camera, onCameraChange]);

    // Pan function (port of pan, lines 405-420)
    const pan = useCallback((dx: number, dy: number) => {
        const state = cameraState.current;
        if (state.disablePan) return;

        // Babylon.js formula (lines 414-415)
        // Use -beta to correct spin adaptation for Three.js coordinate system
        const cosBeta = Math.cos(-state.beta);
        const sinBeta = Math.sin(-state.beta);

        const worldDx = dx * cosBeta + dy * sinBeta;
        const worldDy = -dx * sinBeta + dy * cosBeta;

        state.targetX += worldDx;
        state.targetY += worldDy;

        updateCameraPosition();
        onPan?.(state.targetX, state.targetY);
    }, [updateCameraPosition, onPan]);

    // Tilt function (port of tilt, lines 425-430)
    const tilt = useCallback((dAlpha: number) => {
        const state = cameraState.current;
        state.alpha += dAlpha;
        state.alpha = Math.max(state.alpha, Math.PI / 6);
        state.alpha = Math.min(state.alpha, Math.PI / 2 - Math.PI / 360);
        updateCameraPosition();
    }, [updateCameraPosition]);

    // Spin function (port of spin, lines 435-438)
    const spin = useCallback((dBeta: number) => {
        const state = cameraState.current;
        state.beta += dBeta;
        updateCameraPosition();
    }, [updateCameraPosition]);

    // Zoom function (port of zoom, lines 443-447)
    const zoom = useCallback((dRadius: number) => {
        const state = cameraState.current;
        state.radius += dRadius;
        state.radius = Math.max(state.radius, 100);
        state.radius = Math.min(state.radius, 3000);
        updateCameraPosition();
    }, [updateCameraPosition]);

    // Center on cell (port of centerOnCell, lines 475-482)
    const centerOnCell = useCallback((u: number, v: number) => {
        const pixelCoords = hexDimensions.getPixelCoordinates(u, v);
        const state = cameraState.current;
        state.targetX = pixelCoords.x;
        state.targetY = pixelCoords.y;
        updateCameraPosition();
        onPan?.(state.targetX, state.targetY);
    }, [hexDimensions, updateCameraPosition, onPan]);

    // Reset rotation (port of resetRotation, lines 452-455)
    const resetRotation = useCallback(() => {
        cameraState.current.beta = 0;
        updateCameraPosition();
    }, [updateCameraPosition]);

    // Pointer event handlers (port of lines 197-280)
    useEffect(() => {
        const canvas = gl.domElement;

        const handlePointerDown = (e: PointerEvent) => {
            dragState.current.isDragging = true;
            dragState.current.lastX = e.clientX;
            dragState.current.lastY = e.clientY;
        };

        const handlePointerUp = (e: PointerEvent) => {
            dragState.current.isDragging = false;
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (!dragState.current.isDragging) return;

            const now = Date.now();
            if (now - dragState.current.lastUpdateTime < THROTTLE_MS) return;
            dragState.current.lastUpdateTime = now;

            const dx = e.clientX - dragState.current.lastX;
            const dy = e.clientY - dragState.current.lastY;
            dragState.current.lastX = e.clientX;
            dragState.current.lastY = e.clientY;

            const state = cameraState.current;
            switch (state.mode) {
                case 'pan':
                    // Three.js coordinate fix: pan(-dy, -dx)
                    pan(-dy, -dx);
                    break;
                case 'tilt':
                    tilt(Math.PI * (dx + dy) / 500);
                    break;
                case 'spin':
                    spin(Math.PI * (dx + dy) / 500);
                    break;
                case 'zoom':
                    zoom((dx + dy) * 5);
                    break;
            }
        };

        // Wheel event (port of lines 124-137)
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (e.ctrlKey || e.metaKey) {
                zoom(e.deltaY * 2);
            } else {
                pan(e.deltaY * 0.8, -e.deltaX * 0.8);
            }
        };

        // Keyboard event (port of lines 141-194)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const panStep = 80;
            const zoomStep = 50;

            switch (e.key.toLowerCase()) {
                case 'arrowup':
                case 'w':
                    e.preventDefault();
                    pan(-panStep, 0);
                    break;
                case 'arrowdown':
                case 's':
                    e.preventDefault();
                    pan(panStep, 0);
                    break;
                case 'arrowleft':
                case 'a':
                    e.preventDefault();
                    pan(0, -panStep);
                    break;
                case 'arrowright':
                case 'd':
                    e.preventDefault();
                    pan(0, panStep);
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    zoom(-zoomStep);
                    break;
                case '-':
                case '_':
                    e.preventDefault();
                    zoom(zoomStep);
                    break;
                case 'r':
                    e.preventDefault();
                    resetRotation();
                    break;
                case 'home':
                case 'h':
                    e.preventDefault();
                    centerOnCell(0, 0);
                    break;
            }
        };

        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeyDown);

        // Initialize camera position
        updateCameraPosition();

        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gl, pan, tilt, spin, zoom, centerOnCell, resetRotation, updateCameraPosition]);

    // Expose methods via ref (for external control)
    useEffect(() => {
        (window as any).__hiveCamera = {
            pan,
            tilt,
            spin,
            zoom,
            centerOnCell,
            resetRotation,
            setMode: (mode: 'pan' | 'tilt' | 'spin' | 'zoom') => {
                cameraState.current.mode = mode;
            },
            setDisablePan: (disabled: boolean) => {
                cameraState.current.disablePan = disabled;
            },
        };
    }, [pan, tilt, spin, zoom, centerOnCell, resetRotation]);

    return null; // This is a controller component, renders nothing
};

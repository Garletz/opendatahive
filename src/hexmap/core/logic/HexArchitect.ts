
// HexArchitect.ts
// Utility suite for procedural generation on Hexagonal Grids (Axial System)

export interface AxialCoord {
    u: number;
    v: number;
}

export class HexArchitect {

    /**
     * Linear interpolation between hexes for line drawing
     */
    static hexLerp(a: AxialCoord, b: AxialCoord, t: number): AxialCoord {
        const u = a.u + (b.u - a.u) * t;
        const v = a.v + (b.v - a.v) * t;
        return this.hexRound(u, v);
    }

    /**
     * Round floating point axial coords to nearest hex
     */
    static hexRound(u: number, v: number): AxialCoord {
        // Convert to Cubic (x, y, z)
        let x = u;
        let z = v;
        let y = -x - z;

        let rx = Math.round(x);
        let ry = Math.round(y);
        let rz = Math.round(z);

        const x_diff = Math.abs(rx - x);
        const y_diff = Math.abs(ry - y);
        const z_diff = Math.abs(rz - z);

        if (x_diff > y_diff && x_diff > z_diff) {
            rx = -ry - rz;
        } else if (y_diff > z_diff) {
            ry = -rx - rz;
        } else {
            rz = -rx - ry;
        }

        return { u: rx, v: rz };
    }

    /**
     * Get hex distance between A and B
     */
    static hexDistance(a: AxialCoord, b: AxialCoord): number {
        return (Math.abs(a.u - b.u) + Math.abs(a.u + a.v - b.u - b.v) + Math.abs(a.v - b.v)) / 2;
    }

    // --- SHAPES ---

    /**
     * Returns a list of coordinates forming a line
     */
    static getLine(start: AxialCoord, end: AxialCoord): AxialCoord[] {
        const N = this.hexDistance(start, end);
        const results: AxialCoord[] = [];
        // N steps max? Actually calculate exactly
        // Or just simple interpolation
        const step = 1.0 / Math.max(N, 1);
        for (let i = 0; i <= N; i++) {
            results.push(this.hexLerp(start, end, step * i));
        }
        return results;
    }

    /**
     * Returns a list of coordinates forming a filled hexagon area (radius)
     */
    static getFilledHexagon(center: AxialCoord, radius: number): AxialCoord[] {
        const results: AxialCoord[] = [];
        for (let q = -radius; q <= radius; q++) {
            const r1 = Math.max(-radius, -q - radius);
            const r2 = Math.min(radius, -q + radius);
            for (let r = r1; r <= r2; r++) {
                results.push({ u: center.u + q, v: center.v + r });
            }
        }
        return results;
    }

    /**
     * Returns a list of coordinates forming a hollow ring
     */
    static getRing(center: AxialCoord, radius: number): AxialCoord[] {
        // A ring is just a loop. 
        // Optimization: Walk the radius.
        // Start at one corner, move in 6 directions?
        // Direction vectors in Axial (u, v)
        // E, SE, SW, W, NW, NE
        /*
           Wait, directions in Axial:
           +u (1, 0), -v (-1, 0) ? No.
           Directions:
           1. (1, 0)
           2. (1, -1)
           3. (0, -1)
           4. (-1, 0)
           5. (-1, 1)
           6. (0, 1)
        */
        if (radius === 0) return [center];

        const results: AxialCoord[] = [];
        let hex = { u: center.u + (-1 * radius), v: center.v + (1 * radius) }; // Start somewhere?
        // Standard algorithm: Start at center + direction * radius
        // Then move along neighbor directions for 'radius' steps

        // Easier way: GetFilled(radius) minus GetFilled(radius-1)
        // Or just iterate distance check
        const currentResults: AxialCoord[] = [];
        // Let's rely on distance check for now, brute force but simple for < 50
        // Actually, "Ring" usually means distance == radius.
        // So we can reuse filled hexagon logic but filter by distance
        for (let q = -radius; q <= radius; q++) {
            const r1 = Math.max(-radius, -q - radius);
            const r2 = Math.min(radius, -q + radius);
            for (let r = r1; r <= r2; r++) {
                const coord = { u: center.u + q, v: center.v + r };
                if (this.hexDistance(center, coord) === radius) {
                    results.push(coord);
                }
            }
        }
        return results;
    }
}

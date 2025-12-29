declare module '@babylonjs/core' {
  interface Mesh {
    isGenericContextItem?: boolean;
    isCellItem?: boolean;
    data?: any;
    billboardMode?: number;
    visibility?: number;
  }

  interface Scene {
    pick(x: number, y: number, predicate?: (mesh: Mesh) => boolean): {
      hit: boolean;
      pickedMesh?: Mesh;
    };
  }

  namespace MeshBuilder {
    function MergeMeshes(meshes: Mesh[]): Mesh | null;
  }
}

// Global type declarations for missing properties
declare global {
  interface CanvasRenderingContext2D {
    putImageData(imageData: ImageData, dx: number, dy: number): void;
  }
} 
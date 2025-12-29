declare module 'babylonjs' {
  interface Mesh {
    isGenericContextItem?: boolean;
    isCellItem?: boolean;
    data?: any;
    billboardMode?: number;
    visibility?: number;
    dispose(): void;
    position: {
      x: number;
      y: number;
      z: number;
    };
    rotation: {
      x: number;
      y: number;
      z: number;
    };
    scaling: {
      x: number;
      y: number;
      z: number;
    };
    material?: any;
    parent?: Mesh;
  }

  interface Scene {
    pick(x: number, y: number, predicate?: (mesh: AbstractMesh) => boolean): {
      hit: boolean;
      pickedMesh?: Mesh;
    };
  }

  interface AbstractMesh {
    isGenericContextItem?: boolean;
    isCellItem?: boolean;
    data?: any;
    billboardMode?: number;
    visibility?: number;
    dispose(): void;
    position: {
      x: number;
      y: number;
      z: number;
    };
    rotation: {
      x: number;
      y: number;
      z: number;
    };
    material?: any;
    parent?: Mesh;
  }

  namespace Mesh {
    function MergeMeshes(meshes: Mesh[]): Mesh | null;
  }

  namespace MeshBuilder {
    function CreateBox(name: string, options?: any, scene?: Scene): Mesh;
    function CreatePlane(name: string, options?: any, scene?: Scene): Mesh;
    function CreateSphere(name: string, options?: any, scene?: Scene): Mesh;
    function CreateCylinder(name: string, options?: any, scene?: Scene): Mesh;
    function CreateTube(name: string, options?: any, scene?: Scene): Mesh;
    function CreateDisc(name: string, options?: any, scene?: Scene): Mesh;
    function ExtrudeShape(name: string, options?: any, scene?: Scene): Mesh;
  }

  class StandardMaterial {
    constructor(name: string, scene: Scene);
    diffuseColor: Color3;
    ambientColor: Color3;
    emissiveColor: Color3;
    specularColor: Color3;
    diffuseTexture?: any;
    emissiveTexture?: any;
    backFaceCulling: boolean;
  }

  class DynamicTexture {
    constructor(name: string, size: number | { width: number; height: number }, scene: Scene, generateMipMaps?: boolean);
    getContext(): CanvasRenderingContext2D;
    getSize(): { width: number; height: number };
    update(usePostProcess?: boolean): void;
    hasAlpha?: boolean;
  }

  class Color3 {
    constructor(r: number, g: number, b: number);
  }

  class Vector3 {
    constructor(x: number, y: number, z: number);
    x: number;
    y: number;
    z: number;
  }

  const Mesh: {
    DOUBLESIDE: number;
    BILLBOARDMODE_ALL: number;
    BILLBOARDMODE_Z: number;
    CAP_END: number;
  };
}

// Global type declarations for missing properties
declare global {
  interface CanvasRenderingContext2D {
    putImageData(imageData: ImageData, dx: number, dy: number): void;
  }
} 
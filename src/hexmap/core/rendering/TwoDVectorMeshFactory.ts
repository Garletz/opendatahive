import * as babylon from "babylonjs";

interface HexDefinition {
  hexagon_edge_to_edge_width: number;
  getPixelCoordinates(u: number, v: number): { x: number; y: number };
}

interface VectorItem {
  id?: string;
  vectorU?: number;
  vectorV?: number;
  lineWidth?: number;
  lineColor?: string;
  isEmissive?: boolean;
  angle?: number;
  onClick?: () => void;
}

interface VectorMesh extends babylon.Mesh {
  isGenericContextItem: boolean;
  data: {
    item: VectorItem;
    hitTestAlpha?: (x: number, y: number) => boolean;
  };
}

/**
 * A factory to create a Babylon.js mesh with a 2D vector drawn on it
 */
export default class TwoDVectorMeshFactory {
  private hexDefinition: HexDefinition;
  private pixelArray?: ImageData;
  private imageDataWidth?: number;
  private imageDataHeight?: number;

  constructor(hexDefinition: HexDefinition) {
    this.hexDefinition = hexDefinition;
  }

  /**
   * Create a 2D vector mesh
   * @param item - The DTO to produce a Babylon.js mesh for
   * @param scene - Babylon.js scene
   * @returns The Babylon.js Mesh representing the vector
   */
  getMesh(item: VectorItem, scene: babylon.Scene): VectorMesh {
    // Default values
    const vectorU = item.vectorU || 1;
    const vectorV = item.vectorV || 0;
    const lineWidth = item.lineWidth || 4;
    const lineColor = item.lineColor || "#ff0000";
    const isEmissive = item.isEmissive || false;
    const angle = item.angle || 0;

    // Calculate vector magnitude and dimensions
    const vectorPixelCoordinates = this.hexDefinition.getPixelCoordinates(
      vectorU,
      vectorV
    );

    const magnitude = Math.sqrt(
      vectorPixelCoordinates.x * vectorPixelCoordinates.x +
      vectorPixelCoordinates.y * vectorPixelCoordinates.y
    );

    const height = this.hexDefinition.hexagon_edge_to_edge_width;
    const width = magnitude + lineWidth;
    const lineWidthRatio = lineWidth / width;

    // Create plane for the vector
    const square = babylon.MeshBuilder.CreatePlane(
      "plane",
      { width: width, height: height },
      scene
    );

    // Create material
    const material = new babylon.StandardMaterial("vectorMaterial", scene);

    if (isEmissive) {
      material.ambientColor = material.diffuseColor = material.emissiveColor = 
        new babylon.Color3(1, 1, 1);
    }

    // Create dynamic texture
    const texture = new babylon.DynamicTexture(
      "dynamic texture",
      { width: width, height: height },
      scene,
      true
    );

    material.diffuseTexture = material.emissiveTexture = texture;

    // Create canvas for drawing
    const canvas = document.createElement("canvas");
    const size = texture.getSize();
    canvas.width = size.width;
    canvas.height = size.height;
    
    this.imageDataWidth = size.width;
    this.imageDataHeight = size.height;
    
    const canvasLineWidth = lineWidthRatio * size.width;
    const offscreenContext = canvas.getContext("2d")!;
    const textureContext = texture.getContext();

    // Configure drawing context
    offscreenContext.lineWidth = canvasLineWidth;
    offscreenContext.strokeStyle = lineColor;
    offscreenContext.lineCap = "round";

    // Draw the shaft
    offscreenContext.beginPath();
    offscreenContext.moveTo(canvasLineWidth / 2, size.height / 2);
    offscreenContext.lineTo(size.width - canvasLineWidth / 2, size.height / 2);
    offscreenContext.stroke();

    // Draw arrow head - first side
    offscreenContext.beginPath();
    offscreenContext.moveTo(size.width - canvasLineWidth / 2, size.height / 2);
    offscreenContext.lineTo(
      size.width - size.height / 4,
      size.height / 2 + size.height / 4
    );
    offscreenContext.stroke();

    // Draw arrow head - second side
    offscreenContext.beginPath();
    offscreenContext.moveTo(size.width - canvasLineWidth / 2, size.height / 2);
    offscreenContext.lineTo(
      size.width - size.height / 4,
      size.height / 2 - size.height / 4
    );
    offscreenContext.stroke();

    // Save pixel array for hit testing
    this.pixelArray = offscreenContext.getImageData(
      0,
      0,
      size.width,
      size.height
    );

    // Copy from offscreen to texture
    textureContext.putImageData(this.pixelArray, 0, 0);
    texture.update(true);

    // Configure material properties
    material.emissiveTexture!.hasAlpha = true;
    material.diffuseTexture!.hasAlpha = true;
    material.backFaceCulling = false;

    square.material = material;

    // Apply rotation if specified
    if (angle) {
      square.rotation.z = angle;
    }

    // Align texture Y to 3D Y (coordinate system flip)
    square.rotation.x = Math.PI;

    // Create parent mesh for hit testing
    const parentMesh = babylon.MeshBuilder.CreateBox("Box1", { size: 0 }, scene) as VectorMesh;
    parentMesh.data = { 
      item,
      hitTestAlpha: (x: number, y: number) => {
        if (!this.pixelArray || !this.imageDataWidth || !this.imageDataHeight) {
          return false;
        }
        const pixelAlpha = this.pixelArray.data[
          (Math.floor((1 - y) * this.imageDataWidth) * this.imageDataHeight +
            Math.floor(x * this.imageDataWidth)) * 4 + 3
        ];
        return pixelAlpha !== 0;
      }
    };
    square.position.x = width / 2;

    // Set up parent-child relationship
    square.data = parentMesh.data;
    parentMesh.visibility = 0;
    square.parent = parentMesh;

    // Set metadata
    parentMesh.isGenericContextItem = true;

    return parentMesh;
  }
} 
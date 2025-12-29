import * as babylon from "babylonjs";
import hexToRgb from "../../shared/utils/HexToRGB";

interface PolygonItem {
  id?: string;
  size?: number;
  sides?: number;
  thickness?: number;
  fillColor?: string;
  color?: string;
  lineColor?: string;
  onClick?: () => void;
}

interface PolygonMesh extends babylon.Mesh {
  isGenericContextItem: boolean;
  data: {
    item: PolygonItem;
  };
}

/**
 * Factory which creates regular polygon meshes
 */
export default class RegularPolygonMeshFactory {
  private internalId: number;

  constructor() {
    this.internalId = 0;
  }

  /**
   * Convert hex color to RGB
   * @param hex - Hex color string
   * @returns RGB object
   */
  hexToRgb = hexToRgb;

  /**
   * Return a regular polygon mesh for the given object
   * @param item - The DTO to produce a Babylon.js mesh for
   * @param scene - The Babylon.js scene
   * @returns The Babylon.js Mesh for the given parameters
   */
  getMesh(item: PolygonItem, scene: babylon.Scene): PolygonMesh {
    // Default values
    const size = item.size || 20;
    const sides = item.sides || 6;
    const thickness = item.thickness || 2;
    const fillColor = item.fillColor || item.color || "#ff0000";
    
    // Create a cylinder for the polygon
    const cylinder = babylon.MeshBuilder.CreateCylinder(
      item.id || `polygon_${this.internalId}`,
      {
        diameterTop: size - thickness,
        diameterBottom: size,
        tessellation: sides,
        height: thickness,
        sideOrientation: (babylon.Mesh as any).DOUBLESIDE
      },
      scene
    ) as PolygonMesh;
    
    // Create material
    const material = new babylon.StandardMaterial(
      `polygonMaterial_${this.internalId}`,
      scene
    );
    
    // Apply color
    const rgb = this.hexToRgb(fillColor);
    
    if (rgb) {
      material.diffuseColor = new babylon.Color3(
        rgb.r / 256,
        rgb.g / 256,
        rgb.b / 256
      );
      material.ambientColor = material.diffuseColor;
    } else {
      // Fallback to red if color conversion fails
      material.diffuseColor = new babylon.Color3(1, 0, 0);
      material.ambientColor = material.diffuseColor;
    }
    
    cylinder.material = material;

    // Increment internal ID for unique naming
    this.internalId++;

    // Set metadata
    cylinder.isGenericContextItem = true;
    cylinder.data = cylinder.data || {};
    cylinder.data.item = item;

    // Apply rotations to align with the grid
    cylinder.rotation.y = -Math.PI / 2;
    cylinder.rotation.z = -Math.PI / 2;

    return cylinder;
  }
} 
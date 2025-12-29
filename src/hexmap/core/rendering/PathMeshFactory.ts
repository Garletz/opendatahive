import * as babylon from "babylonjs";
import hexToRgb from "../../shared/utils/HexToRGB";

interface HexDefinition {
  getPixelCoordinates(u: number, v: number): { x: number; y: number };
}

interface PathItem {
  id?: string;
  color?: string;
  points: [number, number][];
  width?: number;
  closed?: boolean;
  onClick?: () => void;
}

interface PathMesh extends babylon.Mesh {
  isGenericContextItem: boolean;
  data: {
    item: PathItem;
  };
}

/**
 * A factory for a path item, such as might represent where a ship has been, or various boundaries
 */
export default class PathMeshFactory {
  private hexDefinition: HexDefinition;

  constructor(hexDefinition: HexDefinition) {
    this.hexDefinition = hexDefinition;
  }

  /**
   * Convert hex color to RGB
   * @param hex - Hex color string
   * @returns RGB object
   */
  hexToRgb = hexToRgb;

  /**
   * Return a solid tubular path item for the given DTO. The path will go through the center of hexes
   * @param item - The DTO to produce a Babylon.js mesh for
   * @param scene - The Babylon.js scene
   * @returns The Babylon.js Mesh for the given parameters
   */
  getMesh(item: PathItem, scene: babylon.Scene): PathMesh | null {
    // Default values
    const color = item.color || "#ff0000";
    const width = item.width || 4;
    const closed = item.closed || false;

    // Convert the item's array of u, v points into x, y
    const points = item.points.map(point => {
      const pixelCoordinates = this.hexDefinition.getPixelCoordinates(
        point[0],
        point[1]
      );
      return new babylon.Vector3(pixelCoordinates.x, pixelCoordinates.y, 0);
    });

    if (points.length < 2) {
      console.warn('PathMeshFactory: Need at least 2 points to create a path');
      return null;
    }

    const items: babylon.Mesh[] = [];

    // Create first joint
    const firstJoint = babylon.MeshBuilder.CreateSphere(
      "sphere", 
      {
        diameter: width, 
        segments: 20
      }, 
      scene
    );
    firstJoint.position.x = points[0].x;
    firstJoint.position.y = points[0].y;
    items.push(firstJoint);

    // Create tubes and joints for each segment
    for (let i = 1; i < points.length; i++) {
      const lastPoint = points[i - 1];
      const currentPoint = points[i];

      // Create tube for the segment
      const tube = babylon.MeshBuilder.CreateTube(
        "tube",
        {
          path: [lastPoint, currentPoint],
          radius: width / 2,
          tessellation: 20
        },
        scene
      );
      items.push(tube);

      // Create joint sphere
      const joint = babylon.MeshBuilder.CreateSphere(
        "sphere", 
        {
          diameter: width, 
          segments: 20
        }, 
        scene
      );
      joint.position.x = currentPoint.x;
      joint.position.y = currentPoint.y;
      items.push(joint);
    }

    // Close the path if requested
    if (closed && points.length > 2) {
      const closingTube = babylon.MeshBuilder.CreateTube(
        "tube",
        {
          path: [points[points.length - 1], points[0]],
          radius: width / 2,
          tessellation: 20
        },
        scene
      );
      items.push(closingTube);
    }

    // Merge all meshes
    const compoundMesh = babylon.Mesh.MergeMeshes(items) as PathMesh;

    if (!compoundMesh) {
      console.warn('PathMeshFactory: Failed to merge meshes');
      return null;
    }

    // Create material
    const material = new babylon.StandardMaterial("pathMaterial", scene);
    const rgb = this.hexToRgb(color);
    if (rgb) {
      material.diffuseColor = new babylon.Color3(
        rgb.r / 256,
        rgb.g / 256,
        rgb.b / 256
      );
      material.specularColor = new babylon.Color3(
        rgb.r / 256,
        rgb.g / 256,
        rgb.b / 256
      );
      material.emissiveColor = new babylon.Color3(
        rgb.r / 256,
        rgb.g / 256,
        rgb.b / 256
      );
    }
    compoundMesh.material = material;

    // Set metadata
    compoundMesh.isGenericContextItem = true;
    compoundMesh.data = compoundMesh.data || {};
    compoundMesh.data.item = item;

    return compoundMesh;
  }
} 
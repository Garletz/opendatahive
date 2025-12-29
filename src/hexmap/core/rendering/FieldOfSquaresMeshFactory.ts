import * as babylon from "babylonjs";
import hexToRgb from "../../shared/utils/HexToRGB";

interface HexDefinition {
  hexagon_edge_to_edge_width: number;
  hexagon_half_wide_width: number;
  getReferencePoint(x: number, y: number): { u: number; v: number };
}

interface FieldItem {
  id?: string;
  onClick?: () => void;
}

interface FieldMesh extends babylon.Mesh {
  isGenericContextItem: boolean;
  data: {
    item: FieldItem;
  };
}

/**
 * Factory which creates a field of squares with some randomness. Intended for asteroids or debris fields.
 * Produces 4 squares per hex. Default orientation is point up and point down. Squares are skewed per the perspective
 */
export default class FieldOfSquaresMeshFactory {
  private hexDefinition: HexDefinition;
  private minSize: number;
  private maxSize: number;
  private colors: string[];

  constructor(hexDefinition: HexDefinition, minSize: number, maxSize: number, colors: string[]) {
    this.hexDefinition = hexDefinition;
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.colors = colors;
  }

  /**
   * Convert hex color to RGB
   * @param hex - Hex color string
   * @returns RGB object
   */
  hexToRgb = hexToRgb;

  /**
   * Return a group of items representing the field
   * @param item - The DTO to produce a Babylon.js mesh for
   * @param scene - The Babylon.js scene
   * @returns The Babylon.js Mesh for the given parameters
   */
  getMesh(item: FieldItem, scene: babylon.Scene): FieldMesh {
    // Create 4 random cubes, each located in 1 quarter of the hex

    // Start with the top left quarter
    const cube1 = this.createSquare(
      -1 * this.hexDefinition.hexagon_edge_to_edge_width / 2,
      0,
      -1 * this.hexDefinition.hexagon_half_wide_width,
      0,
      scene
    );

    // Next the top right quarter
    const cube2 = this.createSquare(
      0,
      this.hexDefinition.hexagon_edge_to_edge_width / 2,
      -1 * this.hexDefinition.hexagon_half_wide_width,
      0,
      scene
    );

    // Next bottom right quarter
    const cube3 = this.createSquare(
      0,
      this.hexDefinition.hexagon_edge_to_edge_width / 2,
      0,
      this.hexDefinition.hexagon_half_wide_width,
      scene
    );

    // Finally bottom left quarter
    const cube4 = this.createSquare(
      -1 * this.hexDefinition.hexagon_edge_to_edge_width / 2,
      0,
      0,
      this.hexDefinition.hexagon_half_wide_width,
      scene
    );

    // Create parent mesh to hold all cubes
    const parentMesh = babylon.MeshBuilder.CreateBox("Box1", { size: 0 }, scene) as FieldMesh;
    parentMesh.data = { item };
    parentMesh.visibility = 0;

    // Set all cubes as children of parent
    cube1.parent = cube2.parent = cube3.parent = cube4.parent = parentMesh;

    // Set metadata
    parentMesh.isGenericContextItem = true;
    parentMesh.data = parentMesh.data || {};
    parentMesh.data.item = item;

    return parentMesh;
  }

  /**
   * Produces a square within the given quarter of the Hex
   * @param minX - The minimum X coordinate to randomise the square's center
   * @param maxX - The maximum X coordinate to randomise the square's center
   * @param minY - The minimum Y coordinate to randomise the square's center
   * @param maxY - The maximum Y coordinate to randomise the square's center
   * @param scene - Babylon.js scene
   * @returns The square to include in the group
   */
  private createSquare(minX: number, maxX: number, minY: number, maxY: number, scene: babylon.Scene): babylon.Mesh {
    let x = this.random(minX, maxX);
    let y = this.random(minY, maxY);
    let hexCoords = this.hexDefinition.getReferencePoint(x, y);

    // The randomised co-ordinates have to be within the hex itself
    // TODO: There are faster ways to do this.
    while (hexCoords.u !== 0 || hexCoords.v !== 0) {
      x = this.random(minX, maxX);
      y = this.random(minY, maxY);
      hexCoords = this.hexDefinition.getReferencePoint(x, y);
    }

    // Pick a random shade
    const color = this.colors[this.random(0, this.colors.length - 1)];

    // Pick a random size within limits
    const size = this.random(this.minSize, this.maxSize);

    // Create box
    const box = babylon.MeshBuilder.CreateBox("Box1", { size: size }, scene);
    
    // Rotate randomly
    box.rotation.x = Math.random() * Math.PI / 2;
    box.rotation.y = Math.random() * Math.PI / 2;
    box.rotation.z = Math.random() * Math.PI / 2;
    
    // Position the box
    box.position.x = x;
    box.position.y = y;

    // Create and apply material
    const material = new babylon.StandardMaterial("textureX", scene);
    const rgb = this.hexToRgb(color);
    if (rgb) {
      material.diffuseColor = new babylon.Color3(
        rgb.r / 256,
        rgb.g / 256,
        rgb.b / 256
      );
    }
    box.material = material;

    return box;
  }

  /**
   * Helper method for generating a random number
   * @param min - The minimum number to generate
   * @param max - The maximum number to generate
   * @returns Random number between min and max
   */
  private random(min: number, max: number): number {
    return Math.round(Math.random() * (max - min) + min);
  }
} 
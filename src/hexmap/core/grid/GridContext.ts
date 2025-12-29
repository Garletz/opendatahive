/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module GridContext
 */

import * as babylon from "babylonjs";
import { HexDimensions, Context } from "../../types";

/**
 * This is the context object for creating and managing the grid layer of a board
 * @implements {Context}
 */
export default class GridContext implements Context {
  private hexDimensions: HexDimensions;

  public gridParent?: babylon.Mesh;

  constructor(hexDimensions: HexDimensions) {
    this.hexDimensions = hexDimensions;
  }

  init(scene: babylon.Scene): void {
    this.gridParent = this.createPartialMesh(scene);
    this.createGrid(this.gridParent);
  }

  updatePosition(middleX: number, middleY: number): void {
    const hexCoordinates = this.hexDimensions.getReferencePoint(middleX, middleY);
    const centerHexPixelCoordinates = this.hexDimensions.getPixelCoordinates(
      hexCoordinates.u,
      hexCoordinates.v
    );
    if (this.gridParent) {
      this.gridParent.position.x = centerHexPixelCoordinates.x;
      this.gridParent.position.y = centerHexPixelCoordinates.y;
    }
  }

  reDraw(): void {}

  private createPartialMesh(scene: babylon.Scene): babylon.Mesh {
    const zeroZeroPixelCoordinates = this.hexDimensions.getPixelCoordinates(0, 0);
    // Vertical line
    const vertical = babylon.MeshBuilder.CreateTube(
      "vertical",
      {
        path: [
          new babylon.Vector3(
            zeroZeroPixelCoordinates.x,
            zeroZeroPixelCoordinates.y + this.hexDimensions.hexagon_half_wide_width,
            0
          ),
          new babylon.Vector3(
            zeroZeroPixelCoordinates.x,
            zeroZeroPixelCoordinates.y +
              this.hexDimensions.hexagon_half_wide_width +
              2 * this.hexDimensions.hexagon_scaled_half_edge_size,
            0
          )
        ],
        radius: 2,
        tessellation: 20
      },
      scene
    );
    // Bottom right line
    const bottomRight = babylon.MeshBuilder.CreateTube(
      "bottomRight",
      {
        path: [
          new babylon.Vector3(
            zeroZeroPixelCoordinates.x,
            zeroZeroPixelCoordinates.y + this.hexDimensions.hexagon_half_wide_width,
            0
          ),
          new babylon.Vector3(
            zeroZeroPixelCoordinates.x +
              this.hexDimensions.hexagon_edge_to_edge_width / 2,
            zeroZeroPixelCoordinates.y +
              this.hexDimensions.hexagon_scaled_half_edge_size,
            0
          )
        ],
        radius: 2,
        tessellation: 20
      },
      scene
    );
    // Bottom left line
    const bottomLeft = babylon.MeshBuilder.CreateTube(
      "bottomLeft",
      {
        path: [
          new babylon.Vector3(
            zeroZeroPixelCoordinates.x,
            zeroZeroPixelCoordinates.y + this.hexDimensions.hexagon_half_wide_width,
            0
          ),
          new babylon.Vector3(
            zeroZeroPixelCoordinates.x -
              this.hexDimensions.hexagon_edge_to_edge_width / 2,
            zeroZeroPixelCoordinates.y +
              this.hexDimensions.hexagon_scaled_half_edge_size,
            0
          )
        ],
        radius: 2,
        tessellation: 20
      },
      scene
    );
    return (babylon.MeshBuilder as any).MergeMeshes([vertical, bottomRight, bottomLeft])!;
  }

  private createGrid(originalMesh: babylon.Mesh): void {
    let newInstance, pixelCoordinates;
    let u = 0;
    let v = 0;
    for (let i = 1; i < 50; i++) {
      for (v = -i; v <= 0; v++) {
        pixelCoordinates = this.hexDimensions.getPixelCoordinates(i, v);
        newInstance = (originalMesh as any).createInstance("index: " + i + ":" + v);
        newInstance.parent = originalMesh;
        newInstance.position.y = pixelCoordinates.y;
        newInstance.position.x = pixelCoordinates.x;
      }
      for (v = 0; v <= i; v++) {
        pixelCoordinates = this.hexDimensions.getPixelCoordinates(-i, v);
        newInstance = (originalMesh as any).createInstance("index: " + -i + ":" + v);
        newInstance.parent = originalMesh;
        newInstance.position.y = pixelCoordinates.y;
        newInstance.position.x = pixelCoordinates.x;
      }
      for (u = -i + 1; u <= 0; u++) {
        pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, i);
        newInstance = (originalMesh as any).createInstance("index: " + u + ":" + i);
        newInstance.parent = originalMesh;
        newInstance.position.y = pixelCoordinates.y;
        newInstance.position.x = pixelCoordinates.x;
      }
      for (u = 0; u < i; u++) {
        pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, -i);
        newInstance = (originalMesh as any).createInstance("index: " + u + ":" + -i);
        newInstance.parent = originalMesh;
        newInstance.position.y = pixelCoordinates.y;
        newInstance.position.x = pixelCoordinates.x;
      }
      for (u = -i + 1, v = -1; v > -i; u++, v--) {
        pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, v);
        newInstance = (originalMesh as any).createInstance("index: " + u + ":" + v);
        newInstance.parent = originalMesh;
        newInstance.position.y = pixelCoordinates.y;
        newInstance.position.x = pixelCoordinates.x;
      }
      for (u = i - 1, v = 1; v < i; u--, v++) {
        pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, v);
        newInstance = (originalMesh as any).createInstance("index: " + u + ":" + v);
        newInstance.parent = originalMesh;
        newInstance.position.y = pixelCoordinates.y;
        newInstance.position.x = pixelCoordinates.x;
      }
    }
  }
} 
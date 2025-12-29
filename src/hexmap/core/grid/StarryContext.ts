/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module StarryContext
 */

import * as babylon from "babylonjs";
import hexToRgb from "../../shared/utils/HexToRGB";
import { HexDimensions, Context } from "../../types";

/**
 * Ce contexte crée un fond étoilé sphérique autour de la scène.
 * @class StarryContext
 */
export default class StarryContext implements Context {

  init(_scene: babylon.Scene): void {
    // Implementation would go here
  }

  updatePosition(): void {
    // Implementation would go here
  }
  private board: any;
  private scene: babylon.Scene;
  private outerRadius: number;
  private starColors: string[] = ["#ffffff", "#ffe9c4", "#d4fbff"];
  public mesh: babylon.Mesh;

  constructor(_hexDimensions: HexDimensions, board: any, density: number) {
    this.board = board;
    this.scene = board.scene;
    this.outerRadius = board.camera.maxZ - 50;
    
    const myPositionFunction = (particle: any) => {
      const u = Math.random();
      const v = Math.random();
      const longitude = 2 * Math.PI * u;
      const colatitude = Math.acos(v - 1);
      particle.position.x =
        this.outerRadius * Math.sin(colatitude) * Math.cos(longitude);
      particle.position.y =
        this.outerRadius * Math.sin(colatitude) * Math.sin(longitude);
      particle.position.z = this.outerRadius * Math.cos(colatitude);
      const color = hexToRgb(
        this.starColors[Math.round(Math.random() * (2 - 0) + 0)]
      );
      particle.color = new babylon.Color3(
        color!.r / 256,
        color!.g / 256,
        color!.b / 256
      );
      const scale = Math.random() * 0.2 + 0.2;
      particle.scaling = new babylon.Vector3(scale, scale, scale);
    };

    const hexagon = babylon.MeshBuilder.CreateSphere("t", {diameter: 100, segments: 16}, this.scene);
    const SPS = new babylon.SolidParticleSystem("SPS", this.scene as any, {
      updatable: true,
      isPickable: false
    });
    SPS.addShape(hexagon as any, density, { positionFunction: myPositionFunction });
    SPS.billboard = true;
    const mesh = SPS.buildMesh();
    const material = new babylon.StandardMaterial("texture1", this.scene);
    material.emissiveColor = new babylon.Color3(1, 1, 1);
    mesh.material = material as any;
    this.mesh = mesh as any;
    hexagon.dispose();
    this.mesh.position.y = 1000;
    this.mesh.position.z = 1000;
    this.board.addListener("camera", (e: any) => {
      this.mesh.position.x = e.cameraX;
      this.mesh.position.y = e.cameraY;
      this.mesh.position.z = e.cameraZ;
    });
  }
} 
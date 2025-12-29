/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module InverseGridContext
 */

import * as babylon from "babylonjs";
import hexToRgb from "../../shared/utils/HexToRGB";
import { HexDimensions, Context } from "../../types";

/**
 * This context (item factory + manager) crée une grille visible composée d'hexagones semi-transparents.
 * @class InverseGridContext
 */
export default class InverseGridContext implements Context {
  private hexDimensions: HexDimensions;
  private board: any;
  private scene: babylon.Scene;
  private color: { r: number; g: number; b: number };
  private middleX: number = 0;
  private middleY: number = 0;
  private radius: number;
  private fadeRadius: number;
  private baseAlpha: number;
  public gridParent: babylon.Mesh;
  private SPS: babylon.SolidParticleSystem;
  private currentTime: number = 0;
  private renderObserver?: babylon.Observer<babylon.Scene>;
  private pulseEffectEnabled: boolean = false;
  private hexOverrides: Map<string, { height?: number; color?: { r: number; g: number; b: number } }> = new Map();
  private textMeshes: any[] = [];
  // private scene: babylon.Scene; // Cache scene reference - This line was a duplicate and is removed.

  constructor(hexDimensions: HexDimensions, board: any, color: string, radius: number, fadeRadius: number, baseAlpha: number) {
    this.hexDimensions = hexDimensions;
    this.board = board;
    this.scene = board.scene;
    this.color = hexToRgb(color)!;
    this.radius = radius;
    this.fadeRadius = fadeRadius;
    this.baseAlpha = baseAlpha;

    const positionArray = this.createPositionArray(radius + fadeRadius);
    const nb = positionArray.length;
    const myPositionFunction = (particle: any, i: number) => {
      particle.position.x = positionArray[i].x;
      particle.position.y = positionArray[i].y;
      particle.position.z = -1; // Move grid slightly behind other objects
      particle.rotation.z = Math.PI / 2;
    };

    const hexagon = babylon.MeshBuilder.CreateCylinder(
      "t",
      {
        height: 1,
        diameter: (hexDimensions.hexagon_half_wide_width - 2) * 2,
        tessellation: 6,
        sideOrientation: (babylon.Mesh as any).DOUBLESIDE
      },
      this.scene
    );

    // Orienter le cylindre vers le haut (Z) au lieu de Y
    hexagon.rotation.x = Math.PI / 2;
    hexagon.bakeCurrentTransformIntoVertices();

    const SPS = new babylon.SolidParticleSystem("SPS", this.scene as any, {
      updatable: true,
      isPickable: false
    });
    this.SPS = SPS;
    SPS.addShape(hexagon as any, nb);

    SPS.initParticles = function () {
      for (let p = 0; p < SPS.nbParticles; p++) {
        myPositionFunction(SPS.particles[p], p);
        SPS.particles[p].rotation.z = Math.PI / 2;
      }
    };

    SPS.updateParticle = (particle: any): any => {
      const distanceFromViewPoint = Math.sqrt(
        Math.pow(particle.position.x - this.middleX, 2) +
        Math.pow(particle.position.y - this.middleY, 2)
      );
      let alpha = this.baseAlpha;
      if (
        distanceFromViewPoint >
        this.radius * this.hexDimensions.hexagon_narrow_width &&
        distanceFromViewPoint <
        (this.radius + this.fadeRadius) *
        this.hexDimensions.hexagon_narrow_width
      ) {
        alpha =
          -this.baseAlpha /
          (this.fadeRadius * this.hexDimensions.hexagon_narrow_width) *
          (distanceFromViewPoint -
            this.radius * this.hexDimensions.hexagon_narrow_width) +
          this.baseAlpha;
      } else if (
        distanceFromViewPoint >=
        (this.radius + this.fadeRadius) * this.hexDimensions.hexagon_narrow_width
      ) {
        alpha = 0;
      }

      // Calculer les coordonnées monde absolues de l'hexagone
      const worldX = particle.position.x + (this.gridParent ? this.gridParent.position.x : 0);
      const worldY = particle.position.y + (this.gridParent ? this.gridParent.position.y : 0);

      // Retrouver les coordonnées logiques U,V de l'hexagone (stables)
      const hexCoords = this.hexDimensions.getReferencePoint(worldX, worldY);

      // Check for overrides (Chat Mode / API)
      const override = this.hexOverrides.get(`${hexCoords.u},${hexCoords.v}`);
      if (override) {
        if (override.color) {
          particle.color = new babylon.Color4(override.color.r / 256, override.color.g / 256, override.color.b / 256, 1.0);
        } else {
          particle.color = new babylon.Color4(this.color.r / 256, this.color.g / 256, this.color.b / 256, 1.0);
        }

        const h = override.height !== undefined ? override.height : 0.01;
        particle.scaling = new babylon.Vector3(1, 1, h);
        particle.position.z = -1 + h / 2;
        return;
      }

      // Utiliser la couleur uniforme définie pour la grille
      const baseR = this.color.r / 256;
      const baseG = this.color.g / 256;
      const baseB = this.color.b / 256;

      if (!this.pulseEffectEnabled) {
        // MODE STATIQUE (DÉFAUT)
        // On réduit l'alpha car le cylindre a deux faces superposées (haut/bas) contrairement au disque
        // Cela permet de retrouver la transparence subtile originale
        particle.color = new babylon.Color4(baseR, baseG, baseB, alpha * 0.6);
        particle.scaling = new babylon.Vector3(1, 1, 0.01); // Plat
        particle.position.z = -1;
        return;
      }

      // === EFFET DE PULSATION ===
      // 1. Pulsation globale lente (toute la grille respire)
      const globalPulse = Math.sin(this.currentTime * 0.8) * 0.15 + 0.85; // 0.7 to 1.0

      // 2. Vague radiale depuis le centre (effet d'onde)
      const distance = Math.sqrt(worldX * worldX + worldY * worldY);
      const wavePhase = distance * 0.003 - this.currentTime * 2.0;
      const wavePulse = Math.sin(wavePhase) * 0.2 + 1.0; // 0.8 to 1.2

      // 3. Variation individuelle par hexagone (shimmer effect)
      const hexPhase = (hexCoords.u + hexCoords.v) * 0.5;
      const hexPulse = Math.sin(this.currentTime * 1.5 + hexPhase) * 0.1 + 1.0; // 0.9 to 1.1

      // Combiner les effets
      const pulseMultiplier = globalPulse * wavePulse * hexPulse;

      // Appliquer la pulsation à la couleur (intensité)
      const r = Math.min(1.0, baseR * pulseMultiplier);
      const g = Math.min(1.0, baseG * pulseMultiplier);
      const b = Math.min(1.0, baseB * pulseMultiplier);

      // Pulsation de l'alpha également pour un effet plus prononcé
      const alphaPulse = Math.sin(this.currentTime * 1.2 + hexPhase * 0.3) * 0.1 + 1.0;
      const finalAlpha = alpha * Math.min(1.0, alphaPulse);

      particle.color = new babylon.Color4(r, g, b, finalAlpha);

      // === EFFET D'ÉLÉVATION 3D (Extrusion) ===
      // Chaque hexagone a son propre cycle d'animation basé sur ses coordonnées
      const elevationSeed = Math.sin(hexCoords.u * 17.3 + hexCoords.v * 51.7) * 100;
      const elevationPhase = this.currentTime * 0.6 + elevationSeed;

      // Fonction de hauteur : monte et descend progressivement
      // On utilise sin² pour avoir un mouvement plus doux (accélération/décélération)
      const heightCycle = Math.sin(elevationPhase);
      const heightFactor = Math.max(0, heightCycle); // Seulement les valeurs positives (0 à 1)
      const smoothHeight = heightFactor * heightFactor; // Courbe quadratique pour plus de réalisme

      // Hauteur maximale d'élévation (ajustable)
      const maxElevation = 50;

      // L'hexagone de base (flat) a une épaisseur minimale (0.1 ou plus petit)
      const minHeight = 0.5;
      const currentHeight = minHeight + smoothHeight * maxElevation;

      // Scaling Z pour "extruder" le prisme (le mesh de base a une hauteur de 1)
      particle.scaling = new babylon.Vector3(1, 1, currentHeight);

      // Position Z: 
      // Base à Z = -1. 
      // Le centre du cylindre (pivot) est à height/2 relatif à sa base.
      // Donc pour que la base reste à -1, le centre doit être à -1 + height/2
      particle.position.z = -1 + currentHeight / 2;
    };

    const mesh = SPS.buildMesh();
    mesh.hasVertexAlpha = true;
    SPS.initParticles();
    SPS.setParticles();
    this.gridParent = mesh as any;

    const material = new babylon.StandardMaterial("texture1", this.scene);
    material.emissiveColor = new babylon.Color3(1, 1, 1);
    mesh.material = material as any;

    // Ensure grid is not pickable and always visible
    (mesh as any).isPickable = false;
    (mesh as any).visibility = 1.0;

    hexagon.dispose();

    // Hook into render loop for animation
    this.renderObserver = this.scene.onBeforeRenderObservable.add(() => {
      this.currentTime += 0.016; // ~60fps (increment by frame delta)
      this.SPS.setParticles();
    });

    this.board.addListener("pan", (e: any) => {
      const hexCoordinates = this.hexDimensions.getReferencePoint(
        e.middleX,
        e.middleY
      );
      const centerHexPixelCoordinates = this.hexDimensions.getPixelCoordinates(
        hexCoordinates.u,
        hexCoordinates.v
      );
      this.gridParent.position.x = centerHexPixelCoordinates.x;
      this.gridParent.position.y = centerHexPixelCoordinates.y;
      this.middleX = e.middleX - centerHexPixelCoordinates.x;
      this.middleY = e.middleY - centerHexPixelCoordinates.y;
      // setParticles now called in render loop
    });
  }

  public setColor(color: string): void {
    const rgb = hexToRgb(color);
    if (rgb) {
      this.color = rgb;
      this.SPS.setParticles();
    }
  }

  public setPulseEffect(enabled: boolean): void {
    this.pulseEffectEnabled = enabled;
  }

  public setHexOverride(u: number, v: number, height?: number, color?: string): void {
    console.log('[Context] setHexOverride', u, v, height, color);
    const override = this.hexOverrides.get(`${u},${v}`) || {};
    if (height !== undefined) override.height = height;
    if (color) {
      const rgb = hexToRgb(color);
      if (rgb) override.color = rgb;
    }
    this.hexOverrides.set(`${u},${v}`, override);
    this.SPS.setParticles();
  }

  public clearHexOverrides(): void {
    this.hexOverrides.clear();
    // Clear 3D texts
    this.textMeshes.forEach(mesh => mesh.dispose());
    this.textMeshes = [];

    this.SPS.setParticles();
  }

  public spawnText(u: number, v: number, text: string, color: string = "#ffffff"): void {
    // Get world position
    const coords = this.hexDimensions.getPixelCoordinates(u, v);

    // Create a plane
    const planeSize = 40;
    const plane = babylon.MeshBuilder.CreatePlane("text_" + u + "_" + v, { size: planeSize }, this.scene);
    plane.position.x = coords.x;
    plane.position.y = coords.y;
    plane.position.z = -30;

    // Billboard to face camera (Mode 7 = All)
    plane.billboardMode = 7;

    // Dynamic Texture
    const textureSize = 512;
    const dt = new babylon.DynamicTexture("dt_" + text, { width: textureSize, height: textureSize / 2 }, this.scene);
    dt.hasAlpha = true;

    const font = "bold 80px monospace";
    (dt as any).drawText(text, null, null, font, color, "transparent", true);

    const mat = new babylon.StandardMaterial("mat_" + text, this.scene);
    mat.diffuseTexture = dt;
    (mat as any).useAlphaFromDiffuseTexture = true;
    mat.emissiveColor = new babylon.Color3(1, 1, 1);
    mat.disableLighting = true;
    mat.backFaceCulling = false;

    plane.material = mat;
    plane.isPickable = false;

    this.textMeshes.push(plane);
  }

  private createPositionArray(radius: number): { x: number; y: number }[] {
    const positionArray: { x: number; y: number }[] = [];
    let pixelCoordinates;
    let u = 0;
    let v = 0;
    positionArray.push({ y: 0, x: 0 });
    for (let i = 1; i < radius + 1; i++) {
      for (v = -i; v <= 0; v++) {
        pixelCoordinates = this.hexDimensions.getPixelCoordinates(i, v);
        positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
      }
      for (v = 0; v <= i; v++) {
        pixelCoordinates = this.hexDimensions.getPixelCoordinates(-i, v);
        positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
      }
      for (u = -i + 1; u <= 0; u++) {
        pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, i);
        positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
      }
      for (u = 0; u < i; u++) {
        pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, -i);
        positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
      }
      for (u = -i + 1, v = -1; v > -i; u++, v--) {
        pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, v);
        positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
      }
      for (u = i - 1, v = 1; v < i; u--, v++) {
        pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, v);
        positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
      }
    }
    return positionArray;
  }

  init(_scene: babylon.Scene): void {
    // Already initialized in constructor
  }

  updatePosition(): void {
    // Already handled in constructor via event listener
  }
} 
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module hexagonal-map
 */

import * as babylon from "babylonjs";
import hexToRgb from "../../shared/utils/HexToRGB";
import EventEmitter from "wolfy87-eventemitter";
import { HexDimensions, CameraMode, CameraEvent, PanEvent, MouseEvent } from "../../types";

/**
 * Initializes the Babylon.js scene, delegates mouse control, provides an API to control the camera relative to the X/Y plane
 */
export default class HexBoard extends EventEmitter {
  public engine: babylon.Engine;
  public scene: babylon.Scene;
  public camera: babylon.ArcRotateCamera;
  public postProcess: babylon.FxaaPostProcess;
  public pickerPlane: babylon.Plane;
  public hexDimensions?: HexDimensions;

  // Camera control variables
  private cameraTargetX: number = 0;
  private cameraTargetY: number = 0;
  private cameraAlpha: number = Math.PI / 4;
  private cameraBeta: number = 0;
  private cameraRadius: number = Math.sqrt(1000 * 1000 + 1000 * 1000);
  private mode: CameraMode = 'pan';
  private window: Window;
  private pointerObserver?: babylon.Observer<babylon.PointerInfo>;
  private resizeHandler?: () => void;

  constructor(canvas: HTMLCanvasElement, window: Window, backgroundColor: string) {
    super();

    this.window = window;

    //Setup babylonjs
    this.engine = new babylon.Engine(canvas, true);

    //Run the engines render loop
    this.engine.runRenderLoop(() => {
      if (this.scene) {
        (this.scene as any).render();
      }
    });

    this.scene = new (babylon as any).Scene(this.engine);

    // Change the scene background color
    const rgb = hexToRgb(backgroundColor);
    if (rgb) {
      (this.scene as any).clearColor = new babylon.Color3(
        rgb.r / 256,
        rgb.g / 256,
        rgb.b / 256
      );
    }

    // And give it an ambient color
    (this.scene as any).ambientColor = new babylon.Color3(0.3, 0.3, 0.3);

    // Create an ArcRotateCamera aimed at 0,0,0
    this.camera = new (babylon as any).ArcRotateCamera(
      "ArcRotateCamera",
      0,
      0,
      0,
      ((babylon as any).Vector3.Zero()) as any,
      this.scene
    );

    //Set up anti-aliasing (required in babylon.js 3.0+)
    this.postProcess = new babylon.FxaaPostProcess("fxaa", 1.0, this.camera);
    this.camera.upVector = new (babylon.Vector3 as any)(0, 0, 1);

    this.camera.upperBetaLimit = Math.PI;
    this.camera.allowUpsideDown = true;

    //Make an invisible plane to hit test for the scene's X, Y co-ordinates
    this.pickerPlane = new babylon.Plane(0, 0, 1, 0); // Plan Z=0



    // This targets the camera to scene origin
    this.camera.setTarget(((babylon as any).Vector3.Zero()) as any);

    // Camera control variables
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastUpdateTime = 0;
    const THROTTLE_MS = 16; // 60fps

    // Cache for performance optimizations
    const ZERO_PLANE = new babylon.Plane(0, 0, 1, 0);

    // Watch for browser/canvas resize events
    if (window) {
      this.resizeHandler = () => {
        this.engine.resize();

        //recenter
        //Figure out what the old U, V in the middle was for our original size
        if (this.hexDimensions) {
          const hexagonalCoordinates = this.hexDimensions.getReferencePoint(
            this.cameraTargetX,
            this.cameraTargetY
          );

          this.centerOnCell(hexagonalCoordinates.u, hexagonalCoordinates.v);
        }
      };
      window.addEventListener("resize", this.resizeHandler);
    }

    // Babylon.js Pointer Observer for mouse/touch events
    this.pointerObserver = (this.scene as any).onPointerObservable.add((pointerInfo: any) => {
      switch (pointerInfo.type) {
        case babylon.PointerEventTypes.POINTERDOWN:
          isDragging = true;
          lastPointerX = pointerInfo.event.clientX;
          lastPointerY = pointerInfo.event.clientY;
          break;

        case babylon.PointerEventTypes.POINTERUP: {
          isDragging = false;
          const pickInfo = pointerInfo.pickInfo;
          const clickedItem = pickInfo && pickInfo.pickedMesh ? pickInfo.pickedMesh : null;
          let mapX: number | null = null, mapY: number | null = null;

          if (pickInfo && pickInfo.pickedPoint) {
            mapX = pickInfo.pickedPoint.x;
            mapY = pickInfo.pickedPoint.y;
          } else {
            // Si pas d'objet, calculer l'intersection du rayon avec le plan Z=0
            const scene = this.scene;
            const camera = this.camera;
            const canvas = (scene as any).getEngine().getRenderingCanvas();
            const pointerEvent = pointerInfo.event;
            const rect = canvas!.getBoundingClientRect();
            const x = pointerEvent.clientX - rect.left;
            const y = pointerEvent.clientY - rect.top;
            const ray = (scene as any).createPickingRay(x, y, babylon.Matrix.Identity(), camera, false);
            const pickedPoint = this.intersectRayPlane(ray, ZERO_PLANE);

            if (pickedPoint) {
              mapX = pickedPoint.x;
              mapY = pickedPoint.y;
            }
          }

          const mouseEvent: MouseEvent = {
            canvasX: pointerInfo.event.clientX,
            canvasY: pointerInfo.event.clientY,
            mapX: mapX,
            mapY: mapY,
            clickedItem: clickedItem,
            mouseMoved: false
          };

          (this as any).emit("mouseUp", mouseEvent);
          break;
        }

        case babylon.PointerEventTypes.POINTERMOVE:
          if (isDragging) {
            // Throttling pour éviter trop d'appels
            const now = Date.now();
            if (now - lastUpdateTime < THROTTLE_MS) return;
            lastUpdateTime = now;

            const dx = pointerInfo.event.clientX - lastPointerX;
            const dy = pointerInfo.event.clientY - lastPointerY;
            lastPointerX = pointerInfo.event.clientX;
            lastPointerY = pointerInfo.event.clientY;

            // Appelle la bonne méthode selon le mode
            switch (this.mode) {
              case 'pan':
                this.pan(-dy, dx); // Correction pour que le drag horizontal soit intuitif
                break;
              case 'tilt':
                this.tilt(Math.PI * (dx + dy) / 500);
                break;
              case 'spin':
                this.spin(Math.PI * (dx + dy) / 500);
                break;
              case 'zoom':
                this.zoom((dx + dy) * 5);
                break;
              default:
                break;
            }
          }
          break;
      }
    });

    //Call the function to set the camera's position now the function is defined
    this.updateCameraPosition();
  }

  /**
   * Clears the canvas so the HexBoard may be re-used
   */
  clear(): void {
    // Clean up Babylon.js observers
    if (this.pointerObserver) {
      (this.scene as any).onPointerObservable.remove(this.pointerObserver);
      this.pointerObserver = undefined;
    }

    // Clean up event listeners
    if (this.resizeHandler && this.window) {
      this.window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = undefined;
    }

    // Clean up Babylon.js scene
    (this.scene as any).dispose();
  }

  /**
   * Initializes the groups and objects from the contexts, plus the drag variables
   */
  init(): void {
    // This creates a light, aiming 0,1,0 - to the sky.
    const light = new (babylon as any).PointLight(
      "light1",
      new (babylon as any).Vector3(0, 0, 1),
      this.scene
    );

    // Dim the light a small amount
    light.intensity = 0.5;
  }

  /**
   * Set the hexDimensions object used for centering the screen on a cell
   * @param hexDimensions - The DTO defining the hex <--> cartesian relation
   */
  setHexDimensions(hexDimensions: HexDimensions): void {
    this.hexDimensions = hexDimensions;
  }

  /**
   * Set the background color of the scene
   * @param color - Hex color string (e.g. "#000000")
   */
  setBackgroundColor(color: string): void {
    const rgb = hexToRgb(color);
    if (rgb && this.scene) {
      (this.scene as any).clearColor = new babylon.Color3(
        rgb.r / 256,
        rgb.g / 256,
        rgb.b / 256
      );
    }
  }

  /**
   * Set camera mode (pan, tilt, spin, zoom)
   */
  setMode(mode: CameraMode): void {
    this.mode = mode;
  }

  /**
   * Internal shared functionallity of paning, updates the camera and emits an event
   */
  updatePosition(): void {
    this.camera.target.x = this.cameraTargetX;
    this.camera.target.y = this.cameraTargetY;
    this.updateCameraPosition();
    const panEvent: PanEvent = { middleX: this.cameraTargetX, middleY: this.cameraTargetY };
    (this as any).emit("pan", panEvent);
  }

  /**
   * Updates the camera's position (not the target) based on alpha, beta, and radius
   */
  updateCameraPosition(): void {
    // Vérifier si les valeurs ont changé pour éviter les recalculs inutiles
    if (this.camera.alpha !== this.cameraBeta ||
      this.camera.beta !== this.cameraAlpha ||
      this.camera.radius !== this.cameraRadius ||
      this.camera.target.x !== this.cameraTargetX ||
      this.camera.target.y !== this.cameraTargetY) {

      // Met à jour directement les propriétés de l'ArcRotateCamera (Babylon.js 5.x)
      this.camera.alpha = this.cameraBeta;
      this.camera.beta = this.cameraAlpha;
      this.camera.radius = this.cameraRadius;
      this.camera.target.x = this.cameraTargetX;
      this.camera.target.y = this.cameraTargetY;

      const cameraEvent: CameraEvent = {
        cameraX: this.camera.position.x,
        cameraY: this.camera.position.y,
        cameraZ: this.camera.position.z
      };
      (this as any).emit("camera", cameraEvent);
    }
  }

  /**
   * Pans the camera along the plane of interest by the given amounts
   * Takes into account the camera's current rotation (spin)
   */
  pan(dx: number, dy: number): void {
    // Transform the movement vector from screen space to world space
    // When camera is rotated, screen X/Y need to be transformed to world X/Y

    // Get the camera's current rotation
    const cosBeta = Math.cos(this.cameraBeta);
    const sinBeta = Math.sin(this.cameraBeta);

    // Transform the movement vector from screen space to world space
    const worldDx = dx * cosBeta + dy * sinBeta;
    const worldDy = -dx * sinBeta + dy * cosBeta;

    this.cameraTargetX = this.cameraTargetX + worldDx;
    this.cameraTargetY = this.cameraTargetY + worldDy;
    this.updatePosition();
  }

  /**
   * Tilts the camera over the plane of interest
   */
  tilt(dAlpha: number): void {
    this.cameraAlpha = this.cameraAlpha + dAlpha;
    this.cameraAlpha = Math.max(this.cameraAlpha, Math.PI / 6);
    this.cameraAlpha = Math.min(this.cameraAlpha, Math.PI / 2 - Math.PI / 360);
    this.updateCameraPosition();
  }

  /**
   * Spins the camera around the Z axis
   */
  spin(dBeta: number): void {
    this.cameraBeta = this.cameraBeta + dBeta;
    this.updateCameraPosition();
  }

  /**
   * Zooms the camera towards and away from the target point
   */
  zoom(dRadius: number): void {
    this.cameraRadius = this.cameraRadius + dRadius;
    this.cameraRadius = Math.max(this.cameraRadius, 100); // Don't go negative
    this.updateCameraPosition();
  }

  /**
   * Reset camera rotation to default orientation
   */
  resetRotation(): void {
    this.cameraBeta = 0;
    this.updateCameraPosition();
  }

  /**
   * Get current camera rotation angle in degrees
   */
  getRotationAngle(): number {
    return (this.cameraBeta * 180) / Math.PI;
  }

  /**
   * Set camera rotation to a specific angle in degrees
   */
  setRotationAngle(angleInDegrees: number): void {
    this.cameraBeta = (angleInDegrees * Math.PI) / 180;
    this.updateCameraPosition();
  }

  /**
   * Utility function to center the board on a cell
   */
  centerOnCell(u: number, v: number): void {
    if (!this.hexDimensions) return;

    const pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, v);
    this.cameraTargetX = pixelCoordinates.x;
    this.cameraTargetY = pixelCoordinates.y;
    this.updatePosition();
  }

  /**
   * Helper function to get intersection between ray and plane
   */
  intersectRayPlane(pRay: babylon.Ray, pPlane: babylon.Plane): babylon.Vector3 | null {
    let tIsecPoint: babylon.Vector3 | null = null;
    const tDot = (babylon.Vector3 as any).Dot(pRay.direction, pPlane.normal);
    if (tDot !== 0.0) {
      const t = -pPlane.signedDistanceTo(pRay.origin) / tDot;
      if (t >= 0.0) {
        const tDirS = pRay.direction.scale(t);
        tIsecPoint = pRay.origin.add(tDirS);
      }
    }
    return tIsecPoint;
  }
} 
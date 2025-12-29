import React, { Component, createRef, RefObject } from "react";
import HexBoard from "../core/engine/HexBoard";
import HexDefinition from "../shared/utils/cartesian-hexagonal";
import GridContext from "../core/grid/InverseGridContext";
import EmittingDataSource from "data-chains/src/EmittingDataSource.js";
import SphereMeshFactory from "../core/rendering/SphereMeshFactory";
import TorusMeshFactory from "../core/rendering/TorusMeshFactory";
import ArrowMeshFactory from "../core/rendering/ArrowMeshFactory";
import ItemMappingPipelineNode from "../core/rendering/ItemMappingPipelineNode";
import PlanarPositioningPipelineNode from "../core/rendering/PlanarPositioningPipelineNode";
import ZStackingPipelineNode from "../core/rendering/ZStackingPipelineNode";
import FieldOfSquaresMeshFactory from "../core/rendering/FieldOfSquaresMeshFactory";
import RegularPolygonMeshFactory from "../core/rendering/RegularPolygonMeshFactory";
import MdMeshFactory from "../core/rendering/fileMeshes/md/MdMeshFactory";
import Mp3MeshFactory from "../core/rendering/fileMeshes/mp3/Mp3MeshFactory";
import CsvMeshFactory from "../core/rendering/fileMeshes/csv/CsvMeshFactory";
import PdfMeshFactory from "../core/rendering/fileMeshes/pdf/PdfMeshFactory";
import PngMeshFactory from "../core/rendering/fileMeshes/png/PngMeshFactory";
import JsonMeshFactory from "../core/rendering/fileMeshes/json/JsonMeshFactory";
import WebpMeshFactory from "../core/rendering/fileMeshes/webp/WebpMeshFactory";
import WebmMeshFactory from "../core/rendering/fileMeshes/webm/WebmMeshFactory";
import XmlMeshFactory from "../core/rendering/fileMeshes/xml/XmlMeshFactory";
import GlbMeshFactory from "../core/rendering/fileMeshes/glb/GlbMeshFactory";
import GraphmlMeshFactory from "../core/rendering/fileMeshes/graphml/GraphmlMeshFactory";
import OdhcMeshFactory from "../core/rendering/fileMeshes/odhc/OdhcMeshFactory";
import TwoDVectorMeshFactory from "../core/rendering/TwoDVectorMeshFactory";
import VectorDecoratingPipelineNode from "../core/rendering/VectorDecoratingPipelineNode";
import EventEmitter from "wolfy87-eventemitter";
import { MapProps as BaseMapProps, CameraMode, GameItem } from "../types";
import '../styles/styles.css';
import { Octo as OctoType } from '@/types';
import StarryContext from '../core/grid/StarryContext';
import { ChatPanel } from '../../components/ChatPanel';
import { GridAction } from '../../services/MistralService';
import { motion } from "framer-motion";
import { HexArchitect } from "../core/logic/HexArchitect";
// getAllUsersWithUV and useGun imports removed as they're not used

interface MapProps extends BaseMapProps {
  octos?: OctoType[];
  projectNodes?: any[]; // HiveNode[] but using any to avoid import cycles defined in types
  activeProject?: any;
  onOctoClick?: (octo: OctoType) => void;
  onShowOctos?: () => void;
  showAllUsers?: boolean; // Nouveau prop pour afficher tous les utilisateurs
  gun?: any; // Prop pour accéder à GunDB
  viewMode?: 'public' | 'personal' | 'all-users' | 'chat'; // Mode actuel pour détecter les changements
  onUserClick?: (userId: string) => void; // Callback pour clic sur utilisateur
}

interface MapState {
  mode: CameraMode;
  showAddObjectPanel: boolean;
  selectedObjectType: GameItem['type'];
  rotationAngle: number;
  showOctos: boolean;
  infoPanelHeight: number;
  isMobile: boolean;
  gridColor: string;
  backgroundColor: string;
  showSettingsPanel: boolean;
  pulseEffect: boolean;
}

function arraysEqualById(a?: any[], b?: any[]) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return false;
  }
  return true;
}

class Map extends Component<MapProps, MapState> {
  private canvasRef: RefObject<HTMLCanvasElement | null>;
  private hexBoard?: HexBoard;
  private gridContext?: GridContext;
  private pipelineStart?: EmittingDataSource;
  private resizeListener?: () => void;
  private itemMappingPipelineNode?: any; // Ajout de la référence
  private zStackingPipelineNode?: any; // Ajout de la référence
  // starryContext is created for future use (background stars effect)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _starryContext?: StarryContext; // Référence potentielle pour le fond étoilé (non utilisée)
  infoPanelRef: RefObject<HTMLDivElement | null> = createRef();

  constructor(props: MapProps) {
    super(props);
    this.state = {
      mode: "pan",
      showAddObjectPanel: false,
      selectedObjectType: "planet" as GameItem['type'],
      rotationAngle: 0,
      showOctos: false,
      infoPanelHeight: 0,
      isMobile: window.innerWidth < 768,
      gridColor: "#808080",
      backgroundColor: "#000000",
      showSettingsPanel: false,
      pulseEffect: false,
    };
    this.canvasRef = createRef();
  }

  render(): React.JSX.Element {
    const headerHeight = 80; // Hauteur du header (à ajuster si besoin)
    const infoPanelTop = headerHeight + 20;
    const infoPanelRight = 20;
    // const controlsPanelTop = infoPanelTop + this.state.infoPanelHeight + 20; // Variable not used
    const { isMobile } = this.state;
    return (
      <div style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        top: 0,
        left: 0,
        overflow: "hidden"
      }}>
        <canvas
          ref={this.canvasRef}
          tabIndex={0}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: "#0a0a0a",
            width: "100%",
            height: "100%",
            zIndex: 200,
            pointerEvents: "auto"
          }}
        />

        {/* Settings Panel */}
        {this.state.showSettingsPanel && (
          <div style={{
            position: "absolute",
            top: "120px",
            right: "160px",
            zIndex: 500,
            background: "rgba(0, 0, 0, 0.6)",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
            minWidth: "220px",
            color: "#e2e8f0"
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Grid Appearance</span>
              <button onClick={() => this.setState({ showSettingsPanel: false })} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}>×</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>Background</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(30, 41, 59, 0.5)', padding: '8px', borderRadius: '8px' }}>
                <input
                  type="color"
                  value={this.state.backgroundColor}
                  onChange={(e) => this.setBackgroundColor(e.target.value)}
                  style={{ background: 'none', border: 'none', width: '24px', height: '24px', cursor: 'pointer', padding: 0 }}
                />
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#cbd5e1' }}>{this.state.backgroundColor}</span>
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>Hex Grid</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(30, 41, 59, 0.5)', padding: '8px', borderRadius: '8px' }}>
                <input
                  type="color"
                  value={this.state.gridColor}
                  onChange={(e) => this.setGridColor(e.target.value)}
                  style={{ background: 'none', border: 'none', width: '24px', height: '24px', cursor: 'pointer', padding: 0 }}
                />
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#cbd5e1' }}>{this.state.gridColor}</span>
              </div>
            </div>
          </div>
        )}

        {/* Chat Panel (Architect Mode) */}
        {this.props.viewMode === 'chat' && !isMobile && (
          <ChatPanel onAction={this.handleChatAction} />
        )}

        {/* Controls Panel */}
        {!isMobile && (
          <motion.div
            drag
            dragMomentum={false}
            style={{
              position: "absolute",
              top: "60%",
              right: `${infoPanelRight}px`,
              zIndex: 400,
              background: "rgba(0, 0, 0, 0.4)",
              padding: "10px",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(8px)",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              minWidth: "120px"
            }}>
            <div style={{
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#e2e8f0"
            }}>
              Controls
            </div>

            <button
              type="button"
              className={`custom-btn ${this.state.pulseEffect ? "custom-btn-primary" : ""}`}
              onClick={this.togglePulseEffect}
              style={{ marginBottom: "6px", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span>✨</span> Effects
            </button>

            <button
              type="button"
              className={`custom-btn ${this.state.showSettingsPanel ? "custom-btn-primary" : ""}`}
              onClick={() => this.setState({ showSettingsPanel: !this.state.showSettingsPanel })}
              style={{ marginBottom: "10px", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span>🎨</span> Theme
            </button>
            <button
              type="button"
              className={`custom-btn ${this.state.mode === "pan" ? "custom-btn-primary" : ""}`}
              onClick={() => this.setMode("pan")}
              style={{ marginBottom: "6px" }}>Pan</button>
            <button
              type="button"
              className={`custom-btn ${this.state.mode === "tilt" ? "custom-btn-primary" : ""}`}
              onClick={() => this.setMode("tilt")}
              style={{ marginBottom: "6px" }}>Tilt</button>
            <button
              type="button"
              className={`custom-btn ${this.state.mode === "spin" ? "custom-btn-primary" : ""}`}
              onClick={() => this.setMode("spin")}
              style={{ marginBottom: "6px" }}>Spin</button>
            <button
              type="button"
              className={`custom-btn ${this.state.mode === "zoom" ? "custom-btn-primary" : ""}`}
              onClick={() => this.setMode("zoom")}
              style={{ marginBottom: "10px" }}>Zoom</button>
            <hr style={{ margin: "10px 0", border: "1px solid #334155" }} />
            <button
              type="button"
              className="custom-btn custom-btn-warning"
              onClick={() => { if (this.hexBoard) { this.hexBoard.resetRotation(); } }}
              style={{ fontSize: "0.8em", marginBottom: "6px" }}>
              Reset Rotation
            </button>
            <div style={{
              fontSize: "0.8em",
              textAlign: "center",
              marginTop: "5px",
              color: "#94a3b8"
            }}>
              Angle: {this.state.rotationAngle || 0}°
            </div>
          </motion.div>
        )}

      </div>
    );
  }

  resizeCanvas(canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  togglePulseEffect = () => {
    const newState = !this.state.pulseEffect;
    this.setState({ pulseEffect: newState });
    if (this.gridContext) {
      (this.gridContext as any).setPulseEffect(newState);
    }
  }

  setGridColor(color: string) {
    this.setState({ gridColor: color });
    if (this.gridContext) {
      this.gridContext.setColor(color);
    }
  }

  handleChatAction = (rawAction: GridAction | any) => {
    console.log('[Map] handleChatAction RAW:', rawAction);
    if (!this.gridContext) return;
    const context = this.gridContext as any; // Cast to access custom methods

    let type = rawAction.type;
    let params = rawAction;

    // Normalize AI response variations
    if (!type) {
      if (rawAction.command) {
        type = rawAction.command;
        params = rawAction.parameters || {};
      }
      else if (rawAction.set_color) { type = 'set_color'; params = rawAction.set_color; }
      else if (rawAction.set_height) { type = 'set_height'; params = rawAction.set_height; }
      else if (rawAction.spawn_text) { type = 'spawn_text'; params = rawAction.spawn_text; }
      // Supports both { draw_line: {...} } and { command: "draw_line" }
      else if (rawAction.draw_line) { type = 'draw_line'; params = rawAction.draw_line; }
      else if (rawAction.draw_area) { type = 'draw_area'; params = rawAction.draw_area; }
      else if (rawAction.draw_ring) { type = 'draw_ring'; params = rawAction.draw_ring; }
      else if (rawAction.clear) { type = 'clear'; params = {}; }
    }

    console.log('[Map] Normalized Action:', type, params);

    if (type === 'set_height' && params.u !== undefined && params.v !== undefined) {
      context.setHexOverride(params.u, params.v, params.height, params.color);
    }
    else if (type === 'set_color' && params.u !== undefined && params.v !== undefined) {
      context.setHexOverride(params.u, params.v, undefined, params.color);
    }
    else if (type === 'spawn_text' && params.u !== undefined && params.v !== undefined && params.text) {
      context.spawnText(params.u, params.v, params.text, params.color);
    }
    // High-Level Shapes
    else if (type === 'draw_area' && params.u !== undefined && params.v !== undefined) {
      const hexes = HexArchitect.getFilledHexagon({ u: params.u, v: params.v }, params.radius || 1);
      hexes.forEach(h => context.setHexOverride(h.u, h.v, params.height, params.color));
    }
    else if (type === 'draw_ring' && params.u !== undefined && params.v !== undefined) {
      const hexes = HexArchitect.getRing({ u: params.u, v: params.v }, params.radius || 1);
      hexes.forEach(h => context.setHexOverride(h.u, h.v, params.height, params.color));
    }
    else if (type === 'draw_line' && params.u !== undefined && params.v !== undefined && params.u2 !== undefined && params.v2 !== undefined) {
      const hexes = HexArchitect.getLine({ u: params.u, v: params.v }, { u: params.u2, v: params.v2 });
      hexes.forEach(h => context.setHexOverride(h.u, h.v, params.height, params.color));
    }
    else if (type === 'clear') {
      context.clearHexOverrides();
    }
  }

  setBackgroundColor(color: string) {
    this.setState({ backgroundColor: color });
    if (this.hexBoard) {
      this.hexBoard.setBackgroundColor(color);
    }
  }

  setMode(mode: CameraMode): void {
    this.setState({ mode });
    if (this.hexBoard) {
      this.hexBoard.setMode(mode);
    }
  }

  componentDidMount(): void {
    const canvas = this.canvasRef.current;
    if (!canvas) return;

    console.log("canvasRef in componentDidMount", canvas);
    this.resizeCanvas(canvas);

    const resizeFunction = () => {
      if (this.canvasRef.current) {
        this.resizeCanvas(this.canvasRef.current);
      }
    };
    this.resizeListener = resizeFunction;
    window.addEventListener("resize", this.resizeListener);

    // Log global pour debug propagation mousedown
    document.addEventListener('mousedown', e => {
      console.log('mousedown global', e);
    });

    // Initialize HexBoard
    this.hexBoard = new HexBoard(canvas, window, "#000000");
    // Set up hex dimensions for coordinate system
    const hexDimensions = new HexDefinition(55, 1, 0, 3);
    this.hexBoard.setHexDimensions(hexDimensions);
    // Ajout du fond étoilé
    // Densité d'étoiles ajustable (ex: 300)
    // Note: starryContext est créé mais actuellement non utilisé - prévu pour future implémentation
    this._starryContext = new StarryContext(hexDimensions, this.hexBoard, 300);
    // Read once to satisfy noUnusedLocals
    void this._starryContext;

    // Setup grid context for hexagonal grid
    this.gridContext = new GridContext(
      hexDimensions,
      this.hexBoard,
      "#808080",
      15,
      15,
      0.5,
    );

    // Setup rendering pipeline
    // Ajoute l'animation de rotation pour les meshes qui doivent tourner
    if (this.hexBoard && this.hexBoard.scene && this.hexBoard.scene.onBeforeRenderObservable) {
      this.hexBoard.scene.onBeforeRenderObservable.add(() => {
        (this.hexBoard.scene.meshes as any[]).forEach((mesh: any) => {
          if (mesh.shouldSpin) {
            mesh.rotation.x += 0.045; // vitesse de rotation X
            mesh.rotation.y += 0.07;  // vitesse de rotation Y
            mesh.rotation.z += 0.055; // vitesse de rotation Z
          }
        });
      });
    }
    const pipelineStart = new EmittingDataSource();

    // Create mesh factories
    const sphereMeshFactory = new SphereMeshFactory(hexDimensions);
    const torusMeshFactory = new TorusMeshFactory();
    const arrowMeshFactory = new ArrowMeshFactory(hexDimensions);
    const twoDVectorMeshFactory = new TwoDVectorMeshFactory(hexDimensions);
    const regularPolygonMeshFactory = new RegularPolygonMeshFactory();
    const fieldOfSquaresMeshFactory = new FieldOfSquaresMeshFactory(
      hexDimensions,
      9,
      20,
      ["#8d8468", "#86775f", "#7a6a4f", "#7f7053"]
    );

    // Setup item mapping
    const itemMap: Record<string, (item: GameItem, scene: any) => any> = {};

    // Mapping pour les objets sphériques (planètes, étoiles, lunes)
    itemMap.planet = itemMap.moon = itemMap.star = (item: GameItem, scene: any) => {
      // Add additional properties that SphereMeshFactory expects
      (item as any).greatCircleAngles = [0, Math.PI / 3, -Math.PI / 3];
      (item as any).latitudeAngles = [
        0,
        Math.PI / 6,
        Math.PI / 3,
        -Math.PI / 6,
        -Math.PI / 3
      ];
      if (item.type === "star") {
        (item as any).borderStar = {
          radius1: 3,
          radius2: 6,
          points: 20,
          borderColor: (item as any).lineColor
        };
      } else {
        (item as any).borderWidth = 2;
        (item as any).borderColor = (item as any).borderColor || "#ffffff";
      }
      const mesh = item.type === "star"
        ? torusMeshFactory.getMesh(item, scene)
        : sphereMeshFactory.getMesh(item, scene);
      mesh.data.item = item;
      // Ajout d'un comportement de clic pour le soleil
      if (item.type === 'star') {
        if ((window as any).BABYLON && (window as any).BABYLON.ActionManager) {
          (mesh as any).actionManager = new (window as any).BABYLON.ActionManager(scene);
          (mesh as any).actionManager.registerAction(new (window as any).BABYLON.ExecuteCodeAction((window as any).BABYLON.ActionManager.OnPickTrigger, () => {
            // Démarre la rotation
            (mesh as any).shouldSpin = true;
            // Booste les couleurs (effet soleil)
            if (typeof (mesh as any).setVividColors === 'function') {
              (mesh as any).setVividColors();
            }
            // Lance la spirale des octos
            if (this.props.onShowOctos) {
              this.props.onShowOctos();
            }
            this.props.addAlert({ type: 'info', text: 'Sun: loading octos in spiral...' });
            this.injectOctosInSpiralProgressive();
          }));
        }
      }
      return mesh;
    };

    // Mapping pour les vaisseaux (utilise RegularPolygonMeshFactory comme alternative à ImageMeshFactory)
    itemMap.ship = (item: GameItem, scene: any) => {
      // Utiliser un polygone triangulaire pour représenter un vaisseau
      (item as any).sides = 3; // Triangle pour la forme de vaisseau
      (item as any).size = (item as any).size || 25;
      (item as any).fillColor = (item as any).fillColor || "#ff4444";
      (item as any).lineColor = (item as any).lineColor || "#ffffff";
      (item as any).lineWidth = (item as any).lineWidth || 2;
      (item as any).thickness = (item as any).thickness || 3;
      const mesh = regularPolygonMeshFactory.getMesh(item, scene);

      // Appliquer la rotation si spécifiée
      if ((item as any).rotation !== undefined) {
        mesh.rotation.z = ((item as any).rotation * Math.PI) / 180;
      }

      mesh.data.item = item;
      return mesh;
    };

    // Mapping pour les astéroïdes (utilise FieldOfSquaresMeshFactory)
    itemMap.asteroids = (item: GameItem, scene: any) => {
      const mesh = fieldOfSquaresMeshFactory.getMesh(item, scene);
      mesh.data.item = item;
      return mesh;
    };

    // Mapping pour les polygones (utilise RegularPolygonMeshFactory)
    itemMap.polygon = (item: GameItem, scene: any) => {
      (item as any).size = (item as any).size || 20;
      (item as any).sides = (item as any).sides || 6;
      (item as any).thickness = (item as any).thickness || 2;
      const mesh = regularPolygonMeshFactory.getMesh(item, scene);
      mesh.data.item = item;
      return mesh;
    };

    // Mapping pour les vecteurs (utilise TwoDVectorMeshFactory)
    itemMap.vector = (item: GameItem, scene: any) => {
      // Calculer la direction du vecteur
      if ((item as any).endU !== undefined && (item as any).endV !== undefined) {
        (item as any).vectorU = (item as any).endU - item.u;
        (item as any).vectorV = (item as any).endV - item.v;
      } else {
        // Direction par défaut si endU/endV ne sont pas définis
        (item as any).vectorU = 1;
        (item as any).vectorV = 0;
      }
      (item as any).lineColor = (item as any).lineColor || "#ff0000";
      (item as any).lineWidth = (item as any).lineWidth || 4;
      const mesh = twoDVectorMeshFactory.getMesh(item, scene);
      mesh.data.item = item;
      return mesh;
    };

    // Mapping pour les flèches (utilise ArrowMeshFactory)
    itemMap.arrow = (item: GameItem, scene: any) => {
      (item as any).lineWidth = (item as any).lineWidth || 4;
      (item as any).lineColor = (item as any).lineColor || "#00aaff";
      (item as any).fillColor = (item as any).fillColor || "#00aaff";
      (item as any).rotate = (item as any).rotation || 0;
      (item as any).scaleLength = (item as any).scaleLength || 0.75;
      (item as any).scaleWidth = (item as any).scaleWidth || 0.75;
      const mesh = arrowMeshFactory.getMesh(item, scene);
      mesh.data.item = item;
      return mesh;
    };

    const mdMeshFactory = new MdMeshFactory();
    const mp3MeshFactory = new Mp3MeshFactory();
    const csvMeshFactory = new CsvMeshFactory();
    const pdfMeshFactory = new PdfMeshFactory();
    const pngMeshFactory = new PngMeshFactory();
    const jsonMeshFactory = new JsonMeshFactory();
    const webpMeshFactory = new WebpMeshFactory();
    const webmMeshFactory = new WebmMeshFactory();
    const xmlMeshFactory = new XmlMeshFactory();
    const glbMeshFactory = new GlbMeshFactory();
    const graphmlMeshFactory = new GraphmlMeshFactory();
    const odhcMeshFactory = new OdhcMeshFactory();

    // Mapping pour les octos (hexagone jaune, cliquable ou mesh spécifique)
    itemMap.octo = (item: any, scene: any) => {
      // Detect file type
      let fileName = '';
      let fileType = '';
      if (item.octoData && Array.isArray(item.octoData.files) && item.octoData.files.length > 0) {
        fileName = (item.octoData.files[0].name || '').toLowerCase();
        fileType = (item.octoData.files[0].type || '').toLowerCase();
      }

      const isMd = fileName.endsWith('.md') || fileType === 'md';
      const isMp3 = fileName.endsWith('.mp3') || fileType === 'mp3';
      const isCsv = fileName.endsWith('.csv') || fileType === 'csv';
      const isPdf = fileName.endsWith('.pdf') || fileType === 'pdf';
      const isPng = fileName.endsWith('.png') || fileType === 'png';
      const isJson = fileName.endsWith('.json') || fileType === 'json';
      const isWebp = fileName.endsWith('.webp') || fileType === 'webp';
      const isWebm = fileName.endsWith('.webm') || fileType === 'webm';
      const isXml = fileName.endsWith('.xml') || fileType === 'xml';
      const isGlb = fileName.endsWith('.glb') || fileType === 'glb';
      const isGraphml = fileName.endsWith('.graphml') || fileType === 'graphml';
      const isOdhc = fileName.endsWith('.odhc') || fileType === 'odhc';

      let mesh;

      if (isMd) {
        mesh = mdMeshFactory.getMesh(item, scene);
      } else if (isMp3) {
        mesh = mp3MeshFactory.getMesh(item, scene);
      } else if (isCsv) {
        mesh = csvMeshFactory.getMesh(item, scene);
      } else if (isPdf) {
        mesh = pdfMeshFactory.getMesh(item, scene);
      } else if (isPng) {
        mesh = pngMeshFactory.getMesh(item, scene);
      } else if (isJson) {
        mesh = jsonMeshFactory.getMesh(item, scene);
      } else if (isWebp) {
        mesh = webpMeshFactory.getMesh(item, scene);
        // Special handler for WebP
        WebpMeshFactory.attachPickHandler(mesh, scene, () => {
          if (this.props.onOctoClick && item.octoData) {
            this.props.onOctoClick(item.octoData);
          } else {
            this.props.addAlert({ type: 'info', text: `Octo: ${item.title || item.id}` });
          }
        });
        if (!mesh.data) mesh.data = {};
        mesh.data.item = item;
        return mesh;
      } else if (isWebm) {
        mesh = webmMeshFactory.getMesh(item, scene);
      } else if (isXml) {
        mesh = xmlMeshFactory.getMesh(item, scene);
      } else if (isGlb) {
        mesh = glbMeshFactory.getMesh(item, scene);
      } else if (isGraphml) {
        mesh = graphmlMeshFactory.getMesh(item, scene);
      } else if (isOdhc) {
        mesh = odhcMeshFactory.getMesh(item, scene);
      } else {
        // Default hexagon
        item.sides = 6;
        item.size = 30;
        item.thickness = 3;
        item.fillColor = '#FFD600';
        item.lineColor = '#B8860B';
        item.lineWidth = 2;
        mesh = regularPolygonMeshFactory.getMesh(item, scene);
      }

      if (!mesh) return null; // Should not happen given default
      if (!mesh.data) mesh.data = {};
      mesh.data.item = item;

      // Attach interaction if not handled specifically (like webp)
      if ((window as any).BABYLON && (window as any).BABYLON.ActionManager) {
        (mesh as any).actionManager = new (window as any).BABYLON.ActionManager(scene);
        (mesh as any).actionManager.registerAction(new (window as any).BABYLON.ExecuteCodeAction((window as any).BABYLON.ActionManager.OnPickTrigger, () => {
          if (this.props.onOctoClick && item.octoData) {
            this.props.onOctoClick(item.octoData);
          } else {
            this.props.addAlert({ type: 'info', text: `Octo: ${item.title || item.id}` });
          }
        }));
      }

      return mesh;
    };

    // Mapping for Hive Nodes (Project items)
    itemMap.hiveNode = (item: any, scene: any) => {
      const node = item.nodeData;
      let mesh;

      if (node.type === 'note') {
        mesh = mdMeshFactory.getMesh(item, scene);
      } else if (node.type === 'media') {
        if (node.content?.fileUrl?.endsWith('.mp3')) mesh = mp3MeshFactory.getMesh(item, scene);
        else if (node.content?.fileUrl?.endsWith('.glb')) mesh = glbMeshFactory.getMesh(item, scene);
        else mesh = pngMeshFactory.getMesh(item, scene);
      } else if (node.type === 'link') {
        item.sides = 3;
        item.fillColor = '#06b6d4';
        mesh = regularPolygonMeshFactory.getMesh(item, scene);
      } else {
        item.sides = 4;
        item.fillColor = '#8b5cf6';
        mesh = regularPolygonMeshFactory.getMesh(item, scene);
      }

      if (!mesh) return null;
      if (!mesh.data) mesh.data = {};
      mesh.data.item = item;

      if ((window as any).BABYLON && (window as any).BABYLON.ActionManager) {
        (mesh as any).actionManager = new (window as any).BABYLON.ActionManager(scene);
        (mesh as any).actionManager.registerAction(new (window as any).BABYLON.ExecuteCodeAction((window as any).BABYLON.ActionManager.OnPickTrigger, () => {
          if (node.type === 'link' && node.content && node.content.url) {
            window.open(node.content.url, '_blank');
          } else {
            this.props.addAlert({ type: 'info', text: `Node: ${node.title} (${node.type})` });
          }
        }));
      }
      return mesh;
    };

    // Setup pipeline nodes
    const itemMappingPipelineNode = new ItemMappingPipelineNode(
      itemMap,
      this.hexBoard.scene
    ) as any;
    itemMappingPipelineNode.setDataSource(pipelineStart);
    this.itemMappingPipelineNode = itemMappingPipelineNode; // Stocke la référence

    const planarPositioningPipelineNode = new PlanarPositioningPipelineNode(hexDimensions) as any;
    planarPositioningPipelineNode.setDataSource(itemMappingPipelineNode);

    const zStackingPipelineNode = new ZStackingPipelineNode(10) as any;
    zStackingPipelineNode.setDataSource(planarPositioningPipelineNode);
    this.zStackingPipelineNode = zStackingPipelineNode; // Stocke la référence

    const vectorDecoratingPipelineNode = new VectorDecoratingPipelineNode(
      twoDVectorMeshFactory,
      this.hexBoard.scene
    ) as any;
    vectorDecoratingPipelineNode.setDataSource(zStackingPipelineNode);

    // Add listener for camera changes to update rotation angle
    this.hexBoard.addListener("camera", () => {
      const rotationAngle = Math.round(this.hexBoard!.getRotationAngle());
      this.setState({ rotationAngle });
    });

    // Add click listener to show coordinates and object info
    this.hexBoard.addListener("mouseUp", (e: any) => {
      // Check if grid is still visible, if not restore it
      if (this.gridContext && this.gridContext.gridParent && (this.gridContext.gridParent as any).visibility === 0) {
        console.log("Grid disappeared, restoring visibility");
        (this.gridContext.gridParent as any).visibility = 1.0;
      }
      if (!e.mouseMoved) {
        if (e.clickedItem && e.clickedItem.data && e.clickedItem.data.item) {
          // Clic sur un élément
          const item = e.clickedItem.data.item;
          let itemInfo = `Object: ${item.type}`;

          if (item.id) itemInfo += ` (ID: ${item.id})`;
          if (item.u !== undefined && item.v !== undefined) {
            itemInfo += ` - Position: U:${item.u} V:${item.v}`;
          }

          // Ajouter des informations spécifiques selon le type
          switch (item.type) {
            case "star":
              itemInfo += " - Central star of the system";
              break;
            case "planet":
              itemInfo += " - Planet";
              break;
            case "moon":
              itemInfo += " - Natural satellite";
              break;
            case "ship":
              itemInfo += " - Spaceship";
              break;
            case "asteroids":
              itemInfo += " - Asteroid field";
              break;
            case "polygon":
              if ((item as any).sides) itemInfo += ` - ${item.sides} sides`;
              // Vérifier si c'est un utilisateur (mesh indigo)
              if (item.id && item.id.startsWith('user_')) {
                const userId = item.id.replace('user_', '');
                itemInfo += ` - User: ${userId}`;
                // Déclencher le callback pour naviguer vers les octos de cet utilisateur
                if (this.props.onUserClick) {
                  this.props.onUserClick(userId);
                }
              }
              break;
            case "vector":
              if ((item as any).endU !== undefined && (item as any).endV !== undefined) {
                itemInfo += ` - Direction: (${(item as any).endU}, ${(item as any).endV})`;
              }
              break;
            case "arrow":
              itemInfo += " - Arrow";
              break;
          }

          this.props.addAlert({
            type: "success",
            text: itemInfo
          });
        } else {
          // Clic sur un hexagone vide
          const hexagonalCoordinates = hexDimensions.getReferencePoint(
            e.mapX,
            e.mapY
          );

          // Si le panneau d'ajout d'objet est ouvert, ajouter un objet
          if (this.state.showAddObjectPanel) {
            this.addObjectAtPosition(hexagonalCoordinates.u, hexagonalCoordinates.v);
            this.setState({ showAddObjectPanel: false });
          }

          this.props.addAlert({
            type: "info",
            text:
              "Empty hexagon - U:" +
              hexagonalCoordinates.u +
              " V:" +
              hexagonalCoordinates.v
          });
        }
      }
    });

    // Add sample objects to the scene
    this.addSampleObjects(pipelineStart);

    // Initialize the scene
    this.hexBoard.init();

    // Mesure la hauteur du panneau d'informations après le rendu
    setTimeout(() => {
      if (this.infoPanelRef.current) {
        this.setState({ infoPanelHeight: this.infoPanelRef.current.offsetHeight });
      }
    }, 100);
  }

  componentDidUpdate(prevProps: MapProps) {
    // Check if active project changed or project nodes changed
    if (this.props.activeProject?.id !== prevProps.activeProject?.id ||
      !arraysEqualById(this.props.projectNodes, prevProps.projectNodes)) {

      this.resetPipeline();
      setTimeout(() => {
        if (this.props.activeProject) {
          this.injectProjectNodes();
        } else {
          // Fallback to existing logic if no project selected
          if (this.props.octos && this.props.octos.length > 0) {
            this.injectOctosInSpiralProgressive();
          }
        }
      }, 500);
      return;
    }

    // Détecter les changements de mode
    const modeChanged = this.props.viewMode !== prevProps.viewMode;
    const showAllUsersChanged = this.props.showAllUsers !== prevProps.showAllUsers;

    // Gérer les changements de mode en priorité
    if (modeChanged || showAllUsersChanged) {
      if (this.props.viewMode === 'all-users' || this.props.showAllUsers) {
        // Mode All Users : nettoyer et afficher les utilisateurs
        this.resetPipeline();
        setTimeout(() => {
          this.showAllUsers();
        }, 100);
      } else {
        // Mode Public ou Personal : nettoyer et afficher les octos
        this.resetPipeline();
        setTimeout(() => {
          this.hideAllUsers();
          // Réinjecter les octos après avoir masqué les utilisateurs
          if (this.props.activeProject) {
            this.injectProjectNodes();
          } else if (this.props.octos && this.props.octos.length > 0) {
            setTimeout(() => {
              this.injectOctosInSpiralProgressive();
            }, 200);
          }
        }, 100);
      }
      return; // Sortir pour éviter les conflits
    }

    // Ne reset que si le contenu réel des octos a changé ET qu'on n'affiche pas les utilisateurs ET qu'on n'est pas dans un projet
    if (!this.props.activeProject && !arraysEqualById(this.props.octos, prevProps.octos) && !this.props.showAllUsers) {
      this.resetPipeline();
      setTimeout(() => {
        this.injectOctosInSpiralProgressive();
      }, 800); // 800ms pour laisser le temps à WebGL
    }
  }

  resetPipeline() {
    if (!this.pipelineStart) return;
    // Suppression de tous les objets de la pipeline (y compris le soleil)
    const pipelineAny = this.pipelineStart as any;
    if (pipelineAny.items) {
      const allItems = pipelineAny.items.slice();
      pipelineAny.removeItems(allItems);
    }
    // Vider explicitement le meshMap du ItemMappingPipelineNode
    if (this.itemMappingPipelineNode && typeof this.itemMappingPipelineNode.clearAll === "function") {
      this.itemMappingPipelineNode.clearAll();
    }
    // Vider explicitement le cellGroupsMap du ZStackingPipelineNode
    if (this.zStackingPipelineNode && typeof this.zStackingPipelineNode.clearAll === "function") {
      this.zStackingPipelineNode.clearAll();
    }
    // Forcer un rendu Babylon.js pour nettoyer la scène avant réinjection
    if (this.hexBoard && this.hexBoard.scene && typeof (this.hexBoard.scene as any).render === "function") {
      (this.hexBoard.scene as any).render();
    }
    // Réinjecter le soleil systématiquement
    this.addSampleObjects(this.pipelineStart);
  }

  injectOctosInSpiral() {
    if (this.props.viewMode === 'chat') return;
    if (!this.pipelineStart || !this.props.octos || this.props.octos.length === 0) return;
    // Le soleil est déjà injecté par resetPipeline
    const spiralPositions = this.computeSpiralPositions(this.props.octos.length);
    const octoItems = this.props.octos.map((octo: OctoType, i: number) => ({
      id: octo.id,
      type: 'octo',
      u: spiralPositions[i].u,
      v: spiralPositions[i].v,
      title: octo.title,
      fillColor: '#FFD600',
      lineColor: '#B8860B',
      lineWidth: 2,
      sides: 6,
      size: 30,
      thickness: 3,
      emitter: new EventEmitter(),
      octoData: octo
    }));
    console.log('Injection octos dans pipeline:', octoItems);
    this.pipelineStart.addItems(octoItems);
  }

  injectOctosInSpiralProgressive() {
    if (this.props.viewMode === 'chat') return;
    if (!this.pipelineStart || !this.props.octos || this.props.octos.length === 0) return;

    const spiralPositions = this.computeSpiralPositions(this.props.octos.length);
    const delayBetweenOctos = 200; // 200ms between each octo

    this.props.addAlert({ type: 'info', text: `Loading ${this.props.octos.length} octos...` });

    spiralPositions.forEach((position, index) => {
      setTimeout(() => {
        const octo = this.props.octos![index];
        if (!octo) {
          console.warn(`Octo at index ${index} is undefined`);
          return;
        }

        const octoItem = {
          id: octo.id || `octo_${index}`,
          type: 'octo',
          u: position.u,
          v: position.v,
          title: octo.title || `Octo ${index}`,
          fillColor: '#FFD600',
          lineColor: '#B8860B',
          lineWidth: 2,
          sides: 6,
          size: 30,
          thickness: 3,
          emitter: new EventEmitter(),
          octoData: octo
        };

        this.pipelineStart!.addItems([octoItem]);

        // Notification when the last octo is added
        if (index === spiralPositions.length - 1) {
          this.props.addAlert({ type: 'success', text: `All octos loaded!` });
        }
      }, index * delayBetweenOctos);
    });
  }

  injectProjectNodes() {
    if (!this.pipelineStart || !this.props.projectNodes) return;
    const nodes = this.props.projectNodes;
    if (nodes.length === 0) {
      this.props.addAlert({ type: 'info', text: `Empty Project - Right click to add nodes (Coming soon)` });
      return;
    }

    this.props.addAlert({ type: 'info', text: `Loading ${nodes.length} project nodes...` });

    const items = nodes.map(node => ({
      id: node.id,
      type: 'hiveNode',
      u: node.q,
      v: node.r,
      title: node.title,
      nodeData: node,
      emitter: new EventEmitter(),
      // Styles handled in itemMap based on type
      size: 30,
      thickness: 3,
      lineWidth: 2,
      lineColor: '#ffffff'
    }));

    this.pipelineStart.addItems(items);
  }

  computeSpiralPositions(count: number): { u: number, v: number }[] {
    const positions: { u: number, v: number }[] = [];
    if (count === 0) return positions;
    let placed = 0;
    let layer = 1;
    const directions = [
      [0, 1],    // N
      [-1, 1],   // NW
      [-1, 0],   // W
      [0, -1],   // S
      [1, -1],   // SE
      [1, 0]     // E
    ];
    while (placed < count) {
      let u = layer, v = 0;
      // Première direction (N) : 1 pas seulement
      if (placed < count) {
        positions.push({ u, v });
        placed++;
      }
      // 5 directions suivantes : layer pas
      for (let dir = 1; dir < 6 && placed < count; dir++) {
        for (let step = 0; step < layer && placed < count; step++) {
          u += directions[dir][0];
          v += directions[dir][1];
          positions.push({ u, v });
          placed++;
        }
      }
      // Dernière direction (E) : layer-1 pas pour fermer la couronne
      if (placed < count) {
        for (let step = 1; step < layer && placed < count; step++) {
          u += directions[0][0];
          v += directions[0][1];
          positions.push({ u, v });
          placed++;
        }
      }
      layer++;
    }
    return positions;
  }

  addSampleObjects(pipelineStart: EmittingDataSource): void {
    // Add the sun only
    const sun: GameItem = {
      id: "sun",
      type: "star",
      size: 100,
      lineWidth: 5,
      lineColor: "#f97306",
      backgroundColor: "#ffff14",
      u: 0,
      v: 0
    };
    (sun as any).emitter = new EventEmitter();
    pipelineStart.addItems([sun]);

    // Store reference to pipeline for dynamic additions
    this.pipelineStart = pipelineStart;
  }

  getRandomHexColor(): string {
    const colors = [
      "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff",
      "#ff8800", "#8800ff", "#00ff88", "#ff0088", "#88ff00", "#0088ff",
      "#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  addObjectAtPosition(u: number, v: number): void {
    if (!this.pipelineStart) return;

    const objectType = this.state.selectedObjectType;
    const timestamp = Date.now();
    const baseId = `${objectType}_${timestamp}`;

    let newObject: any = {
      id: baseId,
      type: objectType,
      u: u,
      v: v
    };

    // Configure object based on type
    switch (objectType) {
      case "planet":
        newObject = {
          ...newObject,
          type: "planet",
          size: 50,
          lineWidth: 3,
          lineColor: "#653700",
          backgroundColor: "#0343df",
          borderColor: "#ffffff"
        } as GameItem;
        break;
      case "star":
        newObject = {
          ...newObject,
          type: "star",
          size: 80,
          lineWidth: 4,
          lineColor: "#f97306",
          backgroundColor: "#ffff14"
        } as GameItem;
        break;
      case "moon":
        newObject = {
          ...newObject,
          type: "moon",
          size: 25,
          lineWidth: 2,
          lineColor: "#929591",
          backgroundColor: "#e1e1d6",
          borderWidth: 2,
          borderColor: "black"
        } as GameItem;
        break;
      case "ship":
        newObject = {
          ...newObject,
          type: "ship",
          rotation: Math.random() * 360,
          fillColor: "#ff4444",
          lineColor: "#ffffff",
          lineWidth: 2,
          size: 25
        } as GameItem;
        break;
      case "asteroids":
        // Asteroids are already configured by FieldOfSquaresMeshFactory
        break;
      case "polygon": {
        newObject = {
          ...newObject,
          type: "polygon",
          sides: Math.floor(Math.random() * 6) + 3,
          size: 15 + Math.random() * 10,
          fillColor: this.getRandomHexColor(),
          lineColor: "#ffffff",
          lineWidth: 2,
          thickness: 2
        } as GameItem;
        break;
      }
      case "vector": {
        // Calculate a random direction
        const endU = u + Math.floor(Math.random() * 4) - 2;
        const endV = v + Math.floor(Math.random() * 4) - 2;
        newObject = {
          ...newObject,
          type: "vector",
          endU: endU,
          endV: endV,
          lineColor: this.getRandomHexColor(),
          lineWidth: 4
        } as GameItem;
        break;
      }
      case "arrow":
        newObject = {
          ...newObject,
          type: "arrow",
          lineWidth: 4,
          lineColor: "#00aaff",
          fillColor: "#00aaff",
          rotation: Math.random() * 360,
          scaleLength: 0.75,
          scaleWidth: 0.75
        } as GameItem;
        break;
    }

    // Correction : attacher un EventEmitter à chaque objet ajouté dynamiquement
    (newObject as any).emitter = new EventEmitter();

    this.pipelineStart.addItems([newObject]);

    this.props.addAlert({
      type: "success",
      text: `Object ${objectType} added at position U:${u} V:${v}`
    });
  }

  // Méthode pour afficher tous les utilisateurs sur la carte
  showAllUsers(): void {
    if (!this.pipelineStart) return;

    // Accéder au contexte GunDB via les props ou le contexte global
    const gun = (window as any).gun || this.props.gun;
    if (!gun) {
      this.props.addAlert({ type: 'danger', text: 'GunDB not available' });
      return;
    }

    this.props.addAlert({ type: 'info', text: 'Loading users...' });

    // Ne pas faire resetPipeline ici car c'est déjà fait dans componentDidUpdate
    // Le soleil est déjà présent dans la pipeline

    // Utiliser la fonction importée directement
    import('@/utils/gunHelpers').then(({ getAllUsersWithUV }) => {
      getAllUsersWithUV(gun, (users: Array<{ userId: string, u: number, v: number, ts: number }>) => {
        if (users.length === 0) {
          this.props.addAlert({ type: 'info', text: 'No users found on the Hive' });
          return;
        }

        console.log('Users found:', users);

        // Créer des objets visuels pour chaque utilisateur
        const userItems = users.map(user => ({
          id: `user_${user.userId}`,
          type: 'polygon' as GameItem['type'],
          u: user.u,
          v: user.v,
          sides: 6,
          size: 25,
          fillColor: '#4F46E5', // Indigo pour les utilisateurs
          lineColor: '#FFFFFF',
          lineWidth: 2,
          thickness: 2,
          emitter: new EventEmitter(),
          userId: user.userId,
          ts: user.ts,
          // Ajouter un gestionnaire de clic pour les utilisateurs
          onClick: () => {
            if (this.props.onUserClick) {
              this.props.onUserClick(user.userId);
            }
          }
        }));

        console.log('User objects created:', userItems);

        // Ajouter les utilisateurs à la pipeline
        this.pipelineStart!.addItems(userItems);

        this.props.addAlert({
          type: 'success',
          text: `${users.length} user(s) displayed on the Hive`
        });
      });
    }).catch(error => {
      console.error('Error loading users:', error);
      this.props.addAlert({ type: 'danger', text: 'Error loading users' });
    });
  }

  // Méthode pour masquer tous les utilisateurs
  hideAllUsers(): void {
    if (!this.pipelineStart) return;

    // Ne pas faire resetPipeline ici car c'est déjà fait dans componentDidUpdate
    // Juste nettoyer les objets utilisateurs spécifiquement
    const pipelineAny = this.pipelineStart as any;
    if (pipelineAny.items) {
      const userItems = pipelineAny.items.filter((item: any) => item.id && item.id.startsWith('user_'));
      if (userItems.length > 0) {
        pipelineAny.removeItems(userItems);
      }
    }

    this.props.addAlert({ type: 'info', text: 'Users hidden, returning to normal view' });
  }

  componentWillUnmount(): void {
    if (this.resizeListener) {
      window.removeEventListener("resize", this.resizeListener);
    }

    // Nettoyer les EventEmitter des objets
    if (this.pipelineStart) {
      // Nettoyer tous les objets avec leurs EventEmitter
      (this.pipelineStart as any).items?.forEach((item: any) => {
        if (item.emitter) {
          item.emitter.removeAllListeners();
        }
      });
    }
  }
}

export default Map; 
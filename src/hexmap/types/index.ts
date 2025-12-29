// Types pour les coordonnées
export interface CartesianCoordinates {
  x: number;
  y: number;
}

export interface HexagonalCoordinates {
  u: number;
  v: number;
}

// Types pour les objets de jeu
export interface GameObject {
  id: string;
  type: string;
  u: number;
  v: number;
  properties?: Record<string, any>;
  emitter?: any; // EventEmitter
}

// Types pour les planètes
export interface PlanetObject extends GameObject {
  type: 'planet';
  size: number;
  lineWidth: number;
  lineColor: string;
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
}

// Types pour les étoiles
export interface StarObject extends GameObject {
  type: 'star';
  size: number;
  lineWidth: number;
  lineColor: string;
  backgroundColor: string;
  borderStar?: {
    radius1: number;
    radius2: number;
    points: number;
    borderColor: string;
  };
}

// Types pour les lunes
export interface MoonObject extends GameObject {
  type: 'moon';
  size: number;
  lineWidth: number;
  lineColor: string;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
}

// Types pour les vaisseaux
export interface ShipObject extends GameObject {
  type: 'ship';
  rotation?: number;
  fillColor: string;
  lineColor: string;
  lineWidth: number;
  size: number;
}

// Types pour les astéroïdes
export interface AsteroidsObject extends GameObject {
  type: 'asteroids';
}

// Types pour les polygones
export interface PolygonObject extends GameObject {
  type: 'polygon';
  sides: number;
  size: number;
  fillColor: string;
  lineColor: string;
  lineWidth: number;
  thickness: number;
}

// Types pour les vecteurs
export interface VectorObject extends GameObject {
  type: 'vector';
  endU?: number;
  endV?: number;
  vectorU?: number;
  vectorV?: number;
  lineColor: string;
  lineWidth: number;
}

// Types pour les flèches
export interface ArrowObject extends GameObject {
  type: 'arrow';
  lineWidth: number;
  lineColor: string;
  fillColor: string;
  rotation?: number;
  scaleLength: number;
  scaleWidth: number;
}

// Union type pour tous les objets
export type GameItem = 
  | PlanetObject 
  | StarObject 
  | MoonObject 
  | ShipObject 
  | AsteroidsObject 
  | PolygonObject 
  | VectorObject 
  | ArrowObject;

// Types pour les événements
export interface CameraEvent {
  cameraX: number;
  cameraY: number;
  cameraZ: number;
}

export interface PanEvent {
  middleX: number;
  middleY: number;
}

export interface MouseEvent {
  canvasX: number;
  canvasY: number;
  mapX: number | null;
  mapY: number | null;
  clickedItem: any | null;
  mouseMoved: boolean;
}

// Types pour les alertes
export interface Alert {
  type: 'success' | 'info' | 'warning' | 'danger';
  text: string;
}

// Types pour les props React
export interface MapProps {
  addAlert: (alert: Alert) => void;
  dataLink: any; // EmittingDataSource
}

export interface NavBarProps {
  setNavHeight: (height: number | undefined) => void;
  location: any; // Location from react-router
}

export interface AlertsProps {
  removeAlert: (index: number) => void;
  alerts: Alert[];
}

export interface NavItemProps {
  to: string;
  children: React.ReactNode;
  active?: boolean;
}

// Types pour les dimensions hexagonales
export interface HexDimensions {
  edgeSize: number;
  vScale: number;
  rotation: number;
  edgeWidth: number;
  twiddle: 0 | 0.5;
  h: number;
  r: number;
  hexagon_half_wide_width: number;
  hexagon_wide_width: number;
  hexagon_edge_to_edge_width: number;
  hexagon_scaled_half_edge_size: number;
  hexagon_narrow_width: number;
  getPixelCoordinates(u: number, v: number): CartesianCoordinates;
  getReferencePoint(x: number, y: number): HexagonalCoordinates;
}

// Types pour les factories de mesh
export interface MeshFactory {
  getMesh(item: GameItem, scene: any): any; // Babylon.js Mesh
}

// Types pour les contextes
export interface Context {
  init(scene: any): void;
  updatePosition(middleX?: number, middleY?: number): void;
  mouseDown?(clickedX: number, clickedY: number): boolean;
  mouseDragged?(screenX: number, screenY: number, planarX: number, planarY: number): void;
  mouseReleased?(screenX: number, screenY: number, planarX: number, planarY: number, wasDrag: boolean): void;
  reDraw?(): void;
  setDataSource?(dataSource: any): void;
}

// Types pour les événements de données
export interface DataChangeEvent {
  added: any[];
  removed: any[];
  updated: any[];
}

// Types pour les modes de caméra
export type CameraMode = 'pan' | 'tilt' | 'spin' | 'zoom';

// Types pour les couleurs RGB
export interface RGBColor {
  r: number;
  g: number;
  b: number;
} 
import * as babylon from 'babylonjs';
import type { Context } from './Context';

interface HexDimensions {
  getPixelCoordinates(u: number, v: number): { x: number; y: number };
}

interface DrawnItemFactory {
  getDrawnItem(item: any, scene: babylon.Scene): babylon.Mesh;
}

interface DataItem {
  id: string;
  sourceU?: number;
  sourceV?: number;
  onDrag?: (x: number, y: number, eventDx: number, eventDy: number) => void;
  onClick?: () => void;
}

interface DrawnItem extends babylon.Mesh {
  isGenericContextItem: boolean;
  data: {
    onDrag?: (x: number, y: number, eventDx: number, eventDy: number) => void;
    item: DataItem;
  };
}

interface DataSource {
  addListener(event: string, callback: (event: any) => void): void;
}

interface DataChangedEvent {
  removed: any[];
  added: any[];
}

/**
 * A generic context that draws items from the provided dataSource using the provided factory with no special interactions
 * Can do paths, vectors, badges and more without needing to implement a new context
 */
export default class DrawnItemContext implements Context {
  private drawnItemFactory: DrawnItemFactory;
  private hexDimensions: HexDimensions;
  private drawnItemCache: Record<string, DrawnItem>;
  private scene?: babylon.Scene;
  private clickedItem?: DrawnItem;

  constructor(drawnItemFactory: DrawnItemFactory, hexDimensions: HexDimensions) {
    this.drawnItemFactory = drawnItemFactory;
    this.hexDimensions = hexDimensions;
    this.drawnItemCache = {};
  }

  init(scene: babylon.Scene): void {
    this.scene = scene;
  }

  mouseDown(clickedX: number, clickedY: number): boolean {
    if (!this.scene) return false;
    
    const mousePickResult = this.scene.pick(clickedX, clickedY, (mesh: babylon.AbstractMesh) => {
      return !!(mesh as any).isGenericContextItem;
    });
    
    if (mousePickResult.hit) {
      this.clickedItem = mousePickResult.pickedMesh as DrawnItem;
      return true;
    }
    return false;
  }

  /**
   * Method called to update the position of the global view, either through drags or programmatic manipulation
   */
  updatePosition(): void {
    //Do nothing, the camera moves and the world stay stationary
  }

  mouseDragged(x: number, y: number, eventDx: number, eventDy: number): void {
    if (this.clickedItem?.data.onDrag) {
      this.clickedItem.data.onDrag(x, y, eventDx, eventDy);
    }
  }

  mouseReleased(_screenX: number, _screenY: number, _planarX: number, _planarY: number, wasDrag: boolean): void {
    if (!wasDrag && this.clickedItem?.data.item.onClick) {
      this.clickedItem.data.item.onClick();
    }
  }

  reDraw(): void {
    //Eh, don't do anything yet. Only screen resized implemented which this context doesn't care about
  }

  setDataSource(dataSource: DataSource): void {
    dataSource.addListener("dataChanged", (event: DataChangedEvent) => {
      this.onDataChanged(event);
    });
  }

  /**
   * Called when objects are added to datasource, removed from datasource, re-ordered in datasource,
   */
  onDataChanged(event: DataChangedEvent): void {
    //A reminder for the Author: Javascript variables are not at block level. These variables are used in both loops.
    let i: number, item: any, drawnItem: DrawnItem;
    //Currently cell moves are done by re-adding an item with new cell co-ordinates, no z-index param, need to add/re-add all items in the desired order
    //Can do removes individually though

    for (i = 0; i < event.removed.length; i++) {
      item = event.removed[i];
      drawnItem = this.drawnItemCache[item.id];
      drawnItem.dispose();
      delete this.drawnItemCache[item.id];
    }

    for (i = 0; i < event.added.length; i++) {
      item = event.added[i];

      drawnItem = this.drawnItemFactory.getDrawnItem(item, this.scene!) as DrawnItem;
      if (Object.prototype.hasOwnProperty.call(item, "sourceU")) {
        const sourcePixelCoordinates = this.hexDimensions.getPixelCoordinates(
          item.sourceU,
          item.sourceV
        );
        drawnItem.position.x = sourcePixelCoordinates.x;
        drawnItem.position.y = sourcePixelCoordinates.y;
      }
      drawnItem.isGenericContextItem = true;
      this.drawnItemCache[item.id] = drawnItem;
    }
  }
} 
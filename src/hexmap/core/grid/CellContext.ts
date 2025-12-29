import * as babylon from 'babylonjs';
import type { Context } from './Context';

interface HexDimensions {
  getPixelCoordinates(u: number, v: number): { x: number; y: number };
}

interface CellItem {
  isCellItem: boolean;
  data: {
    item: {
      onDrag?: (screenX: number, screenY: number, planarX: number, planarY: number, mesh: babylon.Mesh) => void;
      onClick?: (screenX: number, screenY: number, planarX: number, planarY: number, mesh: babylon.Mesh) => void;
      onRelease?: (screenX: number, screenY: number, planarX: number, planarY: number, mesh: babylon.Mesh) => void;
    };
  };
}

interface DataSource {
  addListener(event: string, callback: (event: any) => void): void;
}

/**
 * This is the context object which manages the click interaction of Cell items
 */
export default class CellContext implements Context {
  private scene?: babylon.Scene;
  private clickedItem?: babylon.Mesh & CellItem;

  constructor(_hexDimensions: HexDimensions, _board: any, _color: string, _radius: number, _fadeRadius: number, _baseAlpha: number) {
    // Constructor parameters are kept for compatibility but not stored
  }

  init(scene: babylon.Scene): void {
    this.scene = scene;
  }

  mouseDown(clickedX: number, clickedY: number): boolean {
    if (!this.scene) return false;
    
    const mousePickResult = this.scene.pick(clickedX, clickedY, (mesh: babylon.AbstractMesh) => {
      return !!(mesh as any).isCellItem;
    });
    
    if (mousePickResult.hit) {
      this.clickedItem = mousePickResult.pickedMesh as babylon.Mesh & CellItem;
      return true;
    }
    return false;
  }

  updatePosition(): void {
    //Do nothing, the camera moves and the world stay stationary
  }

  mouseDragged(screenX: number, screenY: number, planarX: number, planarY: number): void {
    if (this.clickedItem?.data.item.onDrag) {
      this.clickedItem.data.item.onDrag(
        screenX,
        screenY,
        planarX,
        planarY,
        this.clickedItem
      );
    }
  }

  mouseReleased(screenX: number, screenY: number, planarX: number, planarY: number, wasDrag: boolean): void {
    if (!wasDrag && this.clickedItem?.data.item.onClick) {
      this.clickedItem.data.item.onClick(
        screenX,
        screenY,
        planarX,
        planarY,
        this.clickedItem
      );
    } else if (wasDrag && this.clickedItem?.data.item.onRelease) {
      this.clickedItem.data.item.onRelease(
        screenX,
        screenY,
        planarX,
        planarY,
        this.clickedItem
      );
    }
  }

  /*
   * Listen for added items which can claim the mouse down for dragging
   */
  setDataSource(dataSource: DataSource): void {
    dataSource.addListener("dataChanged", (event: any) => {
      for (let i = 0; i < event.added.length; i++) {
        if (event.added[i].isCellItem && !!event.added[i].data.item.dragged) {
          //The item was 'dragged' into existence and should take over the mouse interaction
          this.clickedItem = event.added[i];
        }
      }
    });
  }
} 
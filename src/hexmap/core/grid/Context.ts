import * as babylon from 'babylonjs';

/**
 * Interface for context classes which manage a display/interaction layer of the hex map
 */
export interface Context {
  /**
   * Initialize the context with the scene to draw to
   */
  init(scene: babylon.Scene): void;

  /**
   * Called to update the layer's position as the map is scrolled (or jump to a position)
   */
  updatePosition(): void;

  /**
   * Called on mouseDown with both the screen and planar x-y coordinates
   * @param screenX - The x position of the mouse down event relative to the screen
   * @param screenY - The y position of the mouse down event relative to the screen
   * @param planarX - The x position of the mouse down event relative to the plane
   * @param planarY - The y position of the mouse down event relative to the plane
   * @returns True if the context claims the click. Else False
   */
  mouseDown(screenX: number, screenY: number, planarX: number, planarY: number): boolean;

  /**
   * Called as the mouse is dragged if the context claimed the click
   * @param screenX - The x position of the mouse drag event relative to the screen
   * @param screenY - The y position of the mouse drag event relative to the screen
   * @param planarX - The x position of the mouse drag event relative to the plane
   * @param planarY - The y position of the mouse drag event relative to the plane
   */
  mouseDragged(screenX: number, screenY: number, planarX: number, planarY: number): void;

  /**
   * Called when the mouse is released, serves double purpose as onMouseUp and onDragStop
   * @param screenX - The x position of the mouse release event relative to the screen
   * @param screenY - The y position of the mouse release event relative to the screen
   * @param planarX - The x position of the mouse release event relative to the plane
   * @param planarY - The y position of the mouse release event relative to the plane
   * @param wasDrag - Boolean indicating if the mouse was moved at all before the release
   */
  mouseReleased(screenX: number, screenY: number, planarX: number, planarY: number, wasDrag: boolean): void;

  /**
   * Set the data source for this context
   */
  setDataSource(dataSource: any): void;
} 
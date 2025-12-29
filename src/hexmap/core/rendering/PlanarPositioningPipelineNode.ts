/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module PlanarPositioningDataLink
 */

import makeDataLink from "data-chains/src/DataLinkMixin.js";
import { HexDimensions, DataChangeEvent } from "../../types";

/**
 * This DataLink expects events with meshes, and an item with a U, V position. It sets their X, Y position using the given cartesian-hexagonal util
 * @param hexDimensions - The DTO defining the hex <--> cartesian relation
 */
export default class PlanarPositioningPipelineNode {
  private hexDimensions: HexDimensions;

  constructor(hexDimensions: HexDimensions) {
    this.hexDimensions = hexDimensions;
    makeDataLink.call(this);
  }

  onDataChanged(event: DataChangeEvent | DataChangeEvent[]): void {
    // Handle both single event and array of events
    const events = Array.isArray(event) ? event : [event];
    
    for (const dataEvent of events) {
      if (!dataEvent || typeof dataEvent !== "object" || !dataEvent.added || !dataEvent.removed || !dataEvent.updated) {
        // Ignore invalid events
        return;
      }
      
      for (let i = 0; i < dataEvent.added.length; i++) {
        const mesh = dataEvent.added[i];
        if (!mesh || !mesh.data || !mesh.data.item) {
          console.warn('Invalid mesh in added array:', mesh);
          continue;
        }
        const item = mesh.data.item;
        const pixelCoordinates = this.hexDimensions.getPixelCoordinates(item.u, item.v);
        mesh.position.x = pixelCoordinates.x;
        mesh.position.y = pixelCoordinates.y;
      }
      
      for (let i = 0; i < dataEvent.updated.length; i++) {
        const mesh = dataEvent.updated[i];
        if (!mesh || !mesh.data || !mesh.data.item) {
          console.warn('Invalid mesh in updated array:', mesh);
          continue;
        }
        const item = mesh.data.item;
        if ((item as any).skipCellCentering) {
          continue;
        }
        const pixelCoordinates = this.hexDimensions.getPixelCoordinates(item.u, item.v);
        mesh.position.x = pixelCoordinates.x;
        mesh.position.y = pixelCoordinates.y;
      }
    }
    
    (this as any).emitEvent("dataChanged", events);
  }

  setScene(_scene: any): void {
    // Not used
  }
} 
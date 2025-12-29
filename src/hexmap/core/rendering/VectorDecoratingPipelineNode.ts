/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module DrawnItemDataLink
 */

import makeDataLink from "data-chains/src/DataLinkMixin.js";
import { DataChangeEvent } from "../../types";

/**
 * This DataLink consumes events with item dtos and produces Babylon.js Meshes attached to the scene at 0, 0
 */
export default class VectorDecoratingPipelineNode {
  private vectorFactory: any;
  private scene: any;

  constructor(vectorFactory: any, scene: any) {
    this.vectorFactory = vectorFactory;
    this.scene = scene;
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
      
      let mesh;

      //Don't worry about removed, the parent item takes care of it

      for (let i = 0; i < dataEvent.added.length; i++) {
        mesh = dataEvent.added[i];

        if (mesh.data && mesh.data.item && mesh.data.item.vectors) {
          for (let j = 0; j < mesh.data.item.vectors.length; j++) {
            const vector = this.vectorFactory.getMesh(
              mesh.data.item.vectors[j],
              this.scene
            );
            vector.position.x = mesh.position.x;
            vector.position.y = mesh.position.y;
            vector.position.z = mesh.data.baseZ - (j + 1);
          }
        }
      }
    }
    
    // Only emit if there are items to process
    const firstEvent = Array.isArray(event) ? event[0] : event;
    if (firstEvent && (firstEvent.added?.length > 0 || firstEvent.removed?.length > 0 || firstEvent.updated?.length > 0)) {
      (this as any).emitEvent("dataChanged", { added: [], removed: firstEvent.removed || [], updated: firstEvent.updated || [] });
    }
  }

  setScene(scene: any): void {
    this.scene = scene;
  }
} 
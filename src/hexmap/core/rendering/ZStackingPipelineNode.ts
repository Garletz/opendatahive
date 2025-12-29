/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module ZStackingPipelineNode
 */

import makeDataLink from "data-chains/src/DataLinkMixin.js";
import { DataChangeEvent } from "../../types";

/**
 * This DataLink expects events with meshes, it will stack the meshes (Z height) which are in the same U, V cell
 * @param stackStep - The distance in pixels to keep between items
 */
export default class ZStackingPipelineNode {
  private stackStep: number;
  private cellGroupsMap: Record<string, any> = {};

  constructor(stackStep: number) {
    this.stackStep = stackStep;
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
      
      let i, mesh, item, groupKey, cellGroup: any;
      //TODO, do removed first
      //TODO Then do updated
      for (i = 0; i < dataEvent.added.length; i++) {
        mesh = dataEvent.added[i];
        item = mesh.data.item;
        groupKey = item.u + ":" + item.v;
        if (Object.prototype.hasOwnProperty.call(this.cellGroupsMap, groupKey)) {
          cellGroup = this.cellGroupsMap[groupKey];
        } else {
          //create the group
          //keep most of the meta data attached the the above grid group
          cellGroup = {};
          cellGroup.data = {};

          this.cellGroupsMap[groupKey] = cellGroup;
          //decorate the cell group with various information we'll need
          cellGroup.mouseDown = false;
          cellGroup.drawnItemCount = 0;

          //Set the doubly linked list references, makes a circle with the cellGroup itself as a node. Means don't need to null check
          cellGroup.previousDrawnItem = cellGroup;
          cellGroup.nextDrawnItem = cellGroup;

          //Set it up so the base item will be a z = 0
          cellGroup.position = {};
          cellGroup.position.z = -1 * this.stackStep;
        }
        mesh.position.z = cellGroup.previousDrawnItem.position.z + this.stackStep;
        mesh.data.baseZ = mesh.position.z;
        if (
          Boolean(cellGroup.previousDrawnItem.data) &&
          Boolean(cellGroup.previousDrawnItem.data.height)
        ) {
          mesh.position.z =
            mesh.position.z + cellGroup.previousDrawnItem.data.height / 2;
          mesh.data.baseZ = mesh.position.z;
        }

        if (Boolean(mesh.data) && Boolean(mesh.data.height)) {
          mesh.position.z = mesh.position.z + mesh.data.height / 2;
        }

        //Some circular logic here. Pun intended
        cellGroup.previousDrawnItem.nextDrawnItem = mesh;
        mesh.previousDrawnItem = cellGroup.previousDrawnItem;
        cellGroup.previousDrawnItem = mesh;
        mesh.nextDrawnItem = cellGroup;
      }
    }

    // Get the first event for emitting (since we're not modifying the arrays)
    const firstEvent = Array.isArray(event) ? event[0] : event;
    (this as any).emitEvent("dataChanged", { added: firstEvent?.added || [], removed: firstEvent?.removed || [], updated: firstEvent?.updated || [] });
  }

  setScene(_scene: any): void {
    // Not used
  }

  clearAll() {
    this.cellGroupsMap = {};
  }
} 
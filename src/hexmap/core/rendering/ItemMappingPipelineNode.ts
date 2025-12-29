/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module DrawnItemDataLink
 */

import EventEmitter from "wolfy87-eventemitter";
import makeDataLink from "data-chains/src/DataLinkMixin.js";
import { GameItem, DataChangeEvent } from "../../types";

/**
 * This DataLink consumes events with item dtos and produces Babylon.js Meshes attached to the scene at 0, 0
 */
export default class ItemMappingPipelineNode extends EventEmitter {
  private meshFactoryMap: Record<string, (item: GameItem, scene: any) => any>;
  private scene: any;
  private meshMap: Record<string, any> = {};

  constructor(meshFactoryMap: Record<string, (item: GameItem, scene: any) => any>, scene: any) {
    super();
    this.meshFactoryMap = meshFactoryMap;
    this.scene = scene;
    makeDataLink.call(this);
  }

  onDataChanged(event: DataChangeEvent): void {
    if (!event || typeof event !== "object" || !event.added || !event.removed || !event.updated) {
      // Ignore invalid events
      return;
    }
    const removed: any[] = [];
    const added: any[] = [];
    
    for (let i = 0; i < event.removed.length; i++) {
      const item = event.removed[i];
      if (!("id" in item) || !Object.prototype.hasOwnProperty.call(this.meshMap, item.id)) {
        //Invalid item! Throw a hissy fit!
        continue;
      }

      const mesh = this.meshMap[item.id];
      mesh.dispose();
      delete this.meshMap[item.id];
      removed.push(mesh);
    }

    for (let i = 0; i < event.added.length; i++) {
      const item = event.added[i];
      if (!("id" in item) || Object.prototype.hasOwnProperty.call(this.meshMap, item.id)) {
        //Don't know what to do with an item which doesn't have an ID, or we already have an item with the given ID
        continue;
      }

      let mesh: any = null;
      if (Object.prototype.hasOwnProperty.call(this.meshFactoryMap, item.type)) {
        try {
          mesh = this.meshFactoryMap[item.type](item, this.scene);
        } catch (error) {
          console.error(`Error creating mesh for item ${item.id} of type ${item.type}:`, error);
          continue;
        }
      } else {
        console.warn(`No factory found for item type: ${item.type}. Available types:`, Object.keys(this.meshFactoryMap));
      }

      if (!mesh) {
        console.warn(`No mesh created for item type: ${item.type}`);
        continue;
      }
      if (!mesh.data) {
        mesh.data = {};
      }

      mesh.data.item = item;
      added.push(mesh);
      this.meshMap[item.id] = mesh;
    }
    
    (this as any).emit("dataChanged", { added: added, removed: removed, updated: event.updated });
  }

  setScene(scene: any): void {
    this.scene = scene;
  }

  clearAll() {
    // Dispose all meshes and clear the meshMap
    Object.values(this.meshMap).forEach(mesh => {
      if (mesh && typeof mesh.dispose === "function") mesh.dispose();
    });
    this.meshMap = {};
  }
} 
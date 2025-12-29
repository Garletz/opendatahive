interface DataLinkMixin {
  setDataSource(dataSource: any): void;
  emitEvent(event: string, data?: any): void;
}

declare module '../core/rendering/ItemMappingPipelineNode' {
  import { GameItem } from '../../types';
  
  export default class ItemMappingPipelineNode implements DataLinkMixin {
    constructor(meshFactoryMap: Record<string, (item: GameItem, scene: any) => any>, scene: any);
    setDataSource(dataSource: any): void;
    emitEvent(event: string, data?: any): void;
    onDataChanged(event: any): void;
    setScene(scene: any): void;
  }
}

declare module '../core/rendering/PlanarPositioningPipelineNode' {
  import { HexDimensions } from '../../types';
  
  export default class PlanarPositioningPipelineNode implements DataLinkMixin {
    constructor(hexDimensions: HexDimensions);
    setDataSource(dataSource: any): void;
    emitEvent(event: string, data?: any): void;
    onDataChanged(event: any): void;
    setScene(scene: any): void;
  }
}

declare module '../core/rendering/ZStackingPipelineNode' {
  export default class ZStackingPipelineNode implements DataLinkMixin {
    constructor(zIndex: number);
    setDataSource(dataSource: any): void;
    emitEvent(event: string, data?: any): void;
    onDataChanged(event: any): void;
  }
}

declare module '../core/rendering/VectorDecoratingPipelineNode' {
  export default class VectorDecoratingPipelineNode implements DataLinkMixin {
    constructor(vectorFactory: any, scene: any);
    setDataSource(dataSource: any): void;
    emitEvent(event: string, data?: any): void;
    onDataChanged(event: any): void;
  }
} 
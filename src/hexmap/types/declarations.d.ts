// Déclarations pour les modules externes
declare module 'data-chains/src/EmittingDataSource.js' {
  export default class EmittingDataSource {
    constructor();
    addItems(items: any[]): void;
    removeItems(items: any[]): void;
    updateItems(items: any[]): void;
    addListener(event: string, callback: (data: any) => void): void;
    emitEvent(event: string, data: any[]): void;
  }
}

declare module 'data-chains/src/DataLinkMixin' {
  export default function makeDataLink(target: any): void;
}

declare module 'wolfy87-eventemitter' {
  export default class EventEmitter {
    constructor();
    addListener(event: string, callback: (data: any) => void): void;
    emitEvent(event: string, data: any[]): void;
    removeListener(event: string, callback: (data: any) => void): void;
  }
}

declare module 'react-measure' {
  import React from 'react';
  
  interface MeasureProps {
    bounds?: boolean;
    children: (props: { measureRef: React.RefObject<any> }) => React.ReactNode;
    onResize?: (contentRect: { bounds?: { height: number; width: number } }) => void;
  }
  
  export default class Measure extends React.Component<MeasureProps> {}
}

// Déclarations pour les modules .jsx qui seront convertis
declare module '*.jsx' {
  const component: React.ComponentType<any>;
  export default component;
} 
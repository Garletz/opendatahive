declare module 'data-chains/src/EmittingDataSource.js' {
  export default class EmittingDataSource {
    constructor();
    addListener(event: string, callback: (event: any) => void): void;
    removeListener(event: string, callback: (event: any) => void): void;
    emit(event: string, data?: any): void;
    add(item: any): void;
    addItems(items: any[]): void;
    remove(item: any): void;
    update(item: any): void;
    getItems(): any[];
  }
}

declare module 'data-chains/src/DataLinkMixin.js' {
  export default function makeDataLink(this: any): void;
} 
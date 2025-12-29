declare module 'wolfy87-eventemitter' {
  export default class EventEmitter {
    constructor();
    addListener(event: string, callback: (event: any) => void): void;
    removeListener(event: string, callback: (event: any) => void): void;
    emit(event: string, data?: any): void;
    removeAllListeners(event?: string): void;
  }
} 
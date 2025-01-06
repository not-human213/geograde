// OlaMapsWebSDK/olamaps-web-sdk.d.ts
declare module 'OlaMapsWebSDK/olamaps-web-sdk.umd.js' {
    export class Map {
      constructor(options: {
        style: string;
        container: HTMLElement;
        center: [number, number];
        zoom: number;
      });
      on(event: string, callback: () => void): void;
      getCenter(): [number, number];
      remove(): void;
    }
  }
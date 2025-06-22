// Global type declarations for the frontend
declare const faceapi: any;
declare const $: any;
declare const crypto: Crypto;
declare const btoa: (str: string) => string;
declare const unescape: (str: string) => string;
declare const encodeURIComponent: (str: string) => string;

interface Window { 
  ethers: any; 
  ethereum: any;
  location: Location;
  navigator: Navigator;
  URL: typeof URL;
}

// Additional interfaces for this project
interface ExampleItem {
  uri: string;
  name: string;
}
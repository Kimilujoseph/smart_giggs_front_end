// / <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SERVER_HEAD: string;
    // Add other environment variables here
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  
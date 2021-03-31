declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLIENT_ID: string;
      CLIENT_SECRET: string;
      NODE_ENV: "development" | "production";
      PORT?: string;
    }
  }
}

export {};

// Temporary ambient declaration for `socket.io` to silence TypeScript
// Install `socket.io` with `npm install socket.io` to get real types.

declare module "socket.io" {
  import type { Server as HTTPServer } from "http";
  // Minimal exports used in the project. These are `any` to avoid compile errors.
  export type Socket = any;
  export class Server {
    constructor(server?: any, opts?: any);
    on(event: string, cb: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
    to(id: string): any;
  }
  const _default: typeof Server;
  export default _default;
}

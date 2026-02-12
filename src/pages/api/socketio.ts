import { Server, Socket } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

type User = {
  socketId: string;
  name: string;
  color: string;
  pos: { x: number; y: number };
  location: string;
  flag: string;
};

type Message = {
  socketId: string;
  content: string;
  time: string;
  username: string;
};

const users: Record<string, User> = {};
const messages: Message[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Attach Socket.IO server to the underlying HTTP server if not already attached
  // Path: /api/socketio
  if (!(res.socket as any).server.io) {
    const io = new Server((res.socket as any).server, {
      path: "/api/socketio",
      cors: {
        origin: true,
      },
    });

    (res.socket as any).server.io = io;

    io.on("connection", (socket: Socket) => {
      const username = (socket.handshake.query.username as string) || `Anon-${socket.id.slice(0, 4)}`;
      const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      const user: User = {
        socketId: socket.id,
        name: username,
        color,
        pos: { x: 0, y: 0 },
        location: "",
        flag: "",
      };
      users[socket.id] = user;

      // Send initial messages and users list
      socket.emit("msgs-receive-init", messages);
      io.emit("users-updated", Object.values(users));

      socket.on("cursor-change", (data: any) => {
        users[socket.id] = { ...users[socket.id], ...data };
        socket.broadcast.emit("cursor-changed", { ...users[socket.id] });
      });

      socket.on("msg-send", (data: any) => {
        const msg: Message = {
          socketId: socket.id,
          content: data.content || "",
          time: new Date().toISOString(),
          username: users[socket.id]?.name || username,
        };
        messages.push(msg);
        io.emit("msg-receive", msg);
      });

      socket.on("username-change", (data: any) => {
        if (users[socket.id]) {
          users[socket.id].name = data.username || users[socket.id].name;
          io.emit("users-updated", Object.values(users));
        }
      });

      socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("users-updated", Object.values(users));
      });
    });
  }

  res.end();
}

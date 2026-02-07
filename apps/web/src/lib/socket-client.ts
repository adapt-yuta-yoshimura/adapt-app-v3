import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * WebSocket接続を取得する
 * シングルトンパターンで接続を管理
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'ws://app.localhost.adapt:4000', {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
}

/**
 * WebSocket接続を切断する
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

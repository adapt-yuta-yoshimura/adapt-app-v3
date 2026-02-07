import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { MessageService } from '../services/message.service';
import * as jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

/** Socket.IO認証済みクライアント */
interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    email: string;
  };
}

/** メッセージ送信イベントペイロード */
interface MessageSendPayload {
  channelId: string;
  text: string;
  threadId?: string;
  isEmergency?: boolean;
}

/** チャンネル参加イベントペイロード */
interface ChannelJoinPayload {
  channelId: string;
}

/** チャンネル離脱イベントペイロード */
interface ChannelLeavePayload {
  channelId: string;
}

/** タイピング開始/停止イベントペイロード */
interface TypingPayload {
  channelId: string;
}

/**
 * チャットWebSocketゲートウェイ
 * Socket.IO の /chat namespaceでリアルタイムメッセージングを提供する
 *
 * イベント:
 * - message:send    : メッセージ送信
 * - channel:join    : チャンネルルームに参加
 * - channel:leave   : チャンネルルームから離脱
 * - typing:start    : タイピング開始通知
 * - typing:stop     : タイピング停止通知
 *
 * サーバーイベント:
 * - message:new     : 新着メッセージ通知（ルーム内ブロードキャスト）
 * - typing:update   : タイピング状態更新（ルーム内ブロードキャスト）
 */
@WebSocketGateway({
  cors: {
    origin: [
      process.env.APP_URL ?? 'http://app.localhost.adapt:3000',
      process.env.ADMIN_URL ?? 'http://admin.localhost.adapt:3001',
    ],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  private readonly jwksClient: jwksRsa.JwksClient;
  private readonly oidcIssuer: string;

  constructor(private readonly messageService: MessageService) {
    this.oidcIssuer = process.env.OIDC_ISSUER_URL ?? 'http://localhost:8080/realms/adapt';
    this.jwksClient = jwksRsa({
      jwksUri: `${this.oidcIssuer}/protocol/openid-connect/certs`,
      cache: true,
      rateLimit: true,
    });
  }

  /**
   * WebSocket接続時のハンドシェイク認証
   * Authorization ヘッダーまたはクエリパラメータからJWTトークンを検証する
   */
  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ??
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided (${client.id})`);
        client.disconnect();
        return;
      }

      const decoded = await this.verifyOidcToken(token);
      if (!decoded) {
        this.logger.warn(`Connection rejected: Invalid token (${client.id})`);
        client.disconnect();
        return;
      }

      // 認証情報をソケットに保存
      client.data.userId = decoded.sub as string;
      client.data.email = (decoded as any).email as string;

      this.logger.log(`Client connected: ${client.id} (user: ${decoded.sub})`);
    } catch (error) {
      this.logger.warn(`Connection error: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  /**
   * WebSocket切断時の処理
   */
  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * メッセージ送信イベント
   * チャンネルルームに新着メッセージをブロードキャストする
   */
  @SubscribeMessage('message:send')
  async handleMessageSend(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: MessageSendPayload,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await this.messageService.sendMessage(client.data.userId, payload.channelId, {
        text: payload.text,
        threadId: payload.threadId,
        isEmergency: payload.isEmergency,
      });

      // チャンネルルームに新着メッセージをブロードキャスト
      this.server.to(`channel:${payload.channelId}`).emit('message:new', result.message);

      return { success: true, messageId: result.message.id };
    } catch (error) {
      this.logger.warn(
        `Message send failed: ${(error as Error).message} (user: ${client.data.userId})`,
      );
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * チャンネルルーム参加イベント
   */
  @SubscribeMessage('channel:join')
  async handleChannelJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ChannelJoinPayload,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const roomName = `channel:${payload.channelId}`;
      await client.join(roomName);

      this.logger.log(`Client ${client.id} joined channel ${payload.channelId}`);

      return { success: true };
    } catch (error) {
      this.logger.warn(
        `Channel join failed: ${(error as Error).message} (user: ${client.data.userId})`,
      );
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * チャンネルルーム離脱イベント
   */
  @SubscribeMessage('channel:leave')
  async handleChannelLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ChannelLeavePayload,
  ): Promise<{ success: boolean }> {
    const roomName = `channel:${payload.channelId}`;
    await client.leave(roomName);

    this.logger.log(`Client ${client.id} left channel ${payload.channelId}`);

    return { success: true };
  }

  /**
   * タイピング開始イベント
   * チャンネルルーム内の他クライアントに通知する
   */
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: TypingPayload,
  ): void {
    client.to(`channel:${payload.channelId}`).emit('typing:update', {
      userId: client.data.userId,
      channelId: payload.channelId,
      isTyping: true,
    });
  }

  /**
   * タイピング停止イベント
   * チャンネルルーム内の他クライアントに通知する
   */
  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: TypingPayload,
  ): void {
    client.to(`channel:${payload.channelId}`).emit('typing:update', {
      userId: client.data.userId,
      channelId: payload.channelId,
      isTyping: false,
    });
  }

  /**
   * Keycloak JWKS でアクセストークンを検証する
   */
  private verifyOidcToken(token: string): Promise<jwt.JwtPayload | null> {
    return new Promise((resolve) => {
      const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
        this.jwksClient.getSigningKey(header.kid, (err, key) => {
          if (err) return callback(err);
          callback(null, key?.getPublicKey());
        });
      };

      jwt.verify(
        token,
        getKey,
        {
          issuer: this.oidcIssuer,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) {
            this.logger.warn(`OIDC token verification failed: ${err.message}`);
            resolve(null);
          } else {
            resolve(decoded as jwt.JwtPayload);
          }
        },
      );
    });
  }
}

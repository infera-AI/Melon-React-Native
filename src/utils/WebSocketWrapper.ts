import { Buffer } from 'buffer';
global.Buffer = Buffer;

export interface WebSocketMessageEvent {
  data: string | ArrayBuffer | Blob;
}

export interface WebSocketCloseEvent {
  code: number;
  reason: string;
  wasClean: boolean;
}

export interface WebSocketErrorEvent {
  message: string;
}

export enum WSStatus {
  INIT = 'INIT',
  CONNECTING = 'CONNECTING',
  OPEN = 'OPEN',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING',
}

export interface WSConfig {
  url: string;
  protocols?: string | string[];
  heartbeatInterval?: number; // 默认 15s
  reconnectInterval?: number; // 默认 3s
  maxReconnectAttempts?: number; // 默认 3

  onOpen?: () => void;
  onMessage?: (event: any) => void;
  onClose?: (event: any) => void;
  onError?: (event: any) => void;
  onStatusChange?: (status: WSStatus) => void;
}

export class WebSocketWrapper {
  private ws: WebSocket | null = null;
  private config: WSConfig;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private status: WSStatus = WSStatus.INIT;
  private manuallyClosed = false;

  constructor(config: WSConfig) {
    this.config = {
      heartbeatInterval: 15000,
      reconnectInterval: 3000,
      maxReconnectAttempts: 3,
      ...config,
    };
  }

  private updateStatus(status: WSStatus) {
    this.status = status;
    this.config.onStatusChange?.(status);
  }

  getStatus() {
    return this.status;
  }

  connect() {
    if (this.ws && this.status === WSStatus.OPEN) return;

    this.manuallyClosed = false; // reset 标志
    this.updateStatus(WSStatus.CONNECTING);

    this.ws = this.config.protocols
      ? new WebSocket(this.config.url, this.config.protocols)
      : new WebSocket(this.config.url);

    this.ws.binaryType = 'arraybuffer';
    // console.log('socket url--', this.config.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.updateStatus(WSStatus.OPEN);
      this.startHeartbeat();
      this.config.onOpen?.();
    };

    this.ws.onmessage = (event: any) => {
      console.log('socket收到消息:', event.data);
      try {
        const data = JSON.parse(event.data);
        this.config.onMessage?.(data);
      } catch (err) {
        console.warn('[WebSocketWrapper] JSON 解析失败:', err);
      }
    };

    this.ws.onerror = (event: WebSocketErrorEvent) => {
      this.updateStatus(WSStatus.ERROR);
      this.config.onError?.(event);
    };

    this.ws.onclose = (event: any) => {
      this.updateStatus(WSStatus.CLOSED);
      this.config.onClose?.(event);
      this.stopHeartbeat();

      if (!this.manuallyClosed) {
        this.tryReconnect();
      }
    };
  }

  send(data: string | ArrayBuffer | Blob | object | Uint8Array) {
    // console.log('send data----', data);

    if (this.manuallyClosed) {
      console.warn('[WebSocketWrapper] 已手动关闭，禁止发送消息');
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        if (data instanceof ArrayBuffer || data instanceof Blob) {
            
          this.ws.send(data);
        } else if (data instanceof Uint8Array) {
          this.ws.send(data.buffer);
        } else if (typeof data === 'object') {
          this.ws.send(JSON.stringify(data));
        } else {
          this.ws.send(data); // string
        }
      } catch (err) {
        console.error('[WebSocketWrapper] Failed to send data:', err);
      }
    } else {
      console.warn('[WebSocketWrapper] Socket 未开启，无法发送数据');
    }
  }

  close() {
    this.manuallyClosed = true;
    this.updateStatus(WSStatus.CLOSING);
    this.stopHeartbeat();
    this.clearReconnect();
    this.ws?.close();
    this.ws = null;
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    const interval = this.config.heartbeatInterval!;
    this.heartbeatTimer = setInterval(() => {
      if (this.status === WSStatus.OPEN) {
        try {
          console.log('发送心跳---');
          this.ws?.send('ping'); // 可替换为实际心跳格式
        } catch (err) {
          console.error('[WebSocketWrapper] 心跳发送失败:', err);
        }
      }
    }, interval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private tryReconnect() {
    if (
      this.reconnectAttempts >= (this.config.maxReconnectAttempts ?? Infinity)
    ) {
      return;
    }

    this.updateStatus(WSStatus.RECONNECTING);
    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }

  private clearReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

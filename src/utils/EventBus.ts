// 定义所有事件类型（根据你的业务扩展）
type EventMap = {
//   CUSTOM_EVENT: { message: string; value: number };
//   USER_LOGIN: { userId: string; name: string };
  UPDATE_MY_WORKS: void;
  // 新增你需要的事件类型...
};

// 定义事件监听函数的类型
type Listener<T> = (data: T) => void;

// 事件总线核心类（纯手动实现，无任何外部依赖）
class EventBus {
  // 存储事件与对应的监听函数列表：{ 事件名: { 监听函数: 唯一标识 } }
  private events: Record<string, Map<Function, symbol>> = {};

  // 发送事件
  emit<EventName extends keyof EventMap>(
    eventName: EventName,
    data: EventMap[EventName]
  ): void {
    // 如果事件不存在监听，直接返回
    if (!this.events[eventName]) return;

    // 遍历所有监听函数并执行
    Array.from(this.events[eventName].keys()).forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(`EventBus: 执行 ${eventName} 监听时出错:`, error);
      }
    });
  }

  // 监听事件（返回取消监听的函数）
  on<EventName extends keyof EventMap>(
    eventName: EventName,
    listener: Listener<EventMap[EventName]>
  ): () => void {
    // 如果事件不存在，初始化一个Map存储监听函数
    if (!this.events[eventName]) {
      this.events[eventName] = new Map();
    }

    // 生成唯一标识（用于后续移除监听）
    const listenerId = Symbol('listenerId');
    this.events[eventName].set(listener, listenerId);

    // 返回取消监听的函数
    return () => {
      this.off(eventName, listener);
    };
  }

  // 移除指定事件的监听函数
  off<EventName extends keyof EventMap>(
    eventName: EventName,
    listener: Listener<EventMap[EventName]>
  ): void {
    if (!this.events[eventName]) return;
    this.events[eventName].delete(listener);

    // 如果事件没有监听了，清理该事件
    if (this.events[eventName].size === 0) {
      delete this.events[eventName];
    }
  }

  // 移除某个事件的所有监听
  removeAllListeners<EventName extends keyof EventMap>(eventName: EventName): void {
    if (this.events[eventName]) {
      delete this.events[eventName];
    }
  }
}

// 导出单例实例（确保全局唯一）
export const eventBus = new EventBus();

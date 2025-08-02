type PromiseFunction = () => Promise<any>;

interface TaskQueueOptions {
  onBeforeResolve?: () => Promise<void> | void;
}

export type TaskQueueType = {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  push: (userFn: () => Promise<any>) => void;
  runLastTaskNow: () => void;
  processQueue: () => void;  // 公开供手动触发
};

export default class TaskQueue implements TaskQueueType {
  private running = false;
  private paused = false;
  private queue: PromiseFunction[] = [];
  private currentPromise: Promise<any> | null = null;
  private taskId = 0;

  private pausePromise: Promise<void> | null = null;
  private pauseResolver: (() => void) | null = null;

  private onBeforeResolve?: () => Promise<void> | void;

  constructor(options?: TaskQueueOptions) {
    this.onBeforeResolve = options?.onBeforeResolve;
  }

  public start(): void {
    if (!this.running) {
      this.running = true;
      this.processQueue();
    }
  }

  public stop(): void {
    this.running = false;
    this.queue = [];
    this.currentPromise = null;
    this.taskId++;
    this.clearPause();
  }

  public pause(): void {
    if (!this.paused) {
      this.paused = true;
      this.pausePromise = new Promise(resolve => {
        this.pauseResolver = resolve;
      });
    }
  }

  public resume(): void {
    if (this.paused) {
      this.paused = false;
      this.pauseResolver?.();
      this.clearPause();
      this.processQueue();
    }
  }

  private clearPause(): void {
    this.pausePromise = null;
    this.pauseResolver = null;
  }

  private async waitIfPaused(): Promise<void> {
    while (this.paused && this.pausePromise) {
      await this.pausePromise;
    }
  }

  private wrapTask(userFn: () => Promise<any>): () => Promise<any> {
    return async () => {
      await this.waitIfPaused();
      await userFn();
    };
  }

  public push(userFn: () => Promise<any>): void {
    console.log('push进来一个');
    
    const currentTaskId = ++this.taskId;

    const wrappedTask = async () => {
      const wrapped = this.wrapTask(userFn);

      try {
        await wrapped();

        if (this.taskId === currentTaskId && this.onBeforeResolve) {
          await this.onBeforeResolve();
        }
      } finally {
        if (this.taskId === currentTaskId) {
          this.currentPromise = null;
          this.processQueue();
        }
      }
    };

    // 只负责入队，绝不触发执行
    this.queue.push(wrappedTask);
  }

  // 改成 public，方便外部手动触发执行
  public processQueue(): void {
    if (this.running && !this.paused && !this.currentPromise && this.queue.length > 0) {
      const nextTask = this.queue.shift();
      if (nextTask) {
        this.currentPromise = nextTask();
      }
    }
  }

  public runLastTaskNow(): void {
    if (!this.running) {
      this.start();
    }

    if (this.queue.length === 0) return;

    const lastTask = this.queue.pop()!;
    this.queue = [];
    this.taskId++;

    if (!this.paused) {
      if (this.currentPromise) {
        this.currentPromise = null;
      }
      this.currentPromise = lastTask();
    } else {
      this.queue.unshift(lastTask);
    }
  }
}

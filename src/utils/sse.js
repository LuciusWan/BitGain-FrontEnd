/**
 * SSE (Server-Sent Events) 工具类
 * 支持 POST 方法和自定义 headers
 */
export class SSE {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      method: 'GET',
      headers: {},
      payload: null,
      start: true,
      ...options
    };
    
    this.eventSource = null;
    this.listeners = {};
    this.readyState = 0; // 0: CONNECTING, 1: OPEN, 2: CLOSED
    
    if (this.options.start) {
      this.stream();
    }
  }
  
  /**
   * 开始 SSE 连接
   */
  stream() {
    if (this.readyState === 1) {
      console.warn('SSE connection is already open');
      return;
    }
    
    this.readyState = 0;
    
    // 如果是 GET 方法，使用原生 EventSource
    if (this.options.method === 'GET') {
      this._createEventSource();
    } else {
      // 如果是 POST 方法，使用 fetch + stream
      this._createFetchStream();
    }
  }
  
  /**
   * 创建原生 EventSource (GET 方法)
   */
  _createEventSource() {
    try {
      this.eventSource = new EventSource(this.url);
      
      this.eventSource.onopen = (event) => {
        this.readyState = 1;
        this._dispatchEvent('open', event);
      };
      
      this.eventSource.onmessage = (event) => {
        this._dispatchEvent('message', event);
      };
      
      this.eventSource.onerror = (event) => {
        this.readyState = 2;
        this._dispatchEvent('error', event);
      };
    } catch (error) {
      this.readyState = 2;
      this._dispatchEvent('error', { error });
    }
  }
  
  /**
   * 创建 Fetch Stream (POST 方法)
   */
  async _createFetchStream() {
    try {
      const response = await fetch(this.url, {
        method: this.options.method,
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          ...this.options.headers
        },
        body: this.options.payload
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      this.readyState = 1;
      this._dispatchEvent('open', { type: 'open' });
      
      this.reader = response.body.getReader();
      const reader = this.reader;
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (this.readyState === 1) {
        const { done, value } = await reader.read();
        
        if (done || this.readyState !== 1) {
          this.readyState = 2;
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 保留最后一行（可能不完整）
        
        for (const line of lines) {
          this._processLine(line);
        }
      }
    } catch (error) {
      this.readyState = 2;
      this._dispatchEvent('error', { error: error.message });
    }
  }
  
  /**
   * 处理 SSE 数据行
   */
  _processLine(line) {
    if (line.startsWith('data: ')) {
      const data = line.substring(6);
      this._dispatchEvent('message', { data, type: 'message' });
    } else if (line.startsWith('event: ')) {
      // 处理自定义事件类型
      const eventType = line.substring(7);
      this.currentEventType = eventType;
    } else if (line === '') {
      // 空行表示消息结束
      this.currentEventType = null;
    } else if (line.startsWith('data:')) {
      // 处理没有空格的data:前缀
      const data = line.substring(5);
      this._dispatchEvent('message', { data, type: 'message' });
    }
  }
  
  /**
   * 添加事件监听器
   */
  addEventListener(type, listener) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }
  
  /**
   * 移除事件监听器
   */
  removeEventListener(type, listener) {
    if (this.listeners[type]) {
      const index = this.listeners[type].indexOf(listener);
      if (index > -1) {
        this.listeners[type].splice(index, 1);
      }
    }
  }
  
  /**
   * 分发事件
   */
  _dispatchEvent(type, event) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in SSE event listener:', error);
        }
      });
    }
  }
  
  /**
   * 关闭连接
   */
  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    // 对于fetch流，设置readyState为CLOSED
    this.readyState = 2;
    this.listeners = {};
    
    // 强制终止读取循环
    if (this.reader) {
      this.reader.cancel().catch(() => {});
      this.reader = null;
    }
  }
  
  /**
   * 获取连接状态
   */
  getReadyState() {
    return this.readyState;
  }
}
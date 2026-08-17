export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    }
  }

  emit(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro no evento "${event}":`, error);
        }
      });
    }
  }
}
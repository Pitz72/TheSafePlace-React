import { eventBus } from '../events/eventBus';

describe('EventBus', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('should register and emit events', () => {
    const mockCallback = jest.fn();
    const cleanup = eventBus.on('test:event', mockCallback);

    eventBus.emit('test:event', { data: 'test' });

    expect(mockCallback).toHaveBeenCalledWith({ data: 'test' });
    expect(mockCallback).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it('should handle multiple listeners for the same event', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();

    eventBus.on('test:event', mockCallback1);
    eventBus.on('test:event', mockCallback2);

    eventBus.emit('test:event', 'data');

    expect(mockCallback1).toHaveBeenCalledWith('data');
    expect(mockCallback2).toHaveBeenCalledWith('data');
  });

  it('should remove listeners correctly', () => {
    const mockCallback = jest.fn();
    eventBus.on('test:event', mockCallback);

    eventBus.emit('test:event');
    expect(mockCallback).toHaveBeenCalledTimes(1);

    eventBus.off('test:event', mockCallback);
    eventBus.emit('test:event');
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should handle errors in listeners gracefully', () => {
    const mockErrorCallback = jest.fn(() => {
      throw new Error('Test error');
    });
    const mockGoodCallback = jest.fn();

    eventBus.on('test:event', mockErrorCallback);
    eventBus.on('test:event', mockGoodCallback);

    expect(() => eventBus.emit('test:event')).not.toThrow();
    expect(mockGoodCallback).toHaveBeenCalledTimes(1);
  });

  it('should return cleanup function from on()', () => {
    const mockCallback = jest.fn();
    const cleanup = eventBus.on('test:event', mockCallback);

    eventBus.emit('test:event');
    expect(mockCallback).toHaveBeenCalledTimes(1);

    cleanup();
    eventBus.emit('test:event');
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should track listener counts', () => {
    expect(eventBus.listenerCount('test:event')).toBe(0);

    const cleanup1 = eventBus.on('test:event', () => {});
    const cleanup2 = eventBus.on('test:event', () => {});

    expect(eventBus.listenerCount('test:event')).toBe(2);

    cleanup1();
    expect(eventBus.listenerCount('test:event')).toBe(1);

    cleanup2();
    expect(eventBus.listenerCount('test:event')).toBe(0);
  });

  it('should list registered events', () => {
    eventBus.on('event1', () => {});
    eventBus.on('event2', () => {});
    eventBus.on('event1', () => {}); // Duplicate event

    const events = eventBus.events();
    expect(events).toContain('event1');
    expect(events).toContain('event2');
    expect(events.length).toBe(2);
  });

  it('should clear all listeners', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();

    eventBus.on('event1', mockCallback1);
    eventBus.on('event2', mockCallback2);

    eventBus.clear();

    eventBus.emit('event1');
    eventBus.emit('event2');

    expect(mockCallback1).not.toHaveBeenCalled();
    expect(mockCallback2).not.toHaveBeenCalled();
    expect(eventBus.events()).toHaveLength(0);
  });
});
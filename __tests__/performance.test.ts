import { Performance } from '../src/utils/performance';

describe('Performance', () => {
  let performance: Performance;

  beforeEach(() => {
    performance = new Performance();
  });

  it('should create performance instance', () => {
    expect(performance).toBeInstanceOf(Performance);
  });

  it('should track operation timing', () => {
    const operationName = 'test-operation';

    performance.start(operationName);
    const duration = performance.end(operationName);

    expect(typeof duration).toBe('number');
    expect(duration).toBeGreaterThanOrEqual(0);

    const metrics = performance.getAll();
    expect(metrics).toHaveProperty(operationName);
    expect(metrics[operationName]).toHaveProperty('startTime');
    expect(metrics[operationName]).toHaveProperty('endTime');
    expect(metrics[operationName]).toHaveProperty('duration');
  });

  it('should handle multiple operations', () => {
    performance.start('operation1');
    performance.start('operation2');
    performance.end('operation1');
    performance.end('operation2');

    const metrics = performance.getAll();
    expect(Object.keys(metrics)).toHaveLength(2);
    expect(metrics).toHaveProperty('operation1');
    expect(metrics).toHaveProperty('operation2');
  });

  it('should return summary of metrics', () => {
    performance.start('test');
    performance.end('test');

    const summary = performance.summary();
    expect(summary).toContain('test');
    expect(summary).toContain('ms');
  });

  it('should reset metrics', () => {
    performance.start('test');
    performance.end('test');

    performance.reset();

    const metrics = performance.getAll();
    expect(Object.keys(metrics)).toHaveLength(0);
  });

  it('should throw error for non-existent operation', () => {
    expect(() => {
      performance.end('non-existent');
    }).toThrow("Performance metric 'non-existent' not found");
  });
});

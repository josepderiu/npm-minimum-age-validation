import type { PerformanceMetrics } from '../types';

/**
 * Performance tracking utility for measuring operation durations.
 *
 * @remarks
 * This class provides a simple API for tracking execution times of operations
 * such as validation runs, network requests, and file I/O. Useful for
 * identifying bottlenecks and monitoring performance regressions.
 *
 * @example
 * ```typescript
 * const perf = new Performance();
 *
 * perf.start('validation');
 * await validatePackages(config);
 * const duration = perf.end('validation');
 * console.log(`Validation took ${duration}ms`);
 *
 * // Get summary of all metrics
 * console.log(perf.summary()); // "validation: 1234ms, fetch: 567ms"
 * ```
 *
 * @public
 */
export class Performance {
  private metrics: PerformanceMetrics = {};

  /**
   * Start tracking an operation.
   * @param key - Unique identifier for this operation
   * @remarks
   * Records the current timestamp as the start time. Call `end(key)` with the
   * same key to complete the measurement.
   */
  start(key: string): void {
    this.metrics[key] = {
      startTime: Date.now(),
    };
  }

  /**
   * End tracking an operation and calculate its duration.
   * @param key - The identifier used in the corresponding `start()` call
   * @returns The duration in milliseconds
   * @throws {Error} If the metric key was not started
   * @remarks
   * Calculates the elapsed time since `start(key)` was called and stores
   * the duration. Returns the duration for convenience.
   */
  end(key: string): number {
    const metric = this.metrics[key];
    if (!metric) {
      throw new Error(`Performance metric '${key}' not found`);
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;

    return metric.duration;
  }

  /**
   * Get the duration of a completed operation.
   * @param key - The operation identifier
   * @returns The duration in milliseconds, or 0 if not found or not completed
   * @remarks
   * Use this to retrieve a previously measured duration without recalculating.
   */
  get(key: string): number {
    const metric = this.metrics[key];
    if (!metric || !metric.duration) {
      return 0;
    }
    return metric.duration;
  }

  /**
   * Get all recorded metrics.
   * @returns A copy of all performance metrics
   * @remarks
   * Returns a shallow copy to prevent external mutation of internal state.
   */
  getAll(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset all performance metrics.
   * @remarks
   * Clears all recorded metrics. Useful for starting fresh measurements
   * between validation runs.
   */
  reset(): void {
    this.metrics = {};
  }

  /**
   * Get a human-readable summary of all completed metrics.
   * @returns A comma-separated string of "key: Xms" pairs
   * @example
   * ```typescript
   * perf.summary();
   * // Returns: "total-validation: 1234ms, registry-fetch: 567ms"
   * ```
   */
  summary(): string {
    const entries = Object.entries(this.metrics)
      .filter(([_, metric]) => metric.duration !== undefined)
      .map(([key, metric]) => `${key}: ${metric.duration}ms`)
      .join(', ');

    return entries || 'No metrics recorded';
  }
}

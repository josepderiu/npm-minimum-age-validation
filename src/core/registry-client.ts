import https from 'https';
import NodeCache from 'node-cache';
import type { CacheEntry, RegistryConfig } from '../types';
import type { ILogger } from '../utils/logger-interface';
import { PackageFormatter } from '../utils/package-formatter';
import { PinoLogger } from '../utils/pino-logger';

/**
 * Client for fetching package metadata from npm registry.
 *
 * Features:
 * - Concurrent requests with configurable concurrency limit
 * - Local caching with configurable TTL
 * - Automatic retry with exponential backoff
 * - Filters out local/file packages
 * - Graceful error handling (failed fetches cached with error message)
 *
 * Performance:
 * - Batches requests to respect concurrency limits
 * - Caches responses to minimize registry hits
 * - Uses node-cache for fast in-memory lookups
 *
 * @example
 * ```typescript
 * const config = createDefaultConfig();
 * const client = new RegistryClient(config.registry!);
 *
 * const packages = ['lodash@4.17.21', 'express@4.18.0'];
 * const dates = await client.getPackagesPublishDates(packages);
 *
 * dates.forEach((date, pkg) => {
 *   console.log(`${pkg} published on ${date.toISOString()}`);
 * });
 * ```
 */
export class RegistryClient {
  private config: RegistryConfig;
  private cache: NodeCache;
  private logger: ILogger;

  /**
   * Creates a new RegistryClient instance
   *
   * @param config - Registry configuration (URL, concurrency, timeout, caching)
   * @param logger - Logger instance (defaults to PinoLogger)
   */
  constructor(config: RegistryConfig, logger: ILogger = new PinoLogger()) {
    this.config = config;
    this.logger = logger;
    this.cache = new NodeCache({
      stdTTL: config.cacheTtlMinutes * 60,
      checkperiod: 60,
      useClones: false,
    });
  }

  /**
   * Fetches publish dates for multiple packages from npm registry.
   *
   * Process:
   * 1. Filters out local/file packages (e.g., file:../lib)
   * 2. Returns cached results for already-fetched packages
   * 3. Batches uncached requests based on concurrency limit
   * 4. Retries failed requests with exponential backoff
   * 5. Caches all results (including errors) with configured TTL
   *
   * @param packages - Array of package strings in "name@version" format
   * @returns Promise resolving to Map of package@version -> publish Date
   *
   * @remarks
   * Failed fetches are cached with error message to prevent repeated
   * failures. Check Map size to detect packages that couldn't be fetched.
   *
   * @example
   * ```typescript
   * const packages = [
   *   'lodash@4.17.21',
   *   'express@4.18.0',
   *   'file:../local-pkg' // Filtered out
   * ];
   *
   * const dates = await client.getPackagesPublishDates(packages);
   * console.log(`Fetched ${dates.size} publish dates`);
   * ```
   */
  async getPackagesPublishDates(packages: string[]): Promise<Map<string, Date>> {
    // Filter out local packages (those starting with file: or containing local paths)
    const npmPackages = packages.filter(
      (pkg) => !pkg.startsWith('file:') && !pkg.startsWith('./') && !pkg.includes('lib/@')
    );

    const cached = this.getCachedPackages(npmPackages);
    const uncached = npmPackages.filter((pkg) => !cached.has(pkg));

    if (uncached.length > 0) {
      await this.fetchUncachedPackages(uncached);
    }

    return this.getCachedPackages(npmPackages);
  }

  private getCachedPackages(packages: string[]): Map<string, Date> {
    const result = new Map<string, Date>();

    packages.forEach((pkg) => {
      const cacheEntry = this.cache.get<CacheEntry>(pkg);
      if (cacheEntry && cacheEntry.publishDate) {
        result.set(pkg, cacheEntry.publishDate);
      }
    });

    return result;
  }

  private async fetchUncachedPackages(packages: string[]): Promise<void> {
    // Parse package strings into name@version format
    const packageInfos = packages.map((pkg) => {
      const parts = pkg.split('@');
      if (parts.length >= 2) {
        const version = parts.pop()!;
        const name = parts.join('@');
        return { name, version };
      }
      return { name: pkg, version: 'latest' };
    });

    const batches = this.createBatches(packageInfos, this.config.concurrency);

    for (const batch of batches) {
      const promises = batch.map((pkg) =>
        this.fetchPackageInfoWithRetry(pkg.name, pkg.version)
          .then((date) => ({ pkg, date, error: null }))
          .catch((error) => ({ pkg, date: null, error: error.message }))
      );

      const results = await Promise.all(promises);

      results.forEach(({ pkg, date, error }) => {
        const key = PackageFormatter.toKey(pkg.name, pkg.version);
        const cacheEntry: CacheEntry = {
          publishDate: date,
          timestamp: Date.now(),
          error: error || undefined,
        };

        this.cache.set(key, cacheEntry);

        if (error) {
          this.logger.warn(`Failed to fetch ${key}: ${error}`);
        } else if (date && !isNaN(date.getTime())) {
          this.logger.debug(`Cached ${key}: ${date.toISOString()}`);
        } else {
          this.logger.debug(`Cached ${key}: invalid date`);
        }
      });
    }
  }

  private async fetchPackageInfoWithRetry(
    packageName: string,
    version: string
  ): Promise<Date | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        const date = await this.fetchPackageInfo(packageName, version);
        if (attempt > 1) {
          this.logger.debug(`Succeeded on attempt ${attempt} for ${packageName}@${version}`);
        }
        return date;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          this.logger.debug(
            `Attempt ${attempt} failed for ${packageName}@${version}, retrying in ${delay}ms`
          );
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  private fetchPackageInfo(packageName: string, version: string): Promise<Date | null> {
    // Use npm registry API to get package metadata including time info
    // Security note: packageName is sanitized - local file paths are filtered
    // in getPackagesPublishDates() before reaching this method. The URL is built
    // from config.url (NPM registry) and the package name is properly encoded.
    // lgtm[js/file-access-to-http]
    const url = `${this.config.url}/${encodeURIComponent(packageName)}`;

    return new Promise((resolve, reject) => {
      const request = https.get(url, { timeout: this.config.timeout }, (response) => {
        let data = '';

        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => {
          try {
            if (response.statusCode === 200) {
              const packageInfo = JSON.parse(data);

              // Check if version exists in time object
              if (packageInfo.time && packageInfo.time[version]) {
                const publishDate = new Date(packageInfo.time[version]);
                if (!isNaN(publishDate.getTime())) {
                  resolve(publishDate);
                } else {
                  this.logger.warn(
                    `Invalid date for ${packageName}@${version}: ${packageInfo.time[version]}`
                  );
                  resolve(null);
                }
              } else if (
                packageInfo.time &&
                version === 'latest' &&
                packageInfo['dist-tags']?.latest
              ) {
                // Handle 'latest' version by getting the actual latest version
                const latestVersion = packageInfo['dist-tags'].latest;
                const publishDate = new Date(packageInfo.time[latestVersion]);
                if (!isNaN(publishDate.getTime())) {
                  resolve(publishDate);
                } else {
                  this.logger.warn(
                    `Invalid date for ${packageName}@${latestVersion}: ${packageInfo.time[latestVersion]}`
                  );
                  resolve(null);
                }
              } else {
                this.logger.warn(`No time info for ${packageName}@${version}`);
                resolve(null);
              }
            } else if (response.statusCode === 404) {
              resolve(null);
            } else {
              reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
            }
          } catch (error) {
            reject(new Error(`JSON parsing failed: ${error}`));
          }
        });
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error(`Request timeout after ${this.config.timeout}ms`));
      });

      request.on('error', reject);
    });
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getCacheStats(): { keys: number; hits: number; misses: number } {
    const stats = this.cache.getStats();
    return {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
    };
  }

  clearCache(): void {
    this.cache.flushAll();
  }
}

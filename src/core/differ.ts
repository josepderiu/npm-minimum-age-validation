import fs from 'fs';
import type { GitDiffResult, PackageInfo } from '../types';
import { GitHelper } from '../utils/git-helper';
import type { ILogger } from '../utils/logger-interface';
import { PinoLogger } from '../utils/pino-logger';

/**
 * Type definitions for package-lock.json structure
 */
interface PackageLockPackage {
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

interface PackageLockData {
  packages?: Record<string, PackageLockPackage>;
  [key: string]: unknown;
}

/**
 * Analyzes package-lock.json changes to identify modified packages.
 *
 * Uses git diff to detect newly added or version-changed packages since
 * the last commit. Falls back to analyzing all packages if not in a git
 * repository or if package-lock.json is newly created.
 *
 * @example
 * ```typescript
 * const differ = new PackageLockDiffer();
 * const result = differ.getModifiedPackages();
 * console.log(`Found ${result.modified.length} modified packages`);
 * ```
 */
export class PackageLockDiffer {
  private readonly packageLockFile = 'package-lock.json';
  private logger: ILogger;

  /**
   * Creates a new PackageLockDiffer instance
   * @param logger - Logger instance (defaults to PinoLogger)
   */
  constructor(logger: ILogger = new PinoLogger()) {
    this.logger = logger;
  }

  /**
   * Analyzes package-lock.json to find modified packages since last git commit.
   *
   * Strategy:
   * - If not in git repo: analyzes all direct dependencies
   * - If no changes: returns empty result
   * - If new file: analyzes all direct dependencies
   * - If modified: computes diff between HEAD and working directory
   *
   * @returns GitDiffResult with modified packages and metadata
   * @throws Error if package-lock.json cannot be read or parsed
   *
   * @example
   * ```typescript
   * const result = differ.getModifiedPackages();
   * if (result.isNewFile) {
   *   console.log('New package-lock.json detected');
   * }
   * console.log(`${result.modified.length} packages changed`);
   * ```
   */
  getModifiedPackages(): GitDiffResult {
    try {
      if (!GitHelper.isGitRepository()) {
        this.logger.warn('Not a git repository, analyzing all packages');
        return this.analyzeAllPackages();
      }

      if (!GitHelper.hasPackageLockChanges()) {
        this.logger.debug('No changes in package-lock.json');
        return { modified: [], isNewFile: false, changedFiles: [] };
      }

      const currentContent = fs.readFileSync(this.packageLockFile, 'utf-8');
      const headContent = GitHelper.getPackageLockFromHead();

      if (!headContent) {
        this.logger.info('package-lock.json is new, analyzing direct dependencies');
        return {
          modified: this.extractDirectDependencies(JSON.parse(currentContent)),
          isNewFile: true,
          changedFiles: [this.packageLockFile],
        };
      }

      const currentLock = JSON.parse(currentContent);
      const headLock = JSON.parse(headContent);

      return {
        modified: this.computePackageDiff(headLock, currentLock),
        isNewFile: false,
        changedFiles: [this.packageLockFile],
      };
    } catch (error) {
      throw new Error(`Error analyzing package-lock.json changes: ${(error as Error).message}`);
    }
  }

  private analyzeAllPackages(): GitDiffResult {
    try {
      const currentContent = fs.readFileSync(this.packageLockFile, 'utf-8');
      const currentLock = JSON.parse(currentContent);

      return {
        modified: this.extractDirectDependencies(currentLock),
        isNewFile: true,
        changedFiles: [this.packageLockFile],
      };
    } catch {
      this.logger.error('Could not read package-lock.json');
      return { modified: [], isNewFile: false, changedFiles: [] };
    }
  }

  private computePackageDiff(oldLock: PackageLockData, newLock: PackageLockData): PackageInfo[] {
    const modified: PackageInfo[] = [];
    const oldPackages = oldLock.packages || {};
    const newPackages = newLock.packages || {};

    // Build parent map for efficient lookup
    const parentMap = this.buildParentMap(newLock);

    // Compare packages
    for (const [packagePath, packageInfo] of Object.entries(newPackages)) {
      if (packagePath === '' || !packageInfo || typeof packageInfo !== 'object') continue;

      const currentInfo = packageInfo;
      const oldPackageInfo = oldPackages[packagePath];
      const hasChanged = !oldPackageInfo || oldPackageInfo.version !== currentInfo.version;

      if (hasChanged && currentInfo.version) {
        const packageName = this.extractPackageName(packagePath);
        const parent = parentMap.get(packageName) || this.inferParent(packagePath);

        modified.push({
          name: packageName,
          version: currentInfo.version,
          parent: parent,
          isNew: !oldPackageInfo,
        });
      }
    }

    this.logger.debug(`Found ${modified.length} modified packages`);
    return modified;
  }

  private buildParentMap(lockData: PackageLockData): Map<string, string> {
    const parentMap = new Map<string, string>();
    const rootPackage = lockData.packages?.[''] || {};

    // Map direct dependencies first
    Object.keys(rootPackage.dependencies || {}).forEach((name) => {
      parentMap.set(name, 'root (dependency)');
    });

    Object.keys(rootPackage.devDependencies || {}).forEach((name) => {
      parentMap.set(name, 'root (devDependency)');
    });

    // Now map transitive dependencies by examining each package's dependencies
    Object.entries(lockData.packages || {}).forEach(([packagePath, packageInfo]) => {
      if (packagePath === '' || !packageInfo) return;

      const parentName = this.extractPackageName(packagePath);
      const dependencies = packageInfo.dependencies || {};

      // For each dependency of this package, set the parent relationship
      Object.keys(dependencies).forEach((depName) => {
        // Only set parent if not already set (prefer the first parent found)
        if (!parentMap.has(depName)) {
          parentMap.set(depName, parentName);
        }
      });
    });

    return parentMap;
  }

  private extractPackageName(packagePath: string): string {
    const cleanPath = packagePath.replace('node_modules/', '');
    const segments = cleanPath.split('/node_modules/');
    return segments[segments.length - 1];
  }

  private inferParent(packagePath: string): string {
    const segments = packagePath.split('/node_modules/');
    if (segments.length > 2) {
      return segments[segments.length - 2];
    }
    return 'root';
  }

  private extractDirectDependencies(lockData: PackageLockData): PackageInfo[] {
    const packages: PackageInfo[] = [];
    const rootPackage = lockData.packages?.[''] || {};

    Object.entries(rootPackage.dependencies || {}).forEach(([name, version]) => {
      packages.push({
        name,
        version: (version as string).replace(/[\^~]/, ''),
        parent: 'root (dependency)',
        isNew: true,
      });
    });

    Object.entries(rootPackage.devDependencies || {}).forEach(([name, version]) => {
      packages.push({
        name,
        version: (version as string).replace(/[\^~]/, ''),
        parent: 'root (devDependency)',
        isNew: true,
      });
    });

    return packages;
  }
}

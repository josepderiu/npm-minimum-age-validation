import type { PackageInfo, PackageViolation, ValidationResult, ValidatorConfig } from '../types';
import type { ILogger } from '../utils/logger-interface';
import { PackageFormatter } from '../utils/package-formatter';
import { Performance } from '../utils/performance';
import { PinoLogger } from '../utils/pino-logger';
import { PackageLockDiffer } from './differ';
import { RegistryClient } from './registry-client';

/**
 * Core package validator that checks npm package ages against minimum age requirement.
 *
 * Workflow:
 * 1. Analyzes git diff to find modified packages
 * 2. Filters out trusted packages (configurable patterns)
 * 3. Fetches publish dates from npm registry
 * 4. Validates each package meets minimum age requirement
 * 5. Returns validation result with violations and summary
 *
 * Performance:
 * - Uses async Pino logger (zero event loop blocking)
 * - Concurrent registry requests (configurable)
 * - Local caching of registry responses (configurable TTL)
 * - Pre-compiled regex patterns for trusted package matching
 *
 * @example
 * ```typescript
 * const config = createDefaultConfig();
 * const validator = new PackageValidator(config);
 * const result = await validator.validate();
 *
 * if (!result.success) {
 *   console.error(`${result.violations.length} packages are too new`);
 *   process.exit(1);
 * }
 * ```
 */
export class PackageValidator {
  private config: ValidatorConfig;
  private registryClient: RegistryClient;
  private differ: PackageLockDiffer;
  private logger: ILogger;
  private performance: Performance;
  private trustedPatternsCache: Map<string, RegExp>;

  /**
   * Creates a new PackageValidator instance
   *
   * @param config - Validator configuration
   *
   * @remarks
   * Pre-compiles regex patterns for trusted packages to optimize runtime
   * performance. Patterns with wildcards (e.g., '@angular/*') are converted
   * to regex at construction time rather than per-package validation.
   */
  constructor(config: ValidatorConfig) {
    this.config = config;
    this.logger = new PinoLogger(
      config.output?.logLevel || 'info',
      config.output?.colors !== false
    );
    this.performance = new Performance();
    this.registryClient = new RegistryClient(config.registry!, this.logger);
    this.differ = new PackageLockDiffer(this.logger);

    // Pre-compile regex patterns for performance (O(m) once vs O(m) per package)
    this.trustedPatternsCache = new Map(
      config.trustedPackages
        .filter((pattern) => pattern.includes('*'))
        .map((pattern) => [pattern, new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')])
    );
  }

  /**
   * Validates npm packages against minimum age requirement.
   *
   * Process:
   * 1. Analyzes git diff to find modified packages since last commit
   * 2. Filters trusted packages based on config patterns
   * 3. Fetches publish dates from npm registry (with caching)
   * 4. Validates each package meets minimum age in hours
   * 5. Returns result with violations and performance metrics
   *
   * @returns Promise resolving to ValidationResult
   *
   * @example
   * ```typescript
   * const result = await validator.validate();
   *
   * if (!result.success) {
   *   result.violations.forEach(v => {
   *     console.error(`${v.name}@${v.version} is only ${v.ageInHours}h old`);
   *   });
   *   process.exit(1);
   * }
   *
   * console.log(`✅ All ${result.summary.totalPackages} packages validated`);
   * console.log(`Execution time: ${result.summary.executionTimeMs}ms`);
   * ```
   */
  async validate(): Promise<ValidationResult> {
    this.performance.start('total-validation');
    this.logger.info('🔍 Validating npm package ages...\n');

    try {
      // 1. Get modified packages
      this.performance.start('diff-analysis');
      const { modified: modifiedPackages } = this.differ.getModifiedPackages();
      this.performance.end('diff-analysis');

      if (modifiedPackages.length === 0) {
        this.logger.success('No new or modified packages to validate');
        return this.createResult(true, [], modifiedPackages);
      }

      this.logger.info(`📦 Analyzing ${modifiedPackages.length} modified packages...\n`);

      // 2. Filter trusted packages
      const packagesToValidate = modifiedPackages.filter((pkg) => !this.isTrustedPackage(pkg.name));

      if (packagesToValidate.length === 0) {
        this.logger.success('All packages are in the trusted list');
        return this.createResult(true, [], modifiedPackages);
      }

      this.logger.debug(
        `${modifiedPackages.length - packagesToValidate.length} packages skipped (trusted)`
      );

      // 3. Fetch publish dates
      this.performance.start('registry-fetch');
      const packageStrings = packagesToValidate.map((pkg) => PackageFormatter.fromPackageInfo(pkg));
      const publishDates = await this.registryClient.getPackagesPublishDates(packageStrings);
      this.performance.end('registry-fetch');

      // 4. Validate ages
      this.performance.start('age-validation');
      const violations = this.validatePackageAges(packagesToValidate, publishDates);
      this.performance.end('age-validation');

      // 5. Build result
      const totalTime = this.performance.end('total-validation');

      if (violations.length > 0) {
        this.displayViolations(violations);
        return this.createResult(false, violations, modifiedPackages, totalTime);
      }

      this.logger.success(
        `All packages meet the minimum age requirement of ${this.config.minimumAgeHours}h (${totalTime}ms)`
      );
      return this.createResult(true, violations, modifiedPackages, totalTime);
    } catch (error) {
      this.performance.end('total-validation');
      this.logger.error('Validation failed:', error);
      throw error;
    }
  }

  private validatePackageAges(
    packages: PackageInfo[],
    publishDates: Map<string, Date | null>
  ): PackageViolation[] {
    const violations: PackageViolation[] = [];
    const now = new Date();

    packages.forEach((pkg) => {
      const key = PackageFormatter.fromPackageInfo(pkg);
      const publishDate = publishDates.get(key);

      if (publishDate) {
        const ageInHours = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60);
        const isOldEnough = ageInHours >= this.config.minimumAgeHours;

        const status = isOldEnough ? '✅' : '❌';

        // Only log individual packages when verbose mode is enabled
        if (this.config.output?.verbose) {
          this.logger.step(
            `${PackageFormatter.fromPackageInfo(pkg)} (${ageInHours.toFixed(1)}h) ${status}`
          );
        }

        if (!isOldEnough) {
          violations.push({
            name: pkg.name,
            version: pkg.version,
            parent: pkg.parent,
            publishDate,
            ageInHours: parseFloat(ageInHours.toFixed(1)),
          });
        }
      } else {
        // Only log packages with unknown dates when verbose mode is enabled
        if (this.config.output?.verbose) {
          this.logger.step(`${PackageFormatter.fromPackageInfo(pkg)} (publish date unknown) ⚠️`);
        }
        // Si no podemos obtener la fecha, lo consideramos seguro (puede ser paquete privado)
      }
    });

    return violations;
  }

  private isTrustedPackage(packageName: string): boolean {
    return this.config.trustedPackages.some((pattern) => {
      if (pattern.includes('*')) {
        // Use cached regex pattern for performance
        const regex = this.trustedPatternsCache.get(pattern);
        return regex ? regex.test(packageName) : false;
      }
      return packageName === pattern;
    });
  }

  private displayViolations(violations: PackageViolation[]): void {
    this.logger.error(
      `🚫 COMMIT BLOCKED: ${violations.length} packages do not meet the minimum age requirement of ${this.config.minimumAgeHours}h:\n`
    );

    violations.forEach((pkg) => {
      this.logger.step(
        `• ${PackageFormatter.fromPackageInfo(pkg)} (${pkg.ageInHours}h) - parent: ${pkg.parent}`
      );
    });

    this.logger.info('\n💡 Solutions:');
    this.logger.step(`1. Wait ${this.config.minimumAgeHours}h before using these packages`);
    this.logger.step('2. Use an older version of the package');
    this.logger.step('3. Add to trustedPackages after manual verification');
    this.logger.step('4. Emergency bypass: git commit --no-verify');
  }

  private createResult(
    success: boolean,
    violations: PackageViolation[],
    allPackages: PackageInfo[],
    executionTime: number = 0
  ): ValidationResult {
    return {
      success,
      violations,
      summary: {
        totalPackages: allPackages.length,
        newPackages: allPackages.filter((p) => p.isNew).length,
        modifiedPackages: allPackages.filter((p) => !p.isNew).length,
        violations: violations.length,
        executionTimeMs: executionTime,
      },
    };
  }
}

export async function validatePackages(
  config?: Partial<ValidatorConfig>
): Promise<ValidationResult> {
  const { createDefaultConfig } = await import('../config/default-config');
  const fullConfig = { ...createDefaultConfig(), ...config };
  const validator = new PackageValidator(fullConfig);
  return validator.validate();
}

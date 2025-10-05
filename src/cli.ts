#!/usr/bin/env node

/**
 * CLI interface for npm-minimum-age-validation
 *
 * Commands:
 * - validate: Validate package ages in current repository
 * - config: Generate default configuration file
 *
 * Options:
 * - --config: Load configuration from file
 * - --min-age: Override minimum age requirement
 * - --trusted: Override trusted packages list
 * - --format: Output format (console/json)
 * - --verbose: Enable detailed logging
 * - --no-cache: Disable registry response caching
 * - --dry-run: Validate without blocking commit
 * - --registry: Override npm registry URL
 * - --concurrency: Override concurrent request limit
 *
 * Exit Codes:
 * - 0: All packages passed validation
 * - 1: Validation failed or error occurred
 *
 * @example
 * ```bash
 * # Validate with defaults (24h minimum age)
 * npx validate-packages validate
 *
 * # Validate with custom configuration
 * npx validate-packages validate --config ./custom.json
 *
 * # Validate with 48h minimum age
 * npx validate-packages validate --min-age 48
 *
 * # Generate default config file
 * npx validate-packages config --output .validator.json
 * ```
 */

import chalk from 'chalk';
import { Command } from 'commander';
import { createDefaultConfig, loadConfig, validatePackages } from './index';
import type { ValidatorConfig, ValidationResult } from './types';
import { Performance } from './utils/performance';
import { PinoLogger } from './utils/pino-logger';

const program = new Command();
const logger = new PinoLogger('info', true);
const perf = new Performance();

program
  .name('validate-packages')
  .description('Enterprise npm package security validator')
  .version('1.0.0')
  .option('-c, --config <file>', 'configuration file path')
  .option('-a, --min-age <hours>', 'minimum package age in hours', '24')
  .option('-t, --trusted <packages>', 'comma-separated trusted package patterns')
  .option('-f, --format <format>', 'output format (console|json)', 'console')
  .option('-v, --verbose', 'verbose output')
  .option('--no-cache', 'disable registry cache')
  .option('--dry-run', 'perform validation without blocking')
  .option('--registry <url>', 'npm registry URL')
  .option('--concurrency <num>', 'max concurrent requests', '10');

program
  .command('validate')
  .description('validate package ages in current repository')
  .action(async () => {
    const options = program.opts();
    await runValidation(options);
  });

program
  .command('config')
  .description('generate default configuration file')
  .option('-o, --output <file>', 'output file path', '.npm-minimum-age-validation.json')
  .action(async (cmdOptions) => {
    const config = createDefaultConfig();
    const fs = await import('fs/promises');
    await fs.writeFile(cmdOptions.output, JSON.stringify(config, null, 2));
    logger.info(`Configuration file created: ${cmdOptions.output}`);
  });

interface CliOptions {
  config?: string;
  minAge?: string;
  trusted?: string;
  format?: 'console' | 'json';
  verbose?: boolean;
  noCache?: boolean;
  dryRun?: boolean;
  registry?: string;
  concurrency?: string;
}

async function runValidation(options: CliOptions) {
  try {
    perf.start('total-validation');

    // Load configuration
    let config: ValidatorConfig;
    if (options.config) {
      config = await loadConfig(options.config);
    } else {
      config = createDefaultConfig();
    }

    // Override with CLI options
    if (options.minAge) config.minimumAgeHours = parseInt(options.minAge, 10);
    if (options.trusted) config.trustedPackages = options.trusted.split(',');
    if (options.registry && config.registry) config.registry.url = options.registry;
    if (options.concurrency && config.registry)
      config.registry.concurrency = parseInt(options.concurrency, 10);
    if (options.noCache && config.registry) config.registry.cacheEnabled = false;
    if (options.verbose && config.output) {
      config.output.verbose = true;
      config.output.logLevel = 'debug';
    }
    if (options.format && config.output) config.output.format = options.format;

    // Run validation
    const result = await validatePackages(config);

    // Output results
    await outputResults(result, config);

    // Handle dry run
    if (options.dryRun) {
      logger.info(chalk.yellow('🧪 Dry run mode - no commit blocking'));
      await logger.flush();
      process.exit(0);
    }

    // Exit with appropriate code
    await logger.flush();
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    perf.end('total-validation');
    logger.error('Validation failed:', error);
    await logger.flush();
    process.exit(1);
  }
}

async function outputResults(result: ValidationResult, config: ValidatorConfig) {
  const totalTime = perf.end('total-validation');

  switch (config.output?.format) {
    case 'json':
      console.log(JSON.stringify({ ...result, executionTimeMs: totalTime }, null, 2));
      break;
    default:
      // Console output (default)
      if (result.success) {
        logger.success(
          `✅ Validation passed - ${result.summary.totalPackages} packages checked (${totalTime}ms)`
        );
        if (config.output?.verbose && result.summary.totalPackages > 0) {
          logger.info(`   New: ${result.summary.newPackages} packages`);
          logger.info(`   Modified: ${result.summary.modifiedPackages} packages`);
          logger.info(`   Violations: ${result.summary.violations} packages`);
        }
      } else {
        logger.error(`❌ Validation failed with ${result.violations.length} violations`);
        result.violations.forEach((v) => {
          logger.error(
            `   ${v.name}@${v.version}: ${v.ageInHours}h old (minimum: ${config.minimumAgeHours}h)`
          );
        });
      }
  }
}

// Handle unhandled promises
process.on('unhandledRejection', async (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await logger.flush();
  process.exit(1);
});

// Always parse when loaded (bin/validate-packages requires this file)
program.parse();

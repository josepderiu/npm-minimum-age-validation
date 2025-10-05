import type { PackageInfo } from '../types';

/**
 * Utility class for consistent package string formatting across the codebase.
 * Ensures DRY principle by centralizing package@version string creation.
 */
export class PackageFormatter {
  /**
   * Formats package name and version into standard key format: name@version
   * @param name Package name
   * @param version Package version
   * @returns Formatted string "name@version"
   */
  static toKey(name: string, version: string): string {
    return `${name}@${version}`;
  }

  /**
   * Converts PackageInfo object to standard key format
   * @param pkg PackageInfo object
   * @returns Formatted string "name@version"
   */
  static fromPackageInfo(pkg: PackageInfo): string {
    return PackageFormatter.toKey(pkg.name, pkg.version);
  }
}

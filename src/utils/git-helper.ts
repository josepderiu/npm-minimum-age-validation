import { execSync } from 'child_process';

/**
 * Utility class for Git operations used in package validation.
 *
 * @remarks
 * This helper provides safe wrappers around Git commands to:
 * - Detect git repository presence
 * - Check for package-lock.json changes
 * - Retrieve package-lock.json from HEAD
 * - Get current branch and commit information
 *
 * All methods fail gracefully, returning empty strings or false on errors.
 *
 * @example
 * ```typescript
 * if (GitHelper.isGitRepository()) {
 *   const branch = GitHelper.getCurrentBranch();
 *   const commit = GitHelper.getLastCommitHash();
 *   console.log(`On branch ${branch} at commit ${commit}`);
 * }
 * ```
 *
 * @public
 */
export class GitHelper {
  /**
   * Executes a git command safely.
   * @param command - The git command to execute
   * @returns The command output as a string, or empty string on error
   * @internal
   */
  static executeCommand(command: string): string {
    try {
      return execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    } catch {
      return '';
    }
  }

  /**
   * Checks if package-lock.json has uncommitted changes.
   * @returns `true` if package-lock.json has changes, `false` otherwise
   * @remarks
   * Uses `git status --porcelain` to detect both staged and unstaged changes.
   */
  static hasPackageLockChanges(): boolean {
    const status = this.executeCommand('git status --porcelain package-lock.json');
    return status.includes('package-lock.json');
  }

  /**
   * Retrieves package-lock.json content from the HEAD commit.
   * @returns The file content as a string, or `null` if not found or on error
   * @remarks
   * Used to compare current package-lock.json with the last committed version
   * to identify which packages were added/modified.
   */
  static getPackageLockFromHead(): string | null {
    const result = this.executeCommand('git show HEAD:package-lock.json');
    return result || null;
  }

  /**
   * Gets the current branch name.
   * @returns The current branch name, or `'unknown'` if not in a git repository
   * @remarks
   * Returns the symbolic ref (branch name) of HEAD.
   */
  static getCurrentBranch(): string {
    const result = this.executeCommand('git rev-parse --abbrev-ref HEAD').trim();
    return result || 'unknown';
  }

  /**
   * Gets the last commit hash (SHA).
   * @returns The full commit hash, or `'unknown'` if not in a git repository
   * @remarks
   * Returns the full 40-character SHA-1 hash of HEAD.
   */
  static getLastCommitHash(): string {
    const result = this.executeCommand('git rev-parse HEAD').trim();
    return result || 'unknown';
  }

  /**
   * Checks if the current directory is within a git repository.
   * @returns `true` if in a git repository, `false` otherwise
   * @remarks
   * This is used to determine whether git-based package diff analysis is possible.
   */
  static isGitRepository(): boolean {
    const result = this.executeCommand('git rev-parse --git-dir');
    return result.length > 0;
  }
}

import { execaCommand } from 'execa';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { UI } from '../lib/ui.js';
import { Logger } from '../lib/logger.js';
import os from 'os';

export function getPlatform() {
  return os.platform();
}

export function isWindows() {
  return getPlatform() === 'win32';
}

export function isLinux() {
  return getPlatform() === 'linux';
}

export function isMacOS() {
  return getPlatform() === 'darwin';
}

function getShell() {
  if (isWindows()) {
    return process.env.ComSpec || 'cmd.exe';
  }
  return process.env.SHELL || '/bin/sh';
}

function requiresPassword(command) {
  return (isLinux() || isMacOS()) && command.trim().startsWith('sudo ');
}

export async function runCommand(
  command,
  description = 'Running command',
  showCommand = true
) {
  const platform = getPlatform();
  const spinner = createSpinner(`${description}...`).start();

  try {
    if (showCommand) {
      console.log(chalk.gray(`\n💻 Command: ${chalk.bold(command)}`));
      console.log(chalk.gray(`📱 Platform: ${platform}\n`));
    }

    if (requiresPassword(command)) {
      spinner.stop();
      console.log(
        chalk.yellow('🔐 This command requires your system password.')
      );
      
    }

    const subprocess = execaCommand(command, {
      stdio: 'inherit',
      shell: getShell(),
      encoding: 'utf8',
      windowsVerbatimArguments: isWindows(),
      cwd: process.cwd()
    });

    await subprocess;

    spinner.success({ text: `${description} completed successfully!` });
    Logger.info(`Command executed on ${platform}: ${command}`);

    return { success: true, platform };

  } catch (error) {
    spinner.error({ text: `Failed to ${description}` });
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    Logger.error(
      `Command failed on ${platform}: ${command} - ${error.message}`
    );

    return { success: false, error: error.message, platform };
  }
}

export async function runPlatformCommand(
  commandMap,
  description = 'Running command'
) {
  const platform = getPlatform();
  const command = commandMap[platform] || commandMap.default;

  if (!command) {
    UI.error(`No command defined for platform ${platform}`);
    return { success: false, error: `Unsupported platform: ${platform}` };
  }

  return runCommand(command, description);
}

export async function runInteractive(command, options = {}) {
  const {
    showOutput = true,
    captureOutput = false,
    timeout = 30000,
    cwd = process.cwd()
  } = options;

  const platform = getPlatform();

  try {
    const result = await execaCommand(command, {
      shell: getShell(),
      timeout,
      cwd,
      stdio: captureOutput ? 'pipe' : 'inherit',
      encoding: captureOutput ? 'utf8' : undefined,
      windowsVerbatimArguments: isWindows()
    });

    if (captureOutput) {
      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        platform
      };
    }

    return { success: true, platform };

  } catch (error) {
    if (showOutput) {
      console.error(
        chalk.red(`\n⚠️ Error on ${platform}: ${error.message}`)
      );
    }

    return {
      success: false,
      error: error.message,
      exitCode: error.exitCode,
      platform
    };
  }
}

export async function batchCommands(commands, options = {}) {
  const { parallel = false, stopOnError = true } = options;
  const results = [];
  const platform = getPlatform();

  UI.info(`📱 Detected platform: ${platform}`);

  if (parallel) {
    const promises = commands.map(cmd => {
      const command =
        cmd.command[platform] ||
        cmd.command.default ||
        cmd.command;
      const description = cmd.description || 'Command';

      return runCommand(command, description)
        .then(result => ({ ...result, command }));
    });

    results.push(...await Promise.all(promises));
  } else {
    for (const [index, cmd] of commands.entries()) {
      const command =
        cmd.command[platform] ||
        cmd.command.default ||
        cmd.command;
      const description =
        cmd.description || `Command ${index + 1}`;

      UI.info(`[${index + 1}/${commands.length}] ${description}`);

      const result = await runCommand(command, description);
      results.push({ ...result, command });

      if (!result.success && stopOnError) {
        UI.error('Stopping sequence due to an error');
        break;
      }
    }
  }

  const successCount = results.filter(r => r.success).length;
  UI.info(
    `Summary: ${successCount}/${results.length} commands succeeded on ${platform}`
  );

  return results;
}

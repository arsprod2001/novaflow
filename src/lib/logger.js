import chalk from 'chalk';
import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';

export class Logger {
  static levels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };

  static level = this.levels.INFO;
  static logFile = null;

  static setLevel(level) {
    this.level = this.levels[level] || this.levels.INFO;
  }

  static setLogFile(filePath) {
    this.logFile = filePath;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  static formatMessage(level, message) {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    return `[${timestamp}] ${level}: ${message}`;
  }

  static writeToFile(message) {
    if (this.logFile) {
      fs.appendFileSync(this.logFile, message + '\n', 'utf8');
    }
  }

  static debug(message) {
    if (this.level <= this.levels.DEBUG) {
      const formatted = this.formatMessage('DEBUG', message);
      console.log(chalk.gray(formatted));
      this.writeToFile(formatted);
    }
  }

  static info(message) {
    if (this.level <= this.levels.INFO) {
      const formatted = this.formatMessage('INFO', message);
      console.log(chalk.blue(formatted));
      this.writeToFile(formatted);
    }
  }

  static warn(message) {
    if (this.level <= this.levels.WARN) {
      const formatted = this.formatMessage('WARN', message);
      console.log(chalk.yellow(formatted));
      this.writeToFile(formatted);
    }
  }

  static error(message) {
    if (this.level <= this.levels.ERROR) {
      const formatted = this.formatMessage('ERROR', message);
      console.log(chalk.red(formatted));
      this.writeToFile(formatted);
    }
  }

  static success(message) {
    const formatted = this.formatMessage('SUCCESS', message);
    console.log(chalk.green(formatted));
    this.writeToFile(formatted);
  }
}
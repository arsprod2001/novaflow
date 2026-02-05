// src/utils/os-detector.js
import os from 'os';

export class OSDetector {
  static getPlatform() {
    return os.platform();
  }

  static isWindows() {
    return this.getPlatform() === 'win32';
  }

  static isLinux() {
    return this.getPlatform() === 'linux';
  }

  static isMacOS() {
    return this.getPlatform() === 'darwin';
  }

  static getShell() {
    if (this.isWindows()) {
      return 'cmd';
    }
    return 'bash';
  }

  static getPackageManager() {
    if (this.isWindows()) {
      return 'choco'; // ou winget, scoop
    }
    return 'apt-get'; // ou yum, pacman selon la distro
  }

  static getHomeDir() {
    return os.homedir();
  }
}
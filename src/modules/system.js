import prompts from 'prompts';
import { runPlatformCommand, isWindows, isLinux, isMacOS } from '../commands/executor.js';
import { UI } from '../lib/ui.js';
import os from 'os';
import { formatBytes } from '../utils/helpers.js';

export async function systemModule() {
  while (true) {
    UI.header('⚙️  System Manager (Multi-platform)');

    const platformName = getPlatformName();
    console.log(`📱 Platform: ${platformName}\n`);

    const response = await prompts({
      type: 'select',
      name: 'action',
      message: 'System Tools:',
      choices: [
        { title: '💻 System Information', value: 'info' },
        { title: '📊 Real-time Monitoring', value: 'monitor' },
        { title: '📦 Process Management', value: 'process' },
        { title: '📁 File Explorer', value: 'files' },
        { title: '🔧 System Utilities', value: 'utils' },
        { title: '', value: 'separator', disabled: true },
        { title: '⬅️ Back', value: 'back' }
      ],
      initial: 0
    });

    if (!response.action || response.action === 'back') break;
    await handleSystemAction(response.action);
  }
}

function getPlatformName() {
  if (isWindows()) return 'Windows';
  if (isLinux()) return 'Linux';
  if (isMacOS()) return 'macOS';
  return os.platform();
}

async function handleSystemAction(action) {
  switch (action) {
    case 'info':
      await systemInfo();
      break;
    case 'process':
      await processManager();
      break;
    case 'monitor':
      await realTimeMonitor();
      break;
    case 'files':
      await fileExplorer();
      break;
    case 'utils':
      await systemUtils();
      break;
  }
}

async function systemInfo() {
  const info = {
    'Platform': `${os.platform()} (${os.arch()})`,
    'System Name': getSystemName(),
    'Node.js': process.version,
    'CPU': os.cpus()[0].model,
    'Cores': os.cpus().length,
    'Total Memory': formatBytes(os.totalmem()),
    'Free Memory': formatBytes(os.freemem()),
    'Memory Usage': `${((1 - os.freemem() / os.totalmem()) * 100).toFixed(1)}%`,
    'System Uptime': `${(os.uptime() / 3600).toFixed(1)} hours`,
    'User': os.userInfo().username,
    'Current Directory': process.cwd(),
    'Hostname': os.hostname()
  };

  const tableData = Object.entries(info).map(([key, value]) => [key, value]);
  UI.table(['Metric', 'Value'], tableData);

  await showPlatformSpecificInfo();
}

function getSystemName() {
  const platform = os.platform();
  const release = os.release();
  
  if (isWindows()) {
    return `Windows ${release}`;
  } else if (isLinux()) {
    try {
      const fs = require('fs');
      const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
      const match = osRelease.match(/PRETTY_NAME="([^"]+)"/);
      return match ? match[1] : `Linux ${release}`;
    } catch {
      return `Linux ${release}`;
    }
  } else if (isMacOS()) {
    return `macOS ${release}`;
  }
  return `${platform} ${release}`;
}

async function showPlatformSpecificInfo() {
  const commandMap = {
    win32: 'systeminfo | findstr /B /C:"OS Name" /C:"OS Version" /C:"System Type" /C:"Installation Date"',
    linux: 'cat /etc/os-release && echo "Kernel: $(uname -r)"',
    darwin: 'sw_vers && echo "Kernel: $(uname -r)"',
    default: 'echo "Additional system information not available"'
  };

  console.log('\n📋 Detailed System Information:');
  await runPlatformCommand(commandMap, 'System Information', false);
}

async function processManager() {
  const response = await prompts({
    type: 'select',
    name: 'processAction',
    message: 'Process Management:',
    choices: [
      { title: '📋 List all processes', value: 'list' },
      { title: '🔍 Search for a process', value: 'search' },
      { title: '🗑️  Kill a process', value: 'kill' },
      { title: '📊 Process statistics', value: 'stats' },
      { title: '🌳 Process tree', value: 'tree' },
      { title: '📈 Top processes', value: 'top' },
      { title: '⬅️ Back', value: 'back' }
    ]
  });

  if (!response.processAction || response.processAction === 'back') return;

  switch (response.processAction) {
    case 'list':
      const listCommands = {
        win32: 'tasklist',
        linux: 'ps aux',
        darwin: 'ps aux',
        default: 'echo "Process list not available"'
      };
      await runPlatformCommand(listCommands, 'Process List');
      break;

    case 'kill':
      const pidResponse = await prompts({
        type: 'text',
        name: 'pid',
        message: 'PID of process to kill:'
      });
      
      if (!pidResponse.pid) return;
      
      const killCommands = {
        win32: `taskkill /F /PID ${pidResponse.pid}`,
        linux: `kill -9 ${pidResponse.pid}`,
        darwin: `kill -9 ${pidResponse.pid}`,
        default: `echo "Cannot kill process ${pidResponse.pid}"`
      };
      await runPlatformCommand(killCommands, `Stopping process ${pidResponse.pid}`);
      break;

    case 'search':
      const searchResponse = await prompts({
        type: 'text',
        name: 'searchTerm',
        message: 'Process name to search for:'
      });
      
      if (!searchResponse.searchTerm) return;
      
      const searchCommands = {
        win32: `tasklist | findstr /i "${searchResponse.searchTerm}"`,
        linux: `ps aux | grep -i "${searchResponse.searchTerm}"`,
        darwin: `ps aux | grep -i "${searchResponse.searchTerm}"`,
        default: `echo "Search not available"`
      };
      await runPlatformCommand(searchCommands, `Process search: ${searchResponse.searchTerm}`);
      break;

    case 'stats':
      const statsCommands = {
        win32: 'tasklist | find /c "exe"',
        linux: 'top -b -n 1 | head -20',
        darwin: 'top -l 1 | head -20',
        default: 'echo "Statistics not available"'
      };
      await runPlatformCommand(statsCommands, 'Process Statistics');
      break;

    case 'tree':
      const treeCommands = {
        win32: 'tasklist /v /fo list',
        linux: 'pstree',
        darwin: 'pstree',
        default: 'echo "Process tree not available"'
      };
      await runPlatformCommand(treeCommands, 'Process Tree');
      break;

    case 'top':
      const topCommands = {
        win32: 'tasklist /fo table',
        linux: 'top -b -n 1',
        darwin: 'top -l 1',
        default: 'echo "Top processes not available"'
      };
      await runPlatformCommand(topCommands, 'Top Processes');
      break;
  }
}

async function realTimeMonitor() {
  UI.info('System Monitoring - Press Ctrl+C to quit');
  
  const getNetworkStats = async () => {
    try {
      const commandMap = {
        win32: 'netstat -e',
        linux: 'netstat -i',
        darwin: 'netstat -i',
        default: 'echo "Network statistics not available"'
      };
      
      // In a real implementation, you might want to capture the output
      // For simplicity, we're just showing a message
      return 'Network statistics';
    } catch {
      return 'N/A';
    }
  };

  const monitor = async () => {
    console.clear();
    UI.header('📊 Real-time Monitoring');
    
    const now = new Date();
    console.log(`🕒 ${now.toLocaleTimeString()}`);
    console.log();
    
    // CPU
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) => 
      acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq, 0);
    const cpuUsage = totalTick > 0 ? ((1 - totalIdle / totalTick) * 100).toFixed(1) : '0.0';
    
    console.log(`💻 CPU: ${cpuUsage}% (${cpus.length} cores)`);
    console.log(`🧠 Memory: ${formatBytes(os.totalmem() - os.freemem())} / ${formatBytes(os.totalmem())}`);
    console.log(`📊 System load: ${os.loadavg().map(l => l.toFixed(2)).join(', ')}`);
    
    console.log(`💾 Directory: ${process.cwd()}`);
    
    console.log('\n' + '═'.repeat(60));
  };

  const interval = setInterval(async () => {
    await monitor();
  }, 2000);

  // First call
  await monitor();

  // Interruption handling
  process.stdin.setRawMode(true);
  process.stdin.resume();
  
  return new Promise((resolve) => {
    const onData = (data) => {
      if (data.toString() === '\u0003') { // Ctrl+C
        clearInterval(interval);
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', onData);
        console.log('\n\n');
        resolve();
      }
    };
    
    process.stdin.on('data', onData);
  });
}

async function fileExplorer() {
  const fs = await import('fs');
  const path = await import('path');
  
  let currentDir = process.cwd();
  
  while (true) {
    try {
      const files = fs.readdirSync(currentDir);
      
      const choices = files.map(file => {
        const filePath = path.join(currentDir, file);
        const stats = fs.statSync(filePath);
        const isDir = stats.isDirectory();
        const size = stats.size;
        
        return {
          title: `${isDir ? '📁' : '📄'} ${file} ${!isDir ? `(${formatBytes(size)})` : ''}`,
          value: file,
          description: isDir ? 'Directory' : 'File'
        };
      });
      
      // Add parent option
      choices.unshift(
        { title: '', value: 'separator', disabled: true },
        { title: '📁 .. (Parent)', value: '..' },
        { title: '', value: 'separator', disabled: true }
      );
      
      const response = await prompts({
        type: 'select',
        name: 'selectedFile',
        message: `📂 ${currentDir}`,
        choices: [...choices, { title: '', value: 'separator', disabled: true }, { title: '⬅️ Back', value: 'back' }]
      });
      
      if (!response.selectedFile || response.selectedFile === 'back') break;
      
      if (response.selectedFile === '..') {
        currentDir = path.dirname(currentDir);
      } else {
        const newPath = path.join(currentDir, response.selectedFile);
        const stats = fs.statSync(newPath);
        
        if (stats.isDirectory()) {
          currentDir = newPath;
        } else {
          await handleFileAction(newPath, response.selectedFile, stats);
        }
      }
    } catch (error) {
      UI.error(`Error: ${error.message}`);
      break;
    }
  }
}

async function handleFileAction(filePath, fileName, stats) {
  const actionResponse = await prompts({
    type: 'select',
    name: 'action',
    message: `What to do with ${fileName}? (${formatBytes(stats.size)})`,
    choices: [
      { title: '👀 View content', value: 'view' },
      { title: '✏️  Edit', value: 'edit' },
      { title: '🗑️  Delete', value: 'delete' },
      { title: '📋 Copy path', value: 'copy' },
      { title: '📤 Execute', value: 'execute' },
      { title: '📝 Properties', value: 'properties' },
      { title: '⬅️ Back', value: 'back' }
    ]
  });
  
  if (!actionResponse.action || actionResponse.action === 'back') return;
  
  const fs = await import('fs');
  const path = await import('path');
  
  switch (actionResponse.action) {
    case 'view':
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log('\n' + '='.repeat(80));
        console.log(`Content of ${fileName}:`);
        console.log('='.repeat(80));
        console.log(content.substring(0, 1000)); // Limit display
        if (content.length > 1000) {
          console.log('... (truncated)');
        }
        console.log('='.repeat(80));
      } catch (error) {
        UI.error(`Read error: ${error.message}`);
      }
      break;
      
    case 'delete':
      const confirmResponse = await prompts({
        type: 'toggle',
        name: 'confirm',
        message: `Are you sure you want to delete ${fileName}?`,
        initial: false,
        active: 'Yes',
        inactive: 'No'
      });
      
      if (confirmResponse.confirm) {
        try {
          fs.unlinkSync(filePath);
          UI.success(`File ${fileName} deleted`);
        } catch (error) {
          UI.error(`Delete error: ${error.message}`);
        }
      }
      break;
      
    case 'copy':
      console.log(`\n📋 Path: ${filePath}`);
      // Try to copy to clipboard
      const copyCommands = {
        win32: `echo ${filePath} | clip`,
        linux: `echo "${filePath}" | xclip -selection clipboard`,
        darwin: `echo "${filePath}" | pbcopy`,
        default: `echo "Copy not supported: ${filePath}"`
      };
      await runPlatformCommand(copyCommands, 'Copying path', false);
      UI.success('Path copied to clipboard');
      break;
      
    case 'execute':
      const executeCommands = {
        win32: `start "" "${filePath}"`,
        linux: `xdg-open "${filePath}"`,
        darwin: `open "${filePath}"`,
        default: `echo "Execution not supported"`
      };
      await runPlatformCommand(executeCommands, `Opening ${fileName}`);
      break;
      
    case 'properties':
      console.log('\n📝 File Properties:');
      console.log(`📄 Name: ${fileName}`);
      console.log(`📁 Path: ${filePath}`);
      console.log(`📊 Size: ${formatBytes(stats.size)}`);
      console.log(`📅 Created: ${stats.birthtime.toLocaleString()}`);
      console.log(`✏️  Modified: ${stats.mtime.toLocaleString()}`);
      console.log(`🔒 Permissions: ${stats.mode.toString(8)}`);
      break;
      
    case 'edit':
      const editCommands = {
        win32: `notepad "${filePath}"`,
        linux: `nano "${filePath}"`,
        darwin: `open -t "${filePath}"`,
        default: `echo "Edit not supported"`
      };
      await runPlatformCommand(editCommands, `Editing ${fileName}`);
      break;
  }
}

async function systemUtils() {
  const response = await prompts({
    type: 'select',
    name: 'util',
    message: 'System Utilities:',
    choices: [
      { title: '🕒 System time', value: 'time' },
      { title: '🌐 Internet connection', value: 'internet' },
      { title: '💾 Disk space', value: 'disk' },
      { title: '🔧 Permissions', value: 'perms' },
      { title: '🔌 Network', value: 'network' },
      { title: '🔋 Battery', value: 'battery' },
      { title: '🌡️  Temperature', value: 'temp' },
      { title: '⬅️ Back', value: 'back' }
    ]
  });
  
  if (!response.util || response.util === 'back') return;
  
  const utilsCommands = {
    time: {
      win32: 'time /t && date /t',
      linux: 'date',
      darwin: 'date',
      default: 'echo "Time not available"'
    },
    internet: {
      win32: 'ping -n 4 8.8.8.8',
      linux: 'ping -c 4 8.8.8.8',
      darwin: 'ping -c 4 8.8.8.8',
      default: 'echo "Connection test not available"'
    },
    disk: {
      win32: 'wmic logicaldisk get size,freespace,caption',
      linux: 'df -h',
      darwin: 'df -h',
      default: 'echo "Disk space not available"'
    },
    perms: {
      win32: 'icacls .',
      linux: 'ls -la',
      darwin: 'ls -la',
      default: 'echo "Permissions not available"'
    },
    network: {
      win32: 'ipconfig /all',
      linux: 'ifconfig -a || ip addr',
      darwin: 'ifconfig -a',
      default: 'echo "Network information not available"'
    },
    battery: {
      win32: 'powercfg /batteryreport',
      linux: 'upower -i /org/freedesktop/UPower/devices/battery_BAT0',
      darwin: 'pmset -g batt',
      default: 'echo "Battery information not available"'
    },
    temp: {
      win32: 'wmic /namespace:\\\\root\\wmi PATH MSAcpi_ThermalZoneTemperature get CurrentTemperature',
      linux: 'sensors',
      darwin: 'ioreg -l | grep -i temperature',
      default: 'echo "Temperature not available"'
    }
  };
  
  const utilNames = {
    time: 'System Time',
    internet: 'Connection Test',
    disk: 'Disk Space',
    perms: 'Permissions',
    network: 'Network Information',
    battery: 'Battery Status',
    temp: 'Temperature'
  };
  
  if (utilsCommands[response.util]) {
    await runPlatformCommand(utilsCommands[response.util], utilNames[response.util]);
  }
}

export {
  getPlatformName,
  getSystemName,
  handleFileAction
};
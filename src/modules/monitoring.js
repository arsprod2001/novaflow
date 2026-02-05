import prompts from 'prompts';
import { runPlatformCommand, isWindows, isLinux, isMacOS } from '../commands/executor.js';
import { UI } from '../lib/ui.js';
import os from 'os';
import chalk from 'chalk';

export async function monitoringModule() {
  while (true) {
    console.clear();
    UI.header('📊 Monitoring Manager (Multi-platform)');
    
    const platform = os.platform();
    console.log(`📱 Platform: ${platform}\n`);

    const response = await prompts({
      type: 'select',
      name: 'action',
      message: 'Monitoring:',
      choices: [
        { title: '📈 System Dashboard', value: 'dashboard' },
        { title: '🐳 Docker Monitoring', value: 'docker' },
        { title: '📦 Real-time Logs', value: 'logs' },
        { title: '📊 Advanced Metrics', value: 'metrics' },
        { title: '📡 Process Monitoring', value: 'process' },
        { title: '', value: 'separator', disabled: true },
        { title: '⬅️ Back', value: 'back' }
      ]
    });

    if (!response.action || response.action === 'back') break;
    
    await handleMonitoringAction(response.action);
  }
}

async function handleMonitoringAction(action) {
  switch (action) {
    case 'dashboard':
      await showDashboard();
      break;
    case 'docker':
      await dockerMonitoring();
      break;
    case 'logs':
      await realTimeLogs();
      break;
    case 'metrics':
      await advancedMetrics();
      break;
    case 'process':
      await processMonitoring();
      break;
  }
}

async function showDashboard() {
  console.log(chalk.cyan('\n📊 Real-time Monitoring Dashboard'));
  console.log(chalk.gray('Press Ctrl+C to exit\n'));
  
  const updateDashboard = () => {
    console.clear();
    console.log(chalk.bold.cyan('\n📊 Real-time Monitoring Dashboard\n'));
    
    const now = new Date();
    console.log(`🕒 ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
    console.log();
    
    // CPU
    const load = os.loadavg();
    const cpuLoadText = isWindows() ? 'N/A on Windows' : `${load[0].toFixed(2)} ${load[1].toFixed(2)} ${load[2].toFixed(2)} (1,5,15 min)`;
    console.log(`💻 CPU Load: ${cpuLoadText}`);
    
    // Memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = (usedMem / totalMem * 100).toFixed(1);
    
    const memColor = memPercent > 90 ? chalk.red : memPercent > 75 ? chalk.yellow : chalk.green;
    console.log(`🧠 Memory: ${memColor(memPercent + '%')} used (${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB / ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB)`);
    console.log(`📊 Uptime: ${(os.uptime() / 3600).toFixed(1)} hours`);
    console.log(`⚙️  CPUs: ${os.cpus().length} cores - ${os.cpus()[0].model.split(' ').slice(0, 4).join(' ')}`);
    
    // System info
    console.log();
    console.log('💾 System:');
    console.log(`  • Platform: ${os.platform()} ${os.arch()}`);
    console.log(`  • Node.js: ${process.version}`);
    console.log(`  • User: ${os.userInfo().username}`);
    console.log(`  • Hostname: ${os.hostname()}`);
    
    // Network info
    try {
      const networkInterfaces = os.networkInterfaces();
      let hasNetwork = false;
      for (const [name, interfaces] of Object.entries(networkInterfaces)) {
        for (const iface of interfaces || []) {
          if (iface.family === 'IPv4' && !iface.internal) {
            if (!hasNetwork) {
              console.log('🌐 Network:');
              hasNetwork = true;
            }
            console.log(`  • ${name}: ${iface.address}`);
          }
        }
      }
    } catch (error) {
      console.log(`  • Network: Error reading interfaces`);
    }
    
    console.log('\n' + chalk.cyan('═'.repeat(60)));
    console.log(chalk.gray('🔄 Auto-refresh every 3 seconds'));
    console.log(chalk.gray('💡 Press Ctrl+C to exit'));
  };

  const interval = setInterval(updateDashboard, 3000);
  updateDashboard();

  process.stdin.setRawMode(true);
  process.stdin.resume();
  
  return new Promise((resolve) => {
    const onData = (data) => {
      if (data.toString() === '\u0003') {
        clearInterval(interval);
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', onData);
        console.log('\n');
        resolve();
      }
    };
    
    process.stdin.on('data', onData);
  });
}

async function dockerMonitoring() {
  console.log(chalk.cyan('\n🐳 Docker Monitoring'));
  
  const dockerCheck = {
    win32: 'docker --version 2>nul || echo "Docker not installed"',
    linux: 'docker --version 2>/dev/null || echo "Docker not installed"',
    darwin: 'docker --version 2>/dev/null || echo "Docker not installed"',
    default: 'echo "Docker not available"'
  };

  const result = await runPlatformCommand(dockerCheck, "Checking Docker", false);
  
  if (result.output && result.output.includes('not installed')) {
    UI.error('Docker is not installed or not running.');
    UI.info('Install Docker from: https://docs.docker.com/get-docker/');
    await prompts({
      type: 'text',
      name: 'continue',
      message: 'Press Enter to continue...',
      initial: ''
    });
    return;
  }

  console.log(chalk.gray('Press Ctrl+C to exit\n'));
  
  const updateDockerStats = async () => {
    console.clear();
    console.log(chalk.bold.cyan('\n🐳 Docker Real-time Monitoring\n'));
    
    try {
      const commandMap = {
        win32: 'docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}\t{{.PIDs}}"',
        linux: 'docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}\t{{.PIDs}}"',
        darwin: 'docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}\t{{.PIDs}}"',
        default: 'docker stats --no-stream'
      };
      
      await runPlatformCommand(commandMap, 'Docker Statistics', false);
      
      console.log('\n📦 Running Containers:');
      const listCommand = {
        win32: 'docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"',
        linux: 'docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"',
        darwin: 'docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"',
        default: 'docker ps'
      };
      
      await runPlatformCommand(listCommand, 'Container List', false);
      
    } catch (error) {
      console.log(chalk.yellow('\n⚠️  Docker is not running or no containers are active'));
    }
    
    console.log('\n' + chalk.cyan('═'.repeat(80)));
    console.log(chalk.gray('🔄 Auto-refresh every 5 seconds'));
    console.log(chalk.gray('💡 Press Ctrl+C to exit'));
  };

  const interval = setInterval(updateDockerStats, 5000);
  await updateDockerStats();

  process.stdin.setRawMode(true);
  process.stdin.resume();
  
  return new Promise((resolve) => {
    const onData = (data) => {
      if (data.toString() === '\u0003') {
        clearInterval(interval);
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', onData);
        console.log('\n');
        resolve();
      }
    };
    
    process.stdin.on('data', onData);
  });
}

async function realTimeLogs() {
  console.clear();
  console.log('\n📦 Real-time Logs\n');

  const response = await prompts({
    type: 'select',
    name: 'logSource',
    message: 'Log source:',
    choices: [
      { title: '🐳 Docker Container', value: 'docker' },
      ...(isUnix() ? [
        { title: '📄 System Log File', value: 'system' }
      ] : []),
      { title: '📦 Application Logs', value: 'app' },
      { title: '📁 Custom File', value: 'custom' }
    ]
  });

  if (!response.logSource) return;

  if (response.logSource === 'docker') {
    await dockerLogs();
  } else if (response.logSource === 'system') {
    await systemLogs();
  } else if (response.logSource === 'app') {
    await applicationLogs();
  } else if (response.logSource === 'custom') {
    await customLogs();
  }
}

function isUnix() {
  return isLinux() || isMacOS();
}

async function dockerLogs() {
  const containerCommand = {
    win32: 'docker ps --format "{{.Names}}"',
    linux: 'docker ps --format "{{.Names}}"',
    darwin: 'docker ps --format "{{.Names}}"',
    default: 'docker ps --format "{{.Names}}"'
  };

  const result = await runPlatformCommand(containerCommand, 'Getting containers', false);
  
  if (!result.success || !result.output || result.output.trim() === '') {
    UI.error('No running Docker containers found.');
    await prompts({
      type: 'text',
      name: 'continue',
      message: 'Press Enter to continue...',
      initial: ''
    });
    return;
  }
  
  const containerList = result.output.trim().split('\n').filter(c => c.trim());
  
  const containerResponse = await prompts({
    type: 'select',
    name: 'container',
    message: 'Select container:',
    choices: containerList.map(c => ({ title: c, value: c }))
  });
  
  if (!containerResponse.container) return;
  
  console.log(chalk.cyan(`\n📝 Logs for container: ${containerResponse.container}`));
  console.log(chalk.gray('Press Ctrl+C to exit\n'));
  
  const logCommand = {
    win32: `docker logs -f ${containerResponse.container}`,
    linux: `docker logs -f ${containerResponse.container}`,
    darwin: `docker logs -f ${containerResponse.container}`,
    default: `docker logs -f ${containerResponse.container}`
  };
  
  try {
    await runPlatformCommand(logCommand, `Logs for ${containerResponse.container}`);
  } catch (error) {
    console.log(chalk.yellow('\n⚠️  Log streaming stopped'));
  }
}

async function systemLogs() {
  if (!isUnix()) {
    UI.error('System logs are only available on Unix systems (Linux/macOS).');
    UI.info('On Windows, use Event Viewer or PowerShell Get-EventLog.');
    await prompts({
      type: 'text',
      name: 'continue',
      message: 'Press Enter to continue...',
      initial: ''
    });
    return;
  }
  
  const logResponse = await prompts({
    type: 'select',
    name: 'logFile',
    message: 'System log file:',
    choices: [
      { title: '📄 /var/log/syslog (Linux)', value: 'syslog' },
      { title: '📄 /var/log/messages (Linux)', value: 'messages' },
      { title: '📄 /var/log/auth.log (Linux)', value: 'auth' },
      { title: '📄 /var/log/kern.log (Linux)', value: 'kern' },
      { title: '📄 /var/log/system.log (macOS)', value: 'system_mac' },
      { title: '📄 /var/log/install.log (macOS)', value: 'install_mac' }
    ]
  });
  
  if (!logResponse.logFile) return;
  
  let filePath = '';
  if (logResponse.logFile === 'syslog') {
    filePath = '/var/log/syslog';
  } else if (logResponse.logFile === 'messages') {
    filePath = '/var/log/messages';
  } else if (logResponse.logFile === 'auth') {
    filePath = '/var/log/auth.log';
  } else if (logResponse.logFile === 'kern') {
    filePath = '/var/log/kern.log';
  } else if (logResponse.logFile === 'system_mac') {
    filePath = '/var/log/system.log';
  } else if (logResponse.logFile === 'install_mac') {
    filePath = '/var/log/install.log';
  }
  
  console.log(chalk.cyan(`\n📝 Monitoring: ${filePath}`));
  console.log(chalk.gray('Press Ctrl+C to exit\n'));
  
  const logCommand = {
    linux: `sudo tail -f ${filePath} 2>/dev/null || echo "Permission denied. Try with sudo or check file exists."`,
    darwin: `sudo tail -f ${filePath} 2>/dev/null || echo "Permission denied. Try with sudo or check file exists."`,
    default: `echo "System logs not available"`
  };
  
  try {
    await runPlatformCommand(logCommand, `System logs: ${filePath}`);
  } catch (error) {
    console.log(chalk.yellow('\n⚠️  Log streaming stopped'));
  }
}

async function applicationLogs() {
  const response = await prompts({
    type: 'select',
    name: 'appType',
    message: 'Application type:',
    choices: [
      { title: '📦 Node.js Application', value: 'node' },
      { title: '🐍 Python Application', value: 'python' },
      { title: '☕ Java Application', value: 'java' },
      { title: '🐘 PHP Application', value: 'php' },
      { title: '🌐 Web Server', value: 'web' }
    ]
  });
  
  if (!response.appType) return;
  
  let command = '';
  let description = '';
  
  switch (response.appType) {
    case 'node':
      command = 'tail -f npm-debug.log 2>/dev/null || echo "No npm debug log found"';
      description = 'Node.js Application Logs';
      break;
    case 'web':
      const webResponse = await prompts({
        type: 'select',
        name: 'webServer',
        message: 'Web server:',
        choices: [
          { title: '🌐 nginx', value: 'nginx' },
          { title: '🌐 Apache', value: 'apache' },
          { title: '🚀 Caddy', value: 'caddy' }
        ]
      });
      
      if (!webResponse.webServer) return;
      
      if (webResponse.webServer === 'nginx') {
        command = isWindows() 
          ? 'echo "nginx logs location: C:\\nginx\\logs\\error.log"' 
          : 'tail -f /var/log/nginx/error.log 2>/dev/null || echo "nginx logs not found"';
        description = 'nginx Error Logs';
      } else if (webResponse.webServer === 'apache') {
        command = isWindows()
          ? 'echo "Apache logs location: C:\\Apache24\\logs\\error.log"'
          : 'tail -f /var/log/apache2/error.log 2>/dev/null || echo "Apache logs not found"';
        description = 'Apache Error Logs';
      }
      break;
    default:
      UI.warning(`Log monitoring for ${response.appType} requires manual configuration.`);
      return;
  }
  
  if (command) {
    console.log(chalk.cyan(`\n📝 ${description}`));
    console.log(chalk.gray('Press Ctrl+C to exit\n'));
    
    try {
      await runPlatformCommand({ default: command }, description);
    } catch (error) {
      console.log(chalk.yellow('\n⚠️  Log streaming stopped'));
    }
  }
}

async function customLogs() {
  const response = await prompts({
    type: 'text',
    name: 'logPath',
    message: 'Log file path:',
    validate: value => value.trim() ? true : 'Path is required'
  });
  
  if (!response.logPath) return;
  
  console.log(chalk.cyan(`\n📝 Monitoring: ${response.logPath}`));
  console.log(chalk.gray('Press Ctrl+C to exit\n'));
  
  const logCommand = {
    win32: `Get-Content -Path "${response.logPath}" -Wait -Tail 10`,
    linux: `tail -f "${response.logPath}" 2>/dev/null || echo "File not found or no permission"`,
    darwin: `tail -f "${response.logPath}" 2>/dev/null || echo "File not found or no permission"`,
    default: `echo "Log monitoring not available"`
  };
  
  try {
    await runPlatformCommand(logCommand, `Custom logs: ${response.logPath}`);
  } catch (error) {
    console.log(chalk.yellow('\n⚠️  Log streaming stopped'));
  }
}

async function advancedMetrics() {
  console.clear();
  console.log('\n📊 Advanced Metrics\n');

  const response = await prompts({
    type: 'select',
    name: 'metricType',
    message: 'Metrics type:',
    choices: [
      { title: '📈 CPU Performance', value: 'cpu' },
      { title: '🧠 Memory Usage', value: 'memory' },
      { title: '💾 Disk I/O', value: 'disk' },
      { title: '🌐 Network Bandwidth', value: 'network' },
      { title: '📦 Process Metrics', value: 'process' },
      { title: '🐳 Docker Metrics', value: 'docker' }
    ]
  });

  if (!response.metricType) return;

  console.log(chalk.cyan(`\n📊 Collecting ${response.metricType} metrics...\n`));

  const metricCommands = {
    cpu: {
      win32: 'wmic cpu get loadpercentage',
      linux: 'top -bn1 | head -20',
      darwin: 'top -l 1 | head -20',
      default: 'echo "CPU metrics not available"'
    },
    memory: {
      win32: 'systeminfo | find "Available Physical Memory"',
      linux: 'free -h',
      darwin: 'vm_stat',
      default: 'echo "Memory metrics not available"'
    },
    disk: {
      win32: 'wmic logicaldisk get size,freespace,caption',
      linux: 'df -h && iostat -x 1 2',
      darwin: 'df -h && iostat',
      default: 'df -h'
    },
    network: {
      win32: 'netstat -e',
      linux: 'ifconfig -a || ip addr',
      darwin: 'ifconfig -a',
      default: 'ifconfig -a'
    },
    process: {
      win32: 'tasklist /fo table',
      linux: 'ps aux --sort=-%cpu | head -20',
      darwin: 'ps aux | sort -nrk 3,3 | head -20',
      default: 'ps aux | head -20'
    },
    docker: {
      win32: 'docker stats --no-stream',
      linux: 'docker stats --no-stream',
      darwin: 'docker stats --no-stream',
      default: 'docker stats --no-stream 2>/dev/null || echo "Docker not running"'
    }
  };

  await runPlatformCommand(metricCommands[response.metricType], `${response.metricType} Metrics`);
  
  await prompts({
    type: 'text',
    name: 'continue',
    message: 'Press Enter to continue...',
    initial: ''
  });
}



async function processMonitoring() {
  console.clear();
  console.log('\n📦 Process Monitoring\n');
  
  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'Process monitoring:',
    choices: [
      { title: '👀 Watch Process', value: 'watch' },
      { title: '📊 Process Statistics', value: 'stats' },
      { title: '📈 Resource Usage', value: 'resources' },
      { title: '🌳 Process Tree', value: 'tree' },
      { title: '⬅️ Back', value: 'back' }
    ]
  });
  
  if (!response.action || response.action === 'back') return;
  
  switch (response.action) {
    case 'watch':
      await watchProcess();
      break;
    case 'stats':
      await processStats();
      break;
    case 'resources':
      await processResources();
      break;
    case 'tree':
      await processTree();
      break;
  }
}

async function watchProcess() {
  console.log(chalk.cyan('\n👀 Process Watcher\n'));
  
  const response = await prompts({
    type: 'text',
    name: 'process',
    message: 'Process name or PID to watch:',
    initial: 'node'
  });
  
  if (!response.process) return;
  
  console.log(chalk.cyan(`\n📊 Monitoring process: ${response.process}`));
  console.log(chalk.gray('Press Ctrl+C to exit\n'));
  
  const watchCommand = isWindows()
    ? `powershell -Command "while($true) { Get-Process ${response.process} -ErrorAction SilentlyContinue | Format-Table ProcessName, Id, CPU, WorkingSet -AutoSize; Start-Sleep -Seconds 2; Clear-Host }"`
    : `watch -n 2 "ps aux | grep -E '${response.process}' | grep -v grep | head -10"`;
  
  const commandMap = {
    win32: watchCommand,
    linux: watchCommand,
    darwin: watchCommand,
    default: `echo "Process watching not available"`
  };
  
  try {
    await runPlatformCommand(commandMap, `Watching process: ${response.process}`);
  } catch (error) {
    console.log(chalk.yellow('\n⚠️  Process watching stopped'));
  }
}

async function processStats() {
  console.log(chalk.cyan('\n📊 Process Statistics\n'));
  
  const commandMap = {
    win32: 'tasklist /fo table',
    linux: 'ps aux --sort=-%cpu | head -20',
    darwin: 'ps aux | sort -nrk 3,3 | head -20',
    default: 'ps aux | head -20'
  };
  
  await runPlatformCommand(commandMap, 'Process Statistics');
  
  await prompts({
    type: 'text',
    name: 'continue',
    message: 'Press Enter to continue...',
    initial: ''
  });
}

async function processResources() {
  console.log(chalk.cyan('\n📈 Process Resource Usage\n'));
  
  const response = await prompts({
    type: 'text',
    name: 'pid',
    message: 'Process PID (leave empty for all):',
    initial: ''
  });
  
  let command = '';
  if (response.pid) {
    const commandMap = {
      win32: `tasklist /fi "PID eq ${response.pid}" /fo table`,
      linux: `top -p ${response.pid}`,
      darwin: `top -pid ${response.pid}`,
      default: `ps -p ${response.pid}`
    };
    
    await runPlatformCommand(commandMap, `Process ${response.pid} Resources`);
  } else {
    const commandMap = {
      win32: 'tasklist /fo table',
      linux: 'top -bn1 | head -30',
      darwin: 'top -l 1 | head -30',
      default: 'top -bn1'
    };
    
    await runPlatformCommand(commandMap, 'All Processes Resources');
  }
  
  await prompts({
    type: 'text',
    name: 'continue',
    message: 'Press Enter to continue...',
    initial: ''
  });
}

async function processTree() {
  console.log(chalk.cyan('\n🌳 Process Tree\n'));
  
  const commandMap = {
    win32: 'tasklist /v /fo list',
    linux: 'pstree',
    darwin: 'pstree',
    default: 'ps auxf'
  };
  
  await runPlatformCommand(commandMap, 'Process Tree');
  
  await prompts({
    type: 'text',
    name: 'continue',
    message: 'Press Enter to continue...',
    initial: ''
  });
}
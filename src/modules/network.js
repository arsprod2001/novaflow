import prompts from 'prompts';
import { runPlatformCommand, isWindows } from '../commands/executor.js';
import { UI } from '../lib/ui.js';
import os from 'os';

export async function networkModule() {
  while (true) {
    UI.header('🌐 Network Manager (Multi-platform)');
    
    const platform = os.platform();
    console.log(`📱 Platform: ${platform}\n`);

    const response = await prompts({
      type: 'select',
      name: 'action',
      message: 'Network Tools:',
      choices: [
        { title: '📡 Connection Test', value: 'ping' },
        { title: '🌐 Network Information', value: 'info' },
        { title: '🔍 Port Analysis', value: 'ports' },
        { title: '📊 Network Statistics', value: 'stats' },
        { title: '🚀 Speed Test', value: 'speed' },
        { title: '🔒 SSL Check', value: 'ssl' },
        { title: '📡 Network Scan', value: 'scan' },
        { title: '🔧 DNS Tools', value: 'dns' },
        { title: '🛡️ Firewall', value: 'firewall' },
        { title: '', value: 'separator', disabled: true },
        { title: '⬅️ Back', value: 'back' }
      ]
    });

    if (!response.action || response.action === 'back') break;
    await handleNetworkAction(response.action);
  }
}

async function handleNetworkAction(action) {
  switch (action) {
    case 'ping':
      await pingTest();
      break;
    case 'info':
      await networkInfo();
      break;
    case 'ports':
      await portScanner();
      break;
    case 'stats':
      await networkStats();
      break;
    case 'speed':
      await speedTest();
      break;
    case 'ssl':
      await sslCheck();
      break;
    case 'scan':
      await networkScan();
      break;
    case 'dns':
      await dnsTools();
      break;
    case 'firewall':
      await firewallTools();
      break;
  }
}

async function pingTest() {
  const response = await prompts([
    {
      type: 'text',
      name: 'host',
      message: 'Host to test (e.g., google.com):',
      initial: '8.8.8.8'
    },
    {
      type: 'number',
      name: 'count',
      message: 'Number of pings:',
      initial: 4,
      min: 1,
      max: 100
    },
    {
      type: 'number',
      name: 'timeout',
      message: 'Timeout (seconds):',
      initial: 5,
      min: 1,
      max: 60
    }
  ]);

  if (!response.host) return;

  const commandMap = {
    win32: `ping -n ${response.count || 4} ${response.host}`,
    linux: `ping -c ${response.count || 4} -W ${response.timeout || 5} ${response.host}`,
    darwin: `ping -c ${response.count || 4} -t ${response.timeout || 5} ${response.host}`,
    default: `echo "Ping not available"`
  };

  await runPlatformCommand(commandMap, `Ping test to ${response.host}`);
}

async function networkInfo() {
  const response = await prompts({
    type: 'select',
    name: 'infoType',
    message: 'Network Information:',
    choices: [
      { title: '📡 All Network Info', value: 'all' },
      { title: '🔌 IP Configuration', value: 'ip' },
      { title: '🔄 Routing Table', value: 'routing' },
      { title: '📶 Network Interfaces', value: 'interfaces' },
      { title: '🌐 Public IP', value: 'public' },
      { title: '🏷️ MAC Address', value: 'mac' }
    ]
  });

  if (!response.infoType) return;

  const commandMaps = {
    all: {
      win32: 'ipconfig /all && route print',
      linux: 'ifconfig -a && ip addr && ip route && netstat -i',
      darwin: 'ifconfig -a && networksetup -listallhardwareports',
      default: 'echo "Network info not available"'
    },
    ip: {
      win32: 'ipconfig',
      linux: 'hostname -I && ip addr show',
      darwin: 'ipconfig getifaddr en0 || ipconfig getifaddr en1',
      default: 'hostname -i'
    },
    routing: {
      win32: 'route print',
      linux: 'ip route show',
      darwin: 'netstat -rn',
      default: 'netstat -rn'
    },
    interfaces: {
      win32: 'netsh interface show interface',
      linux: 'ip link show',
      darwin: 'ifconfig -l',
      default: 'ifconfig -a'
    },
    public: {
      win32: 'curl -s https://api.ipify.org',
      linux: 'curl -s https://api.ipify.org',
      darwin: 'curl -s https://api.ipify.org',
      default: 'curl -s https://api.ipify.org || echo "Public IP not available"'
    },
    mac: {
      win32: 'getmac /v',
      linux: 'ip link show | grep link/ether',
      darwin: 'ifconfig en0 | grep ether || ifconfig en1 | grep ether',
      default: 'echo "MAC address not available"'
    }
  };

  await runPlatformCommand(commandMaps[response.infoType], `Network ${response.infoType}`);
}

async function portScanner() {
  const hostResponse = await prompts({
    type: 'text',
    name: 'host',
    message: 'Host to scan:',
    initial: 'localhost'
  });

  if (!hostResponse.host) return;

  if (hostResponse.host === 'localhost' && isWindows()) {
    UI.info('On Windows, use 127.0.0.1 instead of localhost for better compatibility');
  }

  const portResponse = await prompts({
    type: 'select',
    name: 'portRange',
    message: 'Port range:',
    choices: [
      { title: '🔌 Common ports (1-1024)', value: 'common' },
      { title: '🌐 All ports (1-65535)', value: 'all' },
      { title: '🎯 Specific ports', value: 'specific' },
      { title: '🚀 Web ports only', value: 'web' }
    ]
  });

  if (!portResponse.portRange) return;

  let ports = '1-1024';
  if (portResponse.portRange === 'all') {
    ports = '1-65535';
  } else if (portResponse.portRange === 'specific') {
    const specificResponse = await prompts({
      type: 'text',
      name: 'specificPorts',
      message: 'Ports (e.g., 80,443,8080 or 20-30):',
      initial: '80,443,8080,3000'
    });
    if (specificResponse.specificPorts) {
      ports = specificResponse.specificPorts;
    }
  } else if (portResponse.portRange === 'web') {
    ports = '80,443,8080,3000,8000,8443';
  }

  // Check if nmap is available
  const nmapCheck = {
    win32: 'where nmap 2>nul || echo "nmap not found"',
    linux: 'which nmap 2>/dev/null || echo "nmap not found"',
    darwin: 'which nmap 2>/dev/null || echo "nmap not found"',
    default: 'echo "nmap not available"'
  };

  const checkResult = await runPlatformCommand(nmapCheck, 'Checking nmap', false);
  
  if (checkResult.output && checkResult.output.includes('not found')) {
    UI.warning('nmap not installed. Using alternative methods...');
    
    if (isWindows()) {
      await windowsPortScanner(hostResponse.host, ports);
    } else {
      await basicPortScanner(hostResponse.host, ports);
    }
  } else {
    const commandMap = {
      win32: `nmap -p ${ports} ${hostResponse.host}`,
      linux: `nmap -p ${ports} ${hostResponse.host}`,
      darwin: `nmap -p ${ports} ${hostResponse.host}`,
      default: `echo "nmap scan not available"`
    };
    
    await runPlatformCommand(commandMap, `Port scan ${hostResponse.host}:${ports}`);
  }
}

async function windowsPortScanner(host, ports) {
  UI.info(`Scanning ports ${ports} on ${host} (Windows method)...`);
  
  const portArray = ports.split(',').map(p => p.trim());
  const scannedPorts = [];
  
  for (const portRange of portArray) {
    if (portRange.includes('-')) {
      const [start, end] = portRange.split('-').map(Number);
      for (let port = start; port <= end && port <= 65535; port++) {
        scannedPorts.push(port);
      }
    } else {
      const port = Number(portRange);
      if (!isNaN(port) && port > 0 && port <= 65535) {
        scannedPorts.push(port);
      }
    }
  }
  
  const portsToTest = scannedPorts.slice(0, 20);
  
  console.log(`Testing ports: ${portsToTest.join(', ')}...\n`);
  
  for (const port of portsToTest) {
    const command = {
      win32: `powershell -Command "$tcp = New-Object System.Net.Sockets.TcpClient; try { $tcp.Connect('${host}', ${port}); Write-Host 'Port ${port}: OPEN'; $tcp.Close() } catch { Write-Host 'Port ${port}: CLOSED' }"`,
      default: `echo "Testing port ${port}"`
    };
    
    await runPlatformCommand(command, `Port ${port}`, false);
  }
}

async function basicPortScanner(host, ports) {
  UI.info(`Scanning ports ${ports} on ${host} (basic method)...`);
  
  const ncCheck = {
    linux: 'which nc 2>/dev/null || echo "nc not found"',
    darwin: 'which nc 2>/dev/null || echo "nc not found"',
    default: 'echo "nc not available"'
  };
  
  const checkResult = await runPlatformCommand(ncCheck, 'Checking netcat', false);
  
  if (!checkResult.output.includes('not found')) {
    const portArray = ports.split(',').map(p => p.trim());
    for (const portRange of portArray.slice(0, 5)) { // Limit to 5 port ranges
      if (portRange.includes('-')) {
        const [start, end] = portRange.split('-').map(Number);
        const command = {
          linux: `nc -zv ${host} ${start}-${end} 2>&1 | grep succeeded`,
          darwin: `nc -z ${host} ${start}-${end} 2>&1`,
          default: `echo "Scanning ${start}-${end}"`
        };
        await runPlatformCommand(command, `Scanning ${portRange}`, false);
      } else {
        const command = {
          linux: `timeout 1 bash -c "echo >/dev/tcp/${host}/${portRange}" && echo "Port ${portRange}: OPEN" || echo "Port ${portRange}: CLOSED"`,
          darwin: `nc -z ${host} ${portRange} 2>&1 && echo "Port ${portRange}: OPEN" || echo "Port ${portRange}: CLOSED"`,
          default: `echo "Testing port ${portRange}"`
        };
        await runPlatformCommand(command, `Port ${portRange}`, false);
      }
    }
  } else {
    UI.warning('No port scanner available. Install nmap or netcat.');
    UI.info('Ubuntu/Debian: sudo apt-get install nmap');
    UI.info('macOS: brew install nmap');
    UI.info('Windows: Download from https://nmap.org/download.html');
  }
}

async function networkStats() {
  const response = await prompts({
    type: 'select',
    name: 'statsType',
    message: 'Network Statistics:',
    choices: [
      { title: '📊 Active Connections', value: 'connections' },
      { title: '📈 Network Traffic', value: 'traffic' },
      { title: '📡 Interface Statistics', value: 'interfaces' },
      { title: '🚦 Connection States', value: 'states' }
    ]
  });

  if (!response.statsType) return;

  const commandMaps = {
    connections: {
      win32: 'netstat -an | findstr ESTABLISHED',
      linux: 'netstat -an | grep ESTABLISHED',
      darwin: 'netstat -an | grep ESTABLISHED',
      default: 'netstat -an | grep ESTABLISHED'
    },
    traffic: {
      win32: 'netstat -e',
      linux: 'ifconfig | grep -E "RX|TX"',
      darwin: 'netstat -i',
      default: 'netstat -i'
    },
    interfaces: {
      win32: 'netsh interface ip show stats',
      linux: 'ip -s link',
      darwin: 'ifconfig -s',
      default: 'ifconfig -s'
    },
    states: {
      win32: 'netstat -an | findstr /C:"LISTEN" /C:"ESTABLISHED" /C:"TIME_WAIT"',
      linux: 'ss -s',
      darwin: 'netstat -an | awk \'NR>2 {print $6}\' | sort | uniq -c',
      default: 'netstat -an | awk \'NR>2 {print $6}\' | sort | uniq -c'
    }
  };

  await runPlatformCommand(commandMaps[response.statsType], `Network ${response.statsType}`);
}

async function speedTest() {
  UI.info('Running speed test...');
  
  const tools = [
    { name: 'speedtest-cli', cmd: 'speedtest-cli --simple' },
    { name: 'speedtest', cmd: 'speedtest' },
    { name: 'fast', cmd: 'fast' },
    { name: 'speedtest-net', cmd: 'npx speedtest-net --cli' }
  ];
  
  let availableTool = null;
  
  for (const tool of tools) {
    try {
      const { execa } = await import('execa');
      await execa(tool.name === 'speedtest-net' ? 'node' : tool.name, ['--version']);
      availableTool = tool;
      break;
    } catch (error) {
      continue;
    }
  }
  
  if (!availableTool) {
    UI.warning('No speed test tool found. Installing speedtest-cli...');
    
    const installResponse = await prompts({
      type: 'select',
      name: 'installMethod',
      message: 'Install speed test tool:',
      choices: [
        { title: '📦 pip (speedtest-cli)', value: 'pip' },
        { title: '📦 npm (speedtest-net)', value: 'npm' },
        { title: '🍺 Homebrew (macOS)', value: 'brew' },
        { title: '❌ Skip installation', value: 'skip' }
      ]
    });
    
    if (installResponse.installMethod === 'skip') return;
    
    const installCommands = {
      pip: { default: 'pip install speedtest-cli' },
      npm: { default: 'npm install -g speedtest-net' },
      brew: { darwin: 'brew install speedtest-cli', default: 'echo "Homebrew only available on macOS"' }
    };
    
    if (installCommands[installResponse.installMethod]) {
      await runPlatformCommand(installCommands[installResponse.installMethod], 'Installing speed test tool');
    }
    
    availableTool = tools[0];
  }
  
  if (availableTool) {
    const response = await prompts({
      type: 'select',
      name: 'testType',
      message: 'Speed test type:',
      choices: [
        { title: '🚀 Full test', value: 'full' },
        { title: '📥 Download only', value: 'download' },
        { title: '📤 Upload only', value: 'upload' }
      ]
    });

    let command = availableTool.cmd;
    
    if (response.testType === 'download' && availableTool.name === 'speedtest-cli') {
      command = 'speedtest-cli --no-upload';
    } else if (response.testType === 'upload' && availableTool.name === 'speedtest-cli') {
      command = 'speedtest-cli --no-download';
    }
    
    await runPlatformCommand({ default: command }, 'Speed test');
  } else {
    UI.error('Speed test failed. No tool available.');
  }
}

async function sslCheck() {
  const response = await prompts({
    type: 'text',
    name: 'domain',
    message: 'Domain to check (e.g., google.com):',
    initial: 'google.com'
  });

  if (!response.domain) return;

  let domain = response.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  UI.info(`Checking SSL/TLS for ${domain}...`);

  const commandMap = {
    win32: `
      echo Checking SSL for ${domain}... &&
      echo Please use one of these online tools: &&
      echo https://www.ssllabs.com/ssltest/analyze.html?d=${domain} &&
      echo https://check-host.net/ssl-certificate?host=${domain} &&
      echo.
      echo Or install OpenSSL for Windows: https://slproweb.com/products/Win32OpenSSL.html
    `,
    linux: `
      echo "=== SSL Check for ${domain} ===" &&
      echo "Certificate dates:" &&
      timeout 5 openssl s_client -connect ${domain}:443 -servername ${domain} 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "Cannot connect" &&
      echo "" &&
      echo "Certificate issuer:" &&
      timeout 5 openssl s_client -connect ${domain}:443 -servername ${domain} 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null || echo "Cannot get issuer" &&
      echo "" &&
      echo "Certificate subject:" &&
      timeout 5 openssl s_client -connect ${domain}:443 -servername ${domain} 2>/dev/null | openssl x509 -noout -subject 2>/dev/null || echo "Cannot get subject"
    `,
    darwin: `
      echo "=== SSL Check for ${domain} ===" &&
      echo "Certificate dates:" &&
      gtimeout 5 openssl s_client -connect ${domain}:443 -servername ${domain} 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "Cannot connect" &&
      echo "" &&
      echo "Certificate issuer:" &&
      gtimeout 5 openssl s_client -connect ${domain}:443 -servername ${domain} 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null || echo "Cannot get issuer" &&
      echo "" &&
      echo "Certificate subject:" &&
      gtimeout 5 openssl s_client -connect ${domain}:443 -servername ${domain} 2>/dev/null | openssl x509 -noout -subject 2>/dev/null || echo "Cannot get subject"
    `,
    default: `
      echo "SSL check not available. Use online tools:"
      echo "https://www.ssllabs.com/ssltest/analyze.html?d=${domain}"
    `
  };

  await runPlatformCommand(commandMap, `SSL check for ${domain}`);

  const curlCommand = {
    default: `curl -I https://${domain} 2>/dev/null | head -10 || echo "Cannot connect via HTTPS"`
  };
  
  await runPlatformCommand(curlCommand, `HTTPS headers for ${domain}`);
}

async function networkScan() {
  const scanTypeResponse = await prompts({
    type: 'select',
    name: 'scanType',
    message: 'Scan type:',
    choices: [
      { title: '🔍 Quick scan (ping only)', value: 'quick' },
      { title: '🔎 Full scan (with OS detection)', value: 'full' },
      { title: '🎯 Specific scan', value: 'specific' },
      { title: '🏠 Local network scan', value: 'local' }
    ]
  });

  if (!scanTypeResponse.scanType) return;

  let target = '';
  
  if (scanTypeResponse.scanType === 'local') {
    const localNetworkCommands = {
      win32: 'ipconfig | findstr "IPv4" | findstr /v "127.0.0.1"',
      linux: 'ip route | grep default | awk \'{print $3}\' | cut -d. -f1-3',
      darwin: 'route -n get default | grep gateway | awk \'{print $2}\' | cut -d. -f1-3',
      default: 'echo "192.168.1"'
    };
    
    const result = await runPlatformCommand(localNetworkCommands, 'Detecting local network', false);
    const networkBase = result.output ? result.output.trim() : '192.168.1';
    target = `${networkBase}.0/24`;
  } else {
    const networkResponse = await prompts({
      type: 'text',
      name: 'network',
      message: 'Network to scan (e.g., 192.168.1.0/24):',
      initial: '192.168.1.0/24'
    });

    if (!networkResponse.network) return;
    target = networkResponse.network;
  }

  let options = '-sn'; 
  if (scanTypeResponse.scanType === 'full') {
    options = '-A -T4';
  } else if (scanTypeResponse.scanType === 'specific') {
    const scanOptionsResponse = await prompts({
      type: 'text',
      name: 'scanOptions',
      message: 'nmap options (e.g., -sV -O):',
      initial: '-sV'
    });
    if (scanOptionsResponse.scanOptions) {
      options = scanOptionsResponse.scanOptions;
    }
  }

  const nmapCheck = {
    win32: 'where nmap 2>nul || echo "nmap not found"',
    linux: 'which nmap 2>/dev/null || echo "nmap not found"',
    darwin: 'which nmap 2>/dev/null || echo "nmap not found"',
    default: 'echo "nmap not available"'
  };

  const checkResult = await runPlatformCommand(nmapCheck, 'Checking nmap', false);
  
  if (checkResult.output && checkResult.output.includes('not found')) {
    UI.warning('nmap not installed. Cannot perform network scan.');
    UI.info('Install nmap:');
    UI.info('  Ubuntu/Debian: sudo apt-get install nmap');
    UI.info('  macOS: brew install nmap');
    UI.info('  Windows: Download from https://nmap.org/download.html');
    UI.info('');
    UI.info(`Alternative: Use ping scan on ${target}`);
    
    const pingCommand = {
      win32: `for /L %i in (1,1,254) do @ping -n 1 -w 100 ${target.split('.')[0]}.${target.split('.')[1]}.${target.split('.')[2]}.%i | findstr "TTL"`,
      linux: `for i in {1..254}; do ping -c 1 -W 100 ${target.split('.')[0]}.${target.split('.')[1]}.${target.split('.')[2]}.$i | grep "bytes from" & done`,
      darwin: `for i in {1..254}; do ping -c 1 -t 100 ${target.split('.')[0]}.${target.split('.')[1]}.${target.split('.')[2]}.$i | grep "bytes from" & done`,
      default: `echo "Ping scan not available"`
    };
    
    await runPlatformCommand(pingCommand, `Ping scan ${target}`);
  } else {
    const commandMap = {
      win32: `nmap ${options} ${target}`,
      linux: `nmap ${options} ${target}`,
      darwin: `nmap ${options} ${target}`,
      default: `echo "nmap scan not available"`
    };
    
    await runPlatformCommand(commandMap, `Network scan ${target}`);
  }
}

async function dnsTools() {
  const response = await prompts({
    type: 'select',
    name: 'tool',
    message: 'DNS Tools:',
    choices: [
      { title: '🔍 DNS Lookup', value: 'lookup' },
      { title: '🔄 Reverse DNS', value: 'reverse' },
      { title: '📋 DNS Records', value: 'records' },
      { title: '📡 DNS Server Test', value: 'server' },
      { title: '🚀 DNS Speed Test', value: 'speed' }
    ]
  });

  if (!response.tool) return;

  const domainResponse = await prompts({
    type: 'text',
    name: 'domain',
    message: 'Domain or IP:',
    initial: 'google.com'
  });

  if (!domainResponse.domain) return;

  const commandMaps = {
    lookup: {
      win32: `nslookup ${domainResponse.domain}`,
      linux: `dig ${domainResponse.domain} +short || host ${domainResponse.domain}`,
      darwin: `dig ${domainResponse.domain} +short || host ${domainResponse.domain}`,
      default: `nslookup ${domainResponse.domain}`
    },
    reverse: {
      win32: `nslookup ${domainResponse.domain}`,
      linux: `dig -x ${domainResponse.domain} +short || host ${domainResponse.domain}`,
      darwin: `dig -x ${domainResponse.domain} +short || host ${domainResponse.domain}`,
      default: `nslookup ${domainResponse.domain}`
    },
    records: {
      win32: `nslookup -type=any ${domainResponse.domain}`,
      linux: `dig ${domainResponse.domain} ANY +noall +answer`,
      darwin: `dig ${domainResponse.domain} ANY +noall +answer`,
      default: `nslookup -type=any ${domainResponse.domain}`
    },
    server: {
      win32: `nslookup ${domainResponse.domain} 8.8.8.8`,
      linux: `dig @8.8.8.8 ${domainResponse.domain}`,
      darwin: `dig @8.8.8.8 ${domainResponse.domain}`,
      default: `nslookup ${domainResponse.domain} 8.8.8.8`
    },
    speed: {
      win32: `powershell -Command "$dns = '8.8.8.8','1.1.1.1','9.9.9.9'; foreach($server in $dns) { $time = Measure-Command { nslookup google.com $server 2>&1 | Out-Null }; Write-Host '$server: $($time.TotalMilliseconds)ms' }"`,
      linux: `for dns in 8.8.8.8 1.1.1.1 9.9.9.9; do time dig @$dns google.com +short > /dev/null 2>&1; echo "$dns: $?"; done`,
      darwin: `for dns in 8.8.8.8 1.1.1.1 9.9.9.9; do time dig @$dns google.com +short > /dev/null 2>&1; echo "$dns: $?"; done`,
      default: `echo "DNS speed test"`
    }
  };

  await runPlatformCommand(commandMaps[response.tool], `DNS ${response.tool} for ${domainResponse.domain}`);
}

async function firewallTools() {
  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'Firewall Tools:',
    choices: [
      { title: '🛡️ Firewall Status', value: 'status' },
      { title: '📋 Firewall Rules', value: 'rules' },
      { title: '🔓 Open Port', value: 'open' },
      { title: '🔒 Close Port', value: 'close' },
      ...(isWindows() ? [
        { title: '⚙️ Windows Firewall', value: 'windows' }
      ] : [])
    ]
  });

  if (!response.action) return;

  const commandMaps = {
    status: {
      win32: 'netsh advfirewall show allprofiles state',
      linux: 'sudo ufw status || sudo iptables -L -n -v',
      darwin: 'sudo pfctl -s info 2>/dev/null || echo "pf firewall not active"',
      default: 'echo "Firewall status not available"'
    },
    rules: {
      win32: 'netsh advfirewall firewall show rule name=all',
      linux: 'sudo iptables -L -n -v',
      darwin: 'sudo pfctl -s rules 2>/dev/null',
      default: 'echo "Firewall rules not available"'
    },
    open: {
      win32: 'echo "Use: netsh advfirewall firewall add rule..."',
      linux: 'echo "Use: sudo ufw allow <port>"',
      darwin: 'echo "Use: sudo pfctl -t <table> -T add <host>"',
      default: 'echo "Port opening requires admin privileges"'
    },
    close: {
      win32: 'echo "Use: netsh advfirewall firewall delete rule..."',
      linux: 'echo "Use: sudo ufw deny <port>"',
      darwin: 'echo "Use: sudo pfctl -t <table> -T delete <host>"',
      default: 'echo "Port closing requires admin privileges"'
    },
    windows: {
      win32: 'powershell -Command "Get-NetFirewallProfile | Format-Table Name, Enabled"',
      default: 'echo "Windows firewall commands only available on Windows"'
    }
  };

  await runPlatformCommand(commandMaps[response.action], `Firewall ${response.action}`);
}
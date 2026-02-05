import prompts from "prompts";
import {
  runPlatformCommand,
  isWindows,
  isLinux,
  isMacOS,
} from "../commands/executor.js";
import { UI } from "../lib/ui.js";
import chalk from "chalk";

export async function servicesModule() {
  while (true) {
    console.clear();
    UI.header("⚙️  Services Manager (Multi-platform)");

    // Dynamic options based on platform
    const platform = getCurrentPlatform();
    const platformName = getPlatformName();

    console.log(chalk.gray(`📱 Platform: ${platformName}`));
    console.log();

    const menuChoices = getMenuChoices(platform);

    const response = await prompts({
      type: "select",
      name: "action",
      message: "Services Management:",
      choices: menuChoices,
    });

    if (!response.action || response.action === "back") break;
    await handleServiceAction(response.action);
  }
}

// Utility functions
function getCurrentPlatform() {
  if (isWindows()) return "win32";
  if (isLinux()) return "linux";
  if (isMacOS()) return "darwin";
  return "unknown";
}

function getPlatformName() {
  if (isWindows()) return "Windows";
  if (isLinux()) return "Linux";
  if (isMacOS()) return "macOS";
  return "Unknown";
}

function getMenuChoices(platform) {
  const baseChoices = [
    { title: "📋 List services", value: "list" },
    { title: "🚀 Start a service", value: "start" },
    { title: "⏹️  Stop a service", value: "stop" },
    { title: "🔄 Restart a service", value: "restart" },
    { title: "📊 View status", value: "status" },
    { title: "📜 System logs", value: "logs" },
  ];

  // Add platform-specific options
  const platformSpecific = [];

  if (platform === "linux") {
    platformSpecific.push(
      { title: "🔧 Enable/Disable", value: "toggle" },
      { title: "🐋 Docker Services", value: "docker" },
    );
  } else if (platform === "win32") {
    platformSpecific.push(
      { title: "🔄 Manage startup", value: "autostart" },
      { title: "🛠️  Services console", value: "console" },
    );
  } else if (platform === "darwin") {
    platformSpecific.push({ title: "🍎 LaunchDaemons", value: "launchd" });
  }

  return [
    ...baseChoices,
    ...(platformSpecific.length > 0 ? platformSpecific : []),
    { title: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", disabled: true },
    { title: "📊 Service statistics", value: "stats" },
    { title: "🔍 Search for a service", value: "search" },
    { title: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", disabled: true },
    { title: "⬅️ Back to main menu", value: "back" },
  ];
}

async function handleServiceAction(action) {
  try {
    switch (action) {
      case "list":
        await listServices();
        break;
      case "start":
        await manageService("start");
        break;
      case "stop":
        await manageService("stop");
        break;
      case "restart":
        await manageService("restart");
        break;
      case "status":
        await manageService("status");
        break;
      case "toggle":
        await toggleService();
        break;
      case "logs":
        await showLogs();
        break;
      case "docker":
        await manageDockerServices();
        break;
      case "autostart":
        await manageAutostart();
        break;
      case "console":
        await openServicesConsole();
        break;
      case "launchd":
        await manageLaunchDaemons();
        break;
      case "stats":
        await showServiceStats();
        break;
      case "search":
        await searchService();
        break;
      default:
        UI.warning("Unrecognized action");
    }
  } catch (error) {
    UI.error(`Error: ${error.message}`);
  }

  await prompts({
    type: "text",
    name: "continue",
    message: "Press Enter to continue...",
    initial: "",
  });
}

async function listServices() {
  const response = await prompts({
    type: "select",
    name: "type",
    message: "Type of services to list:",
    choices: [
      { title: "All services", value: "all" },
      { title: "Active services", value: "active" },
      { title: "Inactive services", value: "inactive" },
      { title: "Failed services", value: "failed" },
      { title: "Startup services", value: "autostart" },
      { title: "User services", value: "user" },
      { title: "🔍 Advanced search", value: "advanced" },
    ],
  });

  const commandMap = {
    linux: getLinuxListCommand(response.type),
    win32: getWindowsListCommand(response.type),
    darwin: getMacOSListCommand(response.type),
    default: `echo "Service list not supported for type: ${response.type}"`,
  };

  await runPlatformCommand(commandMap, `Service list (${response.type})`);
}

// Linux-specific commands
function getLinuxListCommand(type) {
  switch (type) {
    case "active":
      return "systemctl list-units --type=service --state=active --no-pager";
    case "inactive":
      return "systemctl list-units --type=service --state=inactive --no-pager";
    case "failed":
      return "systemctl list-units --type=service --state=failed --no-pager";
    case "autostart":
      return "systemctl list-unit-files --type=service --state=enabled";
    case "user":
      return "systemctl --user list-units --type=service";
    case "advanced":
      return "systemctl list-units --type=service --all";
    default:
      return "systemctl list-units --type=service";
  }
}

// Windows-specific commands
function getWindowsListCommand(type) {
  switch (type) {
    case "active":
      return "powershell -Command \"Get-Service | Where-Object {$_.Status -eq 'Running'} | Format-Table -AutoSize\"";
    case "inactive":
      return "powershell -Command \"Get-Service | Where-Object {$_.Status -eq 'Stopped'} | Format-Table -AutoSize\"";
    case "failed":
      return "powershell -Command \"Get-Service | Where-Object {$_.Status -eq 'Failed'} | Format-Table -AutoSize\"";
    case "autostart":
      return 'sc query | findstr "SERVICE_NAME:"';
    case "user":
      return "tasklist /svc | more";
    case "advanced":
      return "wmic service list brief";
    default:
      return 'powershell -Command "Get-Service | Format-Table -AutoSize"';
  }
}

// macOS-specific commands
function getMacOSListCommand(type) {
  switch (type) {
    case "active":
      return 'launchctl list | grep -v "\t-" | head -50';
    case "inactive":
      return 'launchctl list | grep "\t-" | head -50';
    case "autostart":
      return "ls /Library/LaunchDaemons /Library/LaunchAgents ~/Library/LaunchAgents 2>/dev/null | head -30";
    case "user":
      return "launchctl list | head -50";
    case "advanced":
      return "launchctl list | head -100";
    default:
      return "launchctl list | head -30";
  }
}

async function manageService(action) {
  // Ask for service name
  const serviceResponse = await prompts({
    type: "text",
    name: "service",
    message: `Service name to ${action}:`,
    validate: (value) => (value.trim() ? true : "Service name is required"),
  });

  if (!serviceResponse.service) return;

  // Build commands according to platform
  const commandMap = {
    linux: getLinuxServiceCommand(action, serviceResponse.service),
    win32: getWindowsServiceCommand(action, serviceResponse.service),
    darwin: getMacOSServiceCommand(action, serviceResponse.service),
    default: `echo "Action '${action}' not supported for service ${serviceResponse.service}"`,
  };

  const actionNames = {
    start: "Starting",
    stop: "Stopping",
    restart: "Restarting",
    status: "Status of",
  };

  await runPlatformCommand(
    commandMap,
    `${actionNames[action] || action} service ${serviceResponse.service}`,
  );
}

function getLinuxServiceCommand(action, service) {
  switch (action) {
    case "start":
      return `sudo systemctl start "${service}"`;
    case "stop":
      return `sudo systemctl stop "${service}"`;
    case "restart":
      return `sudo systemctl restart "${service}"`;
    case "status":
      return `systemctl status "${service}" --no-pager`;
    default:
      return `echo "Action not supported: ${action}"`;
  }
}

function getWindowsServiceCommand(action, service) {
  switch (action) {
    case "start":
      return `net start "${service}" 2>nul || sc start "${service}"`;
    case "stop":
      return `net stop "${service}" 2>nul || sc stop "${service}"`;
    case "restart":
      return `powershell -Command "Restart-Service -Name '${service}' -Force"`;
    case "status":
      return `sc query "${service}"`;
    default:
      return `echo "Action not supported: ${action}"`;
  }
}

function getMacOSServiceCommand(action, service) {
  switch (action) {
    case "start":
      return `sudo launchctl start ${service}`;
    case "stop":
      return `sudo launchctl stop ${service}`;
    case "restart":
      return `sudo launchctl stop ${service} && sudo launchctl start ${service}`;
    case "status":
      return `launchctl list | grep ${service} || echo "Service not found"`;
    default:
      return `echo "Action not supported: ${action}"`;
  }
}

async function toggleService() {
  const serviceResponse = await prompts({
    type: "text",
    name: "service",
    message: "Service name:",
    validate: (value) => (value.trim() ? true : "Service name is required"),
  });

  if (!serviceResponse.service) return;

  const actionResponse = await prompts({
    type: "select",
    name: "action",
    message: "Action:",
    choices: [
      { title: "✅ Enable at startup", value: "enable" },
      { title: "❌ Disable at startup", value: "disable" },
      { title: "🔄 Re-enable", value: "reenable" },
      { title: "🎭 Mask mode", value: "mask" },
      { title: "👻 Unmask", value: "unmask" },
    ],
  });

  if (!actionResponse.action) return;

  const commandMap = {
    linux: getLinuxToggleCommand(
      actionResponse.action,
      serviceResponse.service,
    ),
    win32: getWindowsToggleCommand(
      actionResponse.action,
      serviceResponse.service,
    ),
    darwin: getMacOSToggleCommand(
      actionResponse.action,
      serviceResponse.service,
    ),
    default: `echo "Action '${actionResponse.action}' not supported"`,
  };

  await runPlatformCommand(
    commandMap,
    `${actionResponse.action} service ${serviceResponse.service}`,
  );
}

function getLinuxToggleCommand(action, service) {
  switch (action) {
    case "enable":
      return `sudo systemctl enable "${service}"`;
    case "disable":
      return `sudo systemctl disable "${service}"`;
    case "reenable":
      return `sudo systemctl reenable "${service}"`;
    case "mask":
      return `sudo systemctl mask "${service}"`;
    case "unmask":
      return `sudo systemctl unmask "${service}"`;
    default:
      return `echo "Toggle action not supported: ${action}"`;
  }
}

function getWindowsToggleCommand(action, service) {
  switch (action) {
    case "enable":
      return `sc config "${service}" start=auto`;
    case "disable":
      return `sc config "${service}" start=disabled`;
    case "reenable":
      return `sc config "${service}" start=auto && sc start "${service}"`;
    default:
      return `echo "Action '${action}' not available on Windows"`;
  }
}

function getMacOSToggleCommand(action, service) {
  switch (action) {
    case "enable":
      return `sudo launchctl load -w /Library/LaunchDaemons/${service}.plist 2>/dev/null || echo ".plist file not found"`;
    case "disable":
      return `sudo launchctl unload -w /Library/LaunchDaemons/${service}.plist 2>/dev/null || echo ".plist file not found"`;
    default:
      return `echo "Action '${action}' not available on macOS"`;
  }
}

async function showLogs() {
  const response = await prompts({
    type: "select",
    name: "option",
    message: "Log options:",
    choices: [
      { title: "📜 System logs", value: "system" },
      { title: "🎯 Service logs", value: "service" },
      { title: "⏱️  Recent entries", value: "recent" },
      { title: "🔍 Search", value: "search" },
      { title: "📊 Error statistics", value: "errors" },
    ],
  });

  const commandMap = {
    linux: getLinuxLogCommand(response.option),
    win32: getWindowsLogCommand(response.option),
    darwin: getMacOSLogCommand(response.option),
    default: 'echo "Logs not available"',
  };

  await runPlatformCommand(commandMap, "Displaying logs");
}

function getLinuxLogCommand(option) {
  switch (option) {
    case "system":
      return "sudo journalctl --system --no-pager | tail -50";
    case "service":
      return 'echo "Please specify a service"';
    case "recent":
      return "sudo journalctl -n 50 --no-pager";
    case "search":
      return 'echo "Please specify a search term"';
    case "errors":
      return "sudo journalctl -p err -b --no-pager | tail -20";
    default:
      return "sudo journalctl --no-pager | tail -50";
  }
}

function getWindowsLogCommand(option) {
  switch (option) {
    case "system":
      return 'powershell -Command "Get-EventLog -LogName System -Newest 50"';
    case "service":
      return 'powershell -Command "Get-EventLog -LogName Application -Newest 50"';
    case "recent":
      return 'powershell -Command "Get-WinEvent -MaxEvents 50"';
    case "errors":
      return 'powershell -Command "Get-EventLog -LogName System -EntryType Error -Newest 20"';
    default:
      return 'powershell -Command "Get-EventLog -LogName Application -Newest 30"';
  }
}

function getMacOSLogCommand(option) {
  switch (option) {
    case "system":
      return "log show --predicate \"senderImagePath contains 'kernel'\" --last 1h --style syslog | tail -30";
    case "service":
      return "log show --last 1h --style syslog | tail -30";
    case "recent":
      return "log show --last 30m --style syslog";
    case "errors":
      return 'log show --predicate "messageType == error" --last 1h --style syslog | tail -20';
    default:
      return "log show --last 1h --style syslog | tail -30";
  }
}

async function manageDockerServices() {
  const response = await prompts({
    type: "select",
    name: "action",
    message: "Docker Management:",
    choices: [
      { title: "🐳 List containers", value: "list" },
      { title: "▶️  Start Docker", value: "start" },
      { title: "⏹️  Stop Docker", value: "stop" },
      { title: "📊 Docker status", value: "status" },
      { title: "⬅️ Back", value: "back" },
    ],
  });

  if (!response.action || response.action === "back") return;

  const commands = {
    list: "docker ps -a",
    start: "sudo systemctl start docker",
    stop: "sudo systemctl stop docker",
    status: "sudo systemctl status docker",
  };

  if (commands[response.action]) {
    await runPlatformCommand(
      { default: commands[response.action] },
      `Docker: ${response.action}`,
    );
  }
}

async function manageAutostart() {
  UI.info("Startup services management - Windows");

  const response = await prompts({
    type: "select",
    name: "action",
    message: "Action:",
    choices: [
      { title: "📋 List auto services", value: "list" },
      { title: "➕ Add a service", value: "add" },
      { title: "➖ Remove a service", value: "remove" },
      { title: "🔄 Modify a service", value: "modify" },
    ],
  });

  const commandMap = {
    win32: getWindowsAutostartCommand(response.action),
    default: 'echo "Startup management not supported"',
  };

  await runPlatformCommand(
    commandMap,
    `Startup management: ${response.action}`,
  );
}

function getWindowsAutostartCommand(action) {
  switch (action) {
    case "list":
      return 'reg query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"';
    case "add":
      return 'echo "Use: reg add HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v ServiceName /t REG_SZ /d "path\\service.exe""';
    case "remove":
      return 'echo "Use: reg delete HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v ServiceName /f"';
    case "modify":
      return 'echo "Modify the corresponding registry key"';
    default:
      return 'echo "Action not supported"';
  }
}

async function openServicesConsole() {
  const commandMap = {
    win32: "services.msc",
    default: 'echo "Windows services console only"',
  };

  await runPlatformCommand(commandMap, "Opening services console");
}

async function manageLaunchDaemons() {
  UI.info("LaunchDaemons management - macOS");

  const response = await prompts({
    type: "select",
    name: "action",
    message: "Action:",
    choices: [
      { title: "📁 List LaunchDaemons", value: "list" },
      { title: "📝 View a plist", value: "view" },
      { title: "🔄 Reload all", value: "reload" },
    ],
  });

  const commandMap = {
    darwin: getMacOSLaunchdCommand(response.action),
    default: 'echo "macOS LaunchDaemons only"',
  };

  await runPlatformCommand(commandMap, `LaunchDaemons: ${response.action}`);
}

function getMacOSLaunchdCommand(action) {
  switch (action) {
    case "list":
      return "ls -la /Library/LaunchDaemons/";
    case "view":
      return 'echo "Specify a .plist file to view"';
    case "reload":
      return "sudo launchctl load /Library/LaunchDaemons/*.plist";
    default:
      return 'echo "Action not supported"';
  }
}

async function showServiceStats() {
  const commandMap = {
    linux: getLinuxServiceStats(),
    win32: getWindowsServiceStats(),
    darwin: getMacOSServiceStats(),
    default: 'echo "Statistics not available"',
  };

  await runPlatformCommand(commandMap, "Service statistics");
}

function getLinuxServiceStats() {
  return `
    echo "=== Linux Service Statistics ===" &&
    echo "Total: $(systemctl list-units --type=service --all | wc -l)" &&
    echo "Active: $(systemctl list-units --type=service --state=active | wc -l)" &&
    echo "Inactive: $(systemctl list-units --type=service --state=inactive | wc -l)" &&
    echo "Failed: $(systemctl list-units --type=service --state=failed | wc -l)"
  `;
}

function getWindowsServiceStats() {
  return `
    powershell -Command "
      \$services = Get-Service
      \$total = \$services.Count
      \$running = (\$services | Where-Object {\$_.Status -eq 'Running'}).Count
      \$stopped = (\$services | Where-Object {\$_.Status -eq 'Stopped'}).Count
      Write-Host '=== Windows Service Statistics ==='
      Write-Host \"Total: \$total\"
      Write-Host \"Running: \$running\"
      Write-Host \"Stopped: \$stopped\"
      Write-Host \"Failed: \$(\$total - \$running - \$stopped)\"
    "
  `;
}

function getMacOSServiceStats() {
  return `
    echo "=== macOS Service Statistics ===" &&
    echo "Total LaunchDaemons: $(ls /Library/LaunchDaemons/ 2>/dev/null | wc -l)" &&
    echo "Total LaunchAgents: $(ls /Library/LaunchAgents/ 2>/dev/null | wc -l)" &&
    echo "Active services: $(launchctl list | grep -v "\\t-" | wc -l)" &&
    echo "Inactive services: $(launchctl list | grep "\\t-" | wc -l)"
  `;
}

async function searchService() {
  const response = await prompts({
    type: "text",
    name: "term",
    message: "Search term:",
    validate: (value) => (value.trim() ? true : "Please enter a search term"),
  });

  if (!response.term) return;

  const commandMap = {
    linux: `systemctl list-units --type=service --all | grep -i "${response.term}" || echo "No results"`,
    win32: `powershell -Command "Get-Service | Where-Object {\$_.Name -like '*${response.term}*' -or \$_.DisplayName -like '*${response.term}*'} | Format-Table -AutoSize"`,
    darwin: `launchctl list | grep -i "${response.term}" || echo "No results"`,
    default: `echo "Search not supported"`,
  };

  await runPlatformCommand(commandMap, `Search: ${response.term}`);
}

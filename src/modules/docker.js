import prompts from 'prompts';
import { runPlatformCommand } from '../commands/executor.js';
import { UI } from '../lib/ui.js';
import os from 'os';


export async function dockerModule() {
  while (true) {
    console.clear();
    UI.header('🐳 Docker Manager (Multi-platform)');
    
    const platform = os.platform();
    console.log(`📱 Platform: ${platform}\n`);


    const response = await prompts({
      type: 'select',
      name: 'action',
      message: 'Docker Actions:',
      choices: [
        { title: '📋 List Containers', value: 'ps' },
        { title: '📦 List Images', value: 'images' },
        { title: '🚀 Start Services (Compose)', value: 'up' },
        { title: '⏹️ Stop Services (Compose)', value: 'down' },
        { title: '🔧 Build Image', value: 'build' },
        { title: '▶️ Start Container', value: 'start' },
        { title: '⏸️ Pause Container', value: 'pause' },
        { title: '▶️ Resume Container', value: 'unpause' },
        { title: '♻️ Restart Container', value: 'restart' },
        { title: '🗑️ Remove Container', value: 'rm' },
        { title: '🧹 Clean Docker', value: 'prune' },
        { title: '📊 Statistics', value: 'stats' },
        { title: '📝 Container Logs', value: 'logs' },
        { title: '🔍 Inspect Container', value: 'inspect' },
        { title: '⚙️ Docker Compose', value: 'compose' },
        { title: '🐋 Docker Swarm', value: 'swarm' },
        { title: '📁 Volumes', value: 'volumes' },
        { title: '🌐 Networks', value: 'networks' },
        { title: '', value: 'separator', disabled: true },
        { title: '⬅️ Back', value: 'back' }
      ]
    });

    if (!response.action || response.action === 'back') break;

    await handleDockerAction(response.action);
    
    await prompts({
      type: 'text',
      name: 'continue',
      message: 'Press Enter to continue...',
      initial: ''
    });
  }
}

async function handleDockerAction(action) {
  try {
    switch (action) {
      case 'ps':
        await listContainers();
        break;
      case 'images':
        await listImages();
        break;
      case 'up':
        await dockerComposeUp();
        break;
      case 'down':
        await dockerComposeDown();
        break;
      case 'prune':
        await dockerPrune();
        break;
      case 'stats':
        await dockerStats();
        break;
      case 'logs':
        await containerLogs();
        break;
      case 'inspect':
        await inspectContainer();
        break;
      case 'build':
        await buildImage();
        break;
      case 'start':
        await startContainer();
        break;
      case 'pause':
        await pauseContainer();
        break;
      case 'unpause':
        await unpauseContainer();
        break;
      case 'restart':
        await restartContainer();
        break;
      case 'rm':
        await removeContainer();
        break;
      case 'compose':
        await dockerComposeMenu();
        break;
      case 'swarm':
        await dockerSwarmMenu();
        break;
      case 'volumes':
        await dockerVolumes();
        break;
      case 'networks':
        await dockerNetworks();
        break;
    }
  } catch (error) {
    UI.error(`Docker Error: ${error.message}`);
  }
}

async function listContainers() {
  const response = await prompts({
    type: 'select',
    name: 'listType',
    message: 'Container List Type:',
    choices: [
      { title: '📋 All Containers', value: 'all' },
      { title: '▶️ Running Only', value: 'running' },
      { title: '⏹️ Stopped Only', value: 'stopped' },
      { title: '📊 Detailed List', value: 'detailed' }
    ]
  });

  const commandMap = {
    all: {
      win32: 'docker ps -a --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"',
      linux: 'docker ps -a --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"',
      darwin: 'docker ps -a --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"',
      default: 'docker ps -a'
    },
    running: {
      win32: 'docker ps --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"',
      linux: 'docker ps --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"',
      darwin: 'docker ps --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"',
      default: 'docker ps'
    },
    stopped: {
      win32: 'docker ps -a --filter "status=exited" --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}"',
      linux: 'docker ps -a --filter "status=exited" --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}"',
      darwin: 'docker ps -a --filter "status=exited" --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}"',
      default: 'docker ps -a --filter "status=exited"'
    },
    detailed: {
      win32: 'docker ps -a --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}\\t{{.RunningFor}}"',
      linux: 'docker ps -a --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}\\t{{.RunningFor}}"',
      darwin: 'docker ps -a --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}\\t{{.RunningFor}}"',
      default: 'docker ps -a'
    }
  };

  await runPlatformCommand(commandMap[response.listType], 'Docker Containers');
}

async function listImages() {
  const response = await prompts({
    type: 'select',
    name: 'listType',
    message: 'Image List Type:',
    choices: [
      { title: '📋 All Images', value: 'all' },
      { title: '🔍 Filter by Name', value: 'filter' },
      { title: '📊 Size Information', value: 'size' }
    ]
  });

  let command = 'docker images';
  
  if (response.listType === 'filter') {
    const filterResponse = await prompts({
      type: 'text',
      name: 'filter',
      message: 'Filter (e.g., ubuntu, nginx):',
      initial: ''
    });
    
    if (filterResponse.filter) {
      command = `docker images | grep ${filterResponse.filter}`;
    }
  } else if (response.listType === 'size') {
    command = 'docker images --format "table {{.Repository}}\\t{{.Tag}}\\t{{.ID}}\\t{{.Size}}"';
  }

  const commandMap = {
    win32: command,
    linux: command,
    darwin: command,
    default: command
  };

  await runPlatformCommand(commandMap, 'Docker Images');
}

async function dockerComposeUp() {
  const composeFiles = ['docker-compose.yml', 'docker-compose.yaml', 'docker-compose.override.yml'];
  
  let composeFile = '';
  for (const file of composeFiles) {
    try {
      const fs = await import('fs');
      if (fs.existsSync(file)) {
        composeFile = file;
        break;
      }
    } catch (error) {
    }
  }

  if (!composeFile) {
    UI.warning('No docker-compose.yml file found in current directory.');
    const customFile = await prompts({
      type: 'text',
      name: 'file',
      message: 'Path to docker-compose file:',
      initial: './docker-compose.yml'
    });
    
    if (!customFile.file) return;
    composeFile = customFile.file;
  }

  const upResponse = await prompts({
    type: 'multiselect',
    name: 'upOptions',
    message: 'Docker Compose Options: (Space to select)',
    choices: [
      { title: 'Detached mode (-d)', value: '-d', selected: true },
      { title: 'Force rebuild (--build)', value: '--build' },
      { title: 'Force recreate containers (--force-recreate)', value: '--force-recreate' },
      { title: 'Remove orphans (--remove-orphans)', value: '--remove-orphans' }
    ],
    hint: '- Space to select. Enter to confirm'
  });
  
  const upOptions = upResponse.upOptions || [];
  
  const composeCommand = await getComposeCommand();
  const command = `${composeCommand} -f "${composeFile}" up ${upOptions.join(' ')}`;
  
  const commandMap = {
    win32: command,
    linux: command,
    darwin: command,
    default: command
  };

  await runPlatformCommand(commandMap, 'Starting Docker Services');
}

async function dockerComposeDown() {
  const downResponse = await prompts({
    type: 'multiselect',
    name: 'downOptions',
    message: 'Options: (Space to select)',
    choices: [
      { title: 'Remove volumes (-v)', value: '-v' },
      { title: 'Remove images (--rmi)', value: '--rmi all' },
      { title: 'Remove orphans (--remove-orphans)', value: '--remove-orphans' }
    ],
    hint: '- Space to select. Enter to confirm'
  });
  
  const downOptions = downResponse.downOptions || [];
  
  const composeCommand = await getComposeCommand();
  const command = `${composeCommand} down ${downOptions.join(' ')}`;
  
  const commandMap = {
    win32: command,
    linux: command,
    darwin: command,
    default: command
  };

  await runPlatformCommand(commandMap, 'Stopping Docker Services');
}

async function dockerPrune() {
  const response = await prompts({
    type: 'select',
    name: 'pruneType',
    message: 'What to clean:',
    choices: [
      { title: '🧹 System Prune (Recommended)', value: 'system' },
      { title: '🗑️ Remove All Unused', value: 'all' },
      { title: '📦 Remove Dangling Images', value: 'images' },
      { title: '📁 Remove Dangling Volumes', value: 'volumes' },
      { title: '🌐 Remove Unused Networks', value: 'networks' },
      { title: '🚫 Remove Stopped Containers', value: 'containers' }
    ]
  });

  const commands = {
    system: { default: 'docker system prune -f' },
    all: { default: 'docker system prune -a -f' },
    images: { default: 'docker image prune -f' },
    volumes: { default: 'docker volume prune -f' },
    networks: { default: 'docker network prune -f' },
    containers: { default: 'docker container prune -f' }
  };

  if (response.pruneType) {
    const confirm = await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Are you sure you want to proceed?',
      initial: true
    });
    
    if (confirm.value) {
      await runPlatformCommand(commands[response.pruneType], 'Cleaning Docker');
    }
  }
}

async function dockerStats() {
  const response = await prompts({
    type: 'select',
    name: 'statsType',
    message: 'Statistics Type:',
    choices: [
      { title: '📊 Single Snapshot', value: 'snapshot' },
      { title: '📈 Live Statistics', value: 'live' }
    ]
  });

  if (response.statsType === 'live') {
    console.clear();
    console.log('📈 Docker Live Statistics - Press Ctrl+C to exit\n');
    
    const commandMap = {
      win32: 'docker stats',
      linux: 'docker stats',
      darwin: 'docker stats',
      default: 'docker stats'
    };
    
    try {
      await runPlatformCommand(commandMap, 'Live Docker Statistics');
    } catch (error) {
      console.log('\nLive statistics stopped.');
    }
  } else {
    const commandMap = {
      win32: 'docker stats --no-stream',
      linux: 'docker stats --no-stream',
      darwin: 'docker stats --no-stream',
      default: 'docker stats --no-stream'
    };
    
    await runPlatformCommand(commandMap, 'Docker Statistics');
  }
}

async function containerLogs() {
  const containerList = await getContainerList();
  
  if (containerList.length === 0) {
    UI.error('No containers found.');
    return;
  }

  const containerResponse = await prompts({
    type: 'select',
    name: 'container',
    message: 'Select container:',
    choices: [
      ...containerList.map(c => ({ title: c, value: c })),
      { title: '✏️ Enter manually', value: 'manual' }
    ]
  });
  
  let containerName = containerResponse.container;
  
  if (containerName === 'manual') {
    const manualResponse = await prompts({
      type: 'text',
      name: 'container',
      message: 'Container name or ID:',
      validate: value => value.trim() ? true : 'Container name is required'
    });
    
    if (!manualResponse.container) return;
    containerName = manualResponse.container;
  }

  if (!containerName) return;

  const logResponse = await prompts({
    type: 'select',
    name: 'logType',
    message: 'Log Options:',
    choices: [
      { title: '📝 Tail logs', value: 'tail' },
      { title: '🔍 Follow logs (live)', value: 'follow' },
      { title: '📊 Show all logs', value: 'all' },
      { title: '⏱️ Last N lines', value: 'last' }
    ]
  });

  let command = `docker logs ${containerName}`;
  
  switch (logResponse.logType) {
    case 'tail':
      command += ' --tail 50';
      break;
    case 'follow':
      command += ' --follow';
      console.log('\n📝 Following logs - Press Ctrl+C to exit\n');
      break;
    case 'last':
      const linesResponse = await prompts({
        type: 'number',
        name: 'lines',
        message: 'Number of lines:',
        initial: 100,
        min: 1
      });
      
      if (linesResponse.lines) {
        command += ` --tail ${linesResponse.lines}`;
      }
      break;
  }

  const commandMap = {
    win32: command,
    linux: command,
    darwin: command,
    default: command
  };

  await runPlatformCommand(commandMap, `Logs for ${containerName}`);
}

async function inspectContainer() {
  const containerList = await getContainerList();
  
  if (containerList.length === 0) {
    UI.error('No containers found.');
    return;
  }

  const containerResponse = await prompts({
    type: 'select',
    name: 'container',
    message: 'Select container:',
    choices: [
      ...containerList.map(c => ({ title: c, value: c })),
      { title: '✏️ Enter manually', value: 'manual' }
    ]
  });
  
  let containerName = containerResponse.container;
  
  if (containerName === 'manual') {
    const manualResponse = await prompts({
      type: 'text',
      name: 'container',
      message: 'Container name or ID:',
      validate: value => value.trim() ? true : 'Container name is required'
    });
    
    if (!manualResponse.container) return;
    containerName = manualResponse.container;
  }

  if (!containerName) return;

  const commandMap = {
    win32: `docker inspect ${containerName}`,
    linux: `docker inspect ${containerName}`,
    darwin: `docker inspect ${containerName}`,
    default: `docker inspect ${containerName}`
  };

  await runPlatformCommand(commandMap, `Inspecting ${containerName}`);
}

async function buildImage() {
  const buildResponse = await prompts([
    {
      type: 'text',
      name: 'tag',
      message: 'Image name (tag):',
      validate: value => value.trim() ? true : 'Tag is required'
    },
    {
      type: 'text',
      name: 'path',
      message: 'Dockerfile path:',
      initial: '.'
    },
    {
      type: 'text',
      name: 'dockerfile',
      message: 'Dockerfile name (optional):',
      initial: 'Dockerfile'
    }
  ]);
  
  if (!buildResponse.tag) return;
  
  let command = `docker build -t ${buildResponse.tag} ${buildResponse.path || '.'}`;
  
  if (buildResponse.dockerfile && buildResponse.dockerfile !== 'Dockerfile') {
    command += ` -f ${buildResponse.dockerfile}`;
  }

  const commandMap = {
    win32: command,
    linux: command,
    darwin: command,
    default: command
  };

  await runPlatformCommand(commandMap, 'Building Docker Image');
}

async function startContainer() {
  const stoppedContainers = await getStoppedContainers();
  
  if (stoppedContainers.length === 0) {
    UI.error('No stopped containers found.');
    return;
  }

  const containerResponse = await prompts({
    type: 'select',
    name: 'container',
    message: 'Select container to start:',
    choices: [
      ...stoppedContainers.map(c => ({ title: c, value: c })),
      { title: '✏️ Enter manually', value: 'manual' }
    ]
  });
  
  let containerName = containerResponse.container;
  
  if (containerName === 'manual') {
    const manualResponse = await prompts({
      type: 'text',
      name: 'container',
      message: 'Container name or ID:',
      validate: value => value.trim() ? true : 'Container name is required'
    });
    
    if (!manualResponse.container) return;
    containerName = manualResponse.container;
  }

  if (!containerName) return;

  const commandMap = {
    win32: `docker start ${containerName}`,
    linux: `docker start ${containerName}`,
    darwin: `docker start ${containerName}`,
    default: `docker start ${containerName}`
  };

  await runPlatformCommand(commandMap, `Starting ${containerName}`);
}

async function pauseContainer() {
  const runningContainers = await getRunningContainers();
  
  if (runningContainers.length === 0) {
    UI.error('No running containers found.');
    return;
  }

  const containerResponse = await prompts({
    type: 'select',
    name: 'container',
    message: 'Select container to pause:',
    choices: [
      ...runningContainers.map(c => ({ title: c, value: c })),
      { title: '✏️ Enter manually', value: 'manual' }
    ]
  });
  
  let containerName = containerResponse.container;
  
  if (containerName === 'manual') {
    const manualResponse = await prompts({
      type: 'text',
      name: 'container',
      message: 'Container name or ID:',
      validate: value => value.trim() ? true : 'Container name is required'
    });
    
    if (!manualResponse.container) return;
    containerName = manualResponse.container;
  }

  if (!containerName) return;

  const commandMap = {
    win32: `docker pause ${containerName}`,
    linux: `docker pause ${containerName}`,
    darwin: `docker pause ${containerName}`,
    default: `docker pause ${containerName}`
  };

  await runPlatformCommand(commandMap, `Pausing ${containerName}`);
}

async function unpauseContainer() {
  // Get paused containers
  const pausedContainers = await getPausedContainers();
  
  if (pausedContainers.length === 0) {
    UI.error('No paused containers found.');
    return;
  }

  const containerResponse = await prompts({
    type: 'select',
    name: 'container',
    message: 'Select container to unpause:',
    choices: [
      ...pausedContainers.map(c => ({ title: c, value: c })),
      { title: '✏️ Enter manually', value: 'manual' }
    ]
  });
  
  let containerName = containerResponse.container;
  
  if (containerName === 'manual') {
    const manualResponse = await prompts({
      type: 'text',
      name: 'container',
      message: 'Container name or ID:',
      validate: value => value.trim() ? true : 'Container name is required'
    });
    
    if (!manualResponse.container) return;
    containerName = manualResponse.container;
  }

  if (!containerName) return;

  const commandMap = {
    win32: `docker unpause ${containerName}`,
    linux: `docker unpause ${containerName}`,
    darwin: `docker unpause ${containerName}`,
    default: `docker unpause ${containerName}`
  };

  await runPlatformCommand(commandMap, `Resuming ${containerName}`);
}

async function restartContainer() {
  const allContainers = await getContainerList();
  
  if (allContainers.length === 0) {
    UI.error('No containers found.');
    return;
  }

  const containerResponse = await prompts({
    type: 'select',
    name: 'container',
    message: 'Select container to restart:',
    choices: [
      ...allContainers.map(c => ({ title: c, value: c })),
      { title: '✏️ Enter manually', value: 'manual' }
    ]
  });
  
  let containerName = containerResponse.container;
  
  if (containerName === 'manual') {
    const manualResponse = await prompts({
      type: 'text',
      name: 'container',
      message: 'Container name or ID:',
      validate: value => value.trim() ? true : 'Container name is required'
    });
    
    if (!manualResponse.container) return;
    containerName = manualResponse.container;
  }

  if (!containerName) return;

  const commandMap = {
    win32: `docker restart ${containerName}`,
    linux: `docker restart ${containerName}`,
    darwin: `docker restart ${containerName}`,
    default: `docker restart ${containerName}`
  };

  await runPlatformCommand(commandMap, `Restarting ${containerName}`);
}

async function removeContainer() {
  const allContainers = await getContainerList();
  
  if (allContainers.length === 0) {
    UI.error('No containers found.');
    return;
  }

  const containerResponse = await prompts({
    type: 'select',
    name: 'container',
    message: 'Select container to remove:',
    choices: [
      ...allContainers.map(c => ({ title: c, value: c })),
      { title: '✏️ Enter manually', value: 'manual' }
    ]
  });
  
  let containerName = containerResponse.container;
  
  if (containerName === 'manual') {
    const manualResponse = await prompts({
      type: 'text',
      name: 'container',
      message: 'Container name or ID:',
      validate: value => value.trim() ? true : 'Container name is required'
    });
    
    if (!manualResponse.container) return;
    containerName = manualResponse.container;
  }

  if (!containerName) return;

  const forceResponse = await prompts({
    type: 'confirm',
    name: 'force',
    message: 'Force remove (stop if running)?',
    initial: true
  });

  const confirmResponse = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `Are you sure you want to remove ${containerName}?`,
    initial: false
  });
  
  if (!confirmResponse.confirm) return;

  const forceFlag = forceResponse.force ? '-f' : '';
  const commandMap = {
    win32: `docker rm ${forceFlag} ${containerName}`,
    linux: `docker rm ${forceFlag} ${containerName}`,
    darwin: `docker rm ${forceFlag} ${containerName}`,
    default: `docker rm ${forceFlag} ${containerName}`
  };

  await runPlatformCommand(commandMap, `Removing ${containerName}`);
}

async function dockerComposeMenu() {
  console.clear();
  console.log('\n⚙️ Docker Compose\n');

  const response = await prompts({
    type: 'select',
    name: 'composeAction',
    message: 'Docker Compose:',
    choices: [
      { title: '📜 View Configuration', value: 'config' },
      { title: '🚀 Start in Background', value: 'up -d' },
      { title: '🔄 Restart Services', value: 'restart' },
      { title: '⏸️ Pause Services', value: 'pause' },
      { title: '▶️ Resume Services', value: 'unpause' },
      { title: '📊 Service Logs', value: 'logs' },
      { title: '📈 Scale Services', value: 'scale' },
      { title: '📋 List Services', value: 'ps' },
      { title: '⬅️ Back', value: 'back' }
    ]
  });

  if (!response.composeAction || response.composeAction === 'back') return;

  if (response.composeAction === 'scale') {
    const scaleResponse = await prompts([
      {
        type: 'text',
        name: 'service',
        message: 'Service name:',
        validate: value => value.trim() ? true : 'Service name is required'
      },
      {
        type: 'number',
        name: 'replicas',
        message: 'Number of replicas:',
        initial: 2,
        min: 0
      }
    ]);
    
    if (scaleResponse.service && scaleResponse.replicas !== undefined) {
      const composeCommand = await getComposeCommand();
      const command = `${composeCommand} up -d --scale ${scaleResponse.service}=${scaleResponse.replicas}`;
      
      const commandMap = {
        win32: command,
        linux: command,
        darwin: command,
        default: command
      };

      await runPlatformCommand(commandMap, `Scaling ${scaleResponse.service}`);
    }
  } else {
    const composeCommand = await getComposeCommand();
    const command = `${composeCommand} ${response.composeAction}`;
    
    const commandMap = {
      win32: command,
      linux: command,
      darwin: command,
      default: command
    };

    await runPlatformCommand(commandMap, `Compose: ${response.composeAction}`);
  }
}

async function dockerSwarmMenu() {
  console.clear();
  console.log('\n🐋 Docker Swarm\n');

  const response = await prompts({
    type: 'select',
    name: 'swarmAction',
    message: 'Docker Swarm:',
    choices: [
      { title: '🚀 Initialize Swarm', value: 'init' },
      { title: '📋 Node List', value: 'node ls' },
      { title: '📦 Service List', value: 'service ls' },
      { title: '📊 Stack List', value: 'stack ls' },
      { title: '⚙️ Stack Deploy', value: 'stack deploy' },
      { title: '⬅️ Back', value: 'back' }
    ]
  });

  if (!response.swarmAction || response.swarmAction === 'back') return;

  const commandMap = {
    win32: `docker swarm ${response.swarmAction}`,
    linux: `docker swarm ${response.swarmAction}`,
    darwin: `docker swarm ${response.swarmAction}`,
    default: `docker swarm ${response.swarmAction}`
  };

  await runPlatformCommand(commandMap, `Swarm: ${response.swarmAction}`);
}

async function dockerVolumes() {
  const response = await prompts({
    type: 'select',
    name: 'volumeAction',
    message: 'Volume Actions:',
    choices: [
      { title: '📋 List Volumes', value: 'list' },
      { title: '🔍 Inspect Volume', value: 'inspect' },
      { title: '🗑️ Remove Volume', value: 'remove' },
      { title: '⬅️ Back', value: 'back' }
    ]
  });

  if (!response.volumeAction || response.volumeAction === 'back') return;

  const commandMap = {
    list: { default: 'docker volume ls' },
    inspect: { default: 'docker volume inspect' },
    remove: { default: 'docker volume rm' }
  };

  if (response.volumeAction === 'inspect' || response.volumeAction === 'remove') {
    const volumeResponse = await prompts({
      type: 'text',
      name: 'volume',
      message: 'Volume name:',
      validate: value => value.trim() ? true : 'Volume name is required'
    });
    
    if (volumeResponse.volume) {
      const command = `docker volume ${response.volumeAction} ${volumeResponse.volume}`;
      await runPlatformCommand({ default: command }, `Volume ${response.volumeAction}`);
    }
  } else {
    await runPlatformCommand(commandMap[response.volumeAction], 'Docker Volumes');
  }
}

async function dockerNetworks() {
  const response = await prompts({
    type: 'select',
    name: 'networkAction',
    message: 'Network Actions:',
    choices: [
      { title: '📋 List Networks', value: 'list' },
      { title: '🔍 Inspect Network', value: 'inspect' },
      { title: '🗑️ Remove Network', value: 'remove' },
      { title: '🌐 Create Network', value: 'create' },
      { title: '⬅️ Back', value: 'back' }
    ]
  });

  if (!response.networkAction || response.networkAction === 'back') return;

  const commandMap = {
    list: { default: 'docker network ls' },
    inspect: { default: 'docker network inspect' },
    remove: { default: 'docker network rm' },
    create: { default: 'docker network create' }
  };

  if (response.networkAction === 'inspect' || response.networkAction === 'remove' || response.networkAction === 'create') {
    const networkResponse = await prompts({
      type: 'text',
      name: 'network',
      message: response.networkAction === 'create' ? 'Network name:' : 'Network name/ID:',
      validate: value => value.trim() ? true : 'Network name is required'
    });
    
    if (networkResponse.network) {
      const command = `docker network ${response.networkAction} ${networkResponse.network}`;
      await runPlatformCommand({ default: command }, `Network ${response.networkAction}`);
    }
  } else {
    await runPlatformCommand(commandMap[response.networkAction], 'Docker Networks');
  }
}

async function getContainerList() {
  try {
    const { execa } = await import('execa');
    const { stdout } = await execa('docker', ['ps', '-a', '--format', '{{.Names}}']);
    return stdout.split('\n').filter(name => name.trim());
  } catch (error) {
    return [];
  }
}

async function getRunningContainers() {
  try {
    const { execa } = await import('execa');
    const { stdout } = await execa('docker', ['ps', '--format', '{{.Names}}']);
    return stdout.split('\n').filter(name => name.trim());
  } catch (error) {
    return [];
  }
}

async function getStoppedContainers() {
  try {
    const { execa } = await import('execa');
    const { stdout } = await execa('docker', ['ps', '-a', '--filter', 'status=exited', '--format', '{{.Names}}']);
    return stdout.split('\n').filter(name => name.trim());
  } catch (error) {
    return [];
  }
}

async function getPausedContainers() {
  try {
    const { execa } = await import('execa');
    const { stdout } = await execa('docker', ['ps', '-a', '--filter', 'status=paused', '--format', '{{.Names}}']);
    return stdout.split('\n').filter(name => name.trim());
  } catch (error) {
    return [];
  }
}

async function getComposeCommand() {
  try {
    const { execa } = await import('execa');
    await execa('docker', ['compose', '--version']);
    return 'docker compose';
  } catch (error) {
    try {
      const { execa } = await import('execa');
      await execa('docker-compose', ['--version']);
      return 'docker-compose';
    } catch (error) {
      return 'docker-compose';
    }
  }
}
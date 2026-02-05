import prompts from 'prompts';
import { runCommand } from '../commands/executor.js';
import { UI } from '../lib/ui.js';
import fs from 'fs';
import path from 'path';

export async function npmModule() {
  while (true) {
    UI.header('📦 NPM/Yarn Manager');

    const response = await prompts({
      type: 'select',
      name: 'action',
      message: 'Package manager:',
      choices: [
        { title: '📦 Install dependencies', value: 'install' },
        { title: '🔄 Update packages', value: 'update' },
        { title: '🗑️  Uninstall package', value: 'uninstall' },
        { title: '📋 List dependencies', value: 'list' },
        { title: '🔍 Audit for vulnerabilities', value: 'audit' },
        { title: '🏃‍♂️ Run script', value: 'run' },
        { title: '⚡ Manager (NPM/Yarn/PNPM)', value: 'manager' },
        { title: '🎯 Initialize a project', value: 'init' },
        { title: '', value: 'separator', disabled: true },
        { title: '⬅️ Back', value: 'back' }
      ],
      initial: 0
    });

    if (!response.action || response.action === 'back') break;
    await handleNpmAction(response.action);
  }
}

async function handleNpmAction(action) {
  switch (action) {
    case 'install':
      await installPackages();
      break;
    case 'run':
      await runNpmScript();
      break;
    case 'manager':
      await selectPackageManager();
      break;
    case 'init':
      await initProject();
      break;
    case 'uninstall':
      await uninstallPackage();
      break;
    default:
      await runCommand(`npm ${action}`, `NPM ${action}`);
  }
}

async function installPackages() {
  const response = await prompts([
    {
      type: 'text',
      name: 'packages',
      message: 'Packages to install (space-separated):',
      initial: ''
    },
    {
      type: 'toggle',
      name: 'dev',
      message: 'Development dependencies?',
      initial: false,
      active: 'Yes',
      inactive: 'No'
    }
  ]);

  if (response.packages === undefined) return; // Cancelled
  
  if (!response.packages.trim()) {
    await runCommand('npm install', 'Installing all dependencies');
    return;
  }

  const flag = response.dev ? '--save-dev' : '--save';
  await runCommand(`npm install ${response.packages} ${flag}`, `Installing ${response.packages}`);
}

async function runNpmScript() {
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    UI.error('No package.json found in this folder.');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const scripts = packageJson.scripts || {};
  
  if (Object.keys(scripts).length === 0) {
    UI.warning('No scripts found in package.json');
    return;
  }
  
  const choices = Object.keys(scripts).map(script => ({
    title: `${script} : ${scripts[script]}`,
    value: script,
    description: scripts[script]
  }));
  
  const response = await prompts({
    type: 'select',
    name: 'script',
    message: 'Script to run:',
    choices: choices
  });

  if (!response.script) return;
  
  await runCommand(`npm run ${response.script}`, `Running ${response.script}`);
}

async function selectPackageManager() {
  const managerResponse = await prompts({
    type: 'select',
    name: 'manager',
    message: 'Select the package manager:',
    choices: [
      { title: '📦 NPM', value: 'npm' },
      { title: '🐈 Yarn', value: 'yarn' },
      { title: '📌 PNPM', value: 'pnpm' }
    ]
  });

  if (!managerResponse.manager) return;
  
  const actionResponse = await prompts({
    type: 'select',
    name: 'action',
    message: `Action for ${managerResponse.manager}:`,
    choices: [
      { title: 'install', value: 'install' },
      { title: 'update', value: 'update' },
      { title: 'run', value: 'run' },
      { title: 'list', value: 'list' },
      { title: 'audit', value: 'audit' }
    ]
  });

  if (!actionResponse.action) return;
  
  await runCommand(`${managerResponse.manager} ${actionResponse.action}`, `${managerResponse.manager} ${actionResponse.action}`);
}

async function initProject() {
  const response = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-project'
    },
    {
      type: 'select',
      name: 'type',
      message: 'Project type:',
      choices: [
        { title: 'Node.js', value: 'node' },
        { title: 'React', value: 'react' },
        { title: 'Vue.js', value: 'vue' },
        { title: 'TypeScript', value: 'typescript' },
        { title: 'Vanilla', value: 'vanilla' }
      ]
    }
  ]);

  if (!response.projectName || !response.type) return;
  
  let command = `npm init -y`;
  if (response.type === 'react') command = `npx create-react-app ${response.projectName}`;
  else if (response.type === 'vue') command = `npm create vue@latest ${response.projectName}`;
  else if (response.type === 'typescript') command = `npx create-typescript-app ${response.projectName}`;
  
  await runCommand(command, `Creating ${response.type} project`);
}

async function uninstallPackage() {
  const response = await prompts([
    {
      type: 'text',
      name: 'packageName',
      message: 'Package to uninstall:'
    },
    {
      type: 'toggle',
      name: 'global',
      message: 'Global package?',
      initial: false,
      active: 'Yes',
      inactive: 'No'
    }
  ]);

  if (!response.packageName) return;
  
  const flag = response.global ? '-g' : '';
  await runCommand(`npm uninstall ${response.packageName} ${flag}`, `Uninstalling ${response.packageName}`);
}
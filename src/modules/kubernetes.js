import prompts from 'prompts';
import { runCommand } from '../commands/executor.js';
import { UI } from '../lib/ui.js';
import fs from 'fs';
import path from 'path';

export async function kubernetesModule() {
  while (true) {
    console.clear();
    UI.header('☸️  Kubernetes Manager');

    const response = await prompts({
      type: 'select',
      name: 'action',
      message: 'Gestion Kubernetes:',
      choices: [
        { title: '📊 Cluster Information', value: 'cluster' },
        { title: '📦 Namespace Management', value: 'namespace' },
        { title: '🚀 Deployment Management', value: 'deployment' },
        { title: '📡 Service & Ingress', value: 'service' },
        { title: '🗃️  ConfigMaps & Secrets', value: 'config' },
        { title: '💾 Persistent Volumes', value: 'storage' },
        { title: '👀 Pod Monitoring', value: 'pods' },
        { title: '⚡ Helm Charts', value: 'helm' },
        { title: '🔧 Advanced Operations', value: 'advanced' },
        { title: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', disabled: true },
        { title: '⚙️  Kubeconfig Management', value: 'config' },
        { title: '🔄 Apply Manifest', value: 'apply' },
        { title: '⬅️ Retour', value: 'back' }
      ]
    });

    if (!response.action || response.action === 'back') break;
    await handleKubernetesAction(response.action);
  }
}

async function handleKubernetesAction(action) {
  try {
    switch (action) {
      case 'cluster':
        await clusterInfo();
        break;
      case 'namespace':
        await namespaceManager();
        break;
      case 'deployment':
        await deploymentManager();
        break;
      case 'service':
        await serviceManager();
        break;
      case 'config':
        await configManager();
        break;
      case 'storage':
        await storageManager();
        break;
      case 'pods':
        await podManager();
        break;
      case 'helm':
        await helmManager();
        break;
      case 'advanced':
        await advancedOperations();
        break;
      case 'apply':
        await applyManifest();
        break;
    }
  } catch (error) {
    UI.error(`Kubernetes error: ${error.message}`);
  }
  
  await prompts({
    type: 'text',
    name: 'continue',
    message: 'Appuyez sur Entrée pour continuer...',
    initial: ''
  });
}

async function clusterInfo() {
  console.clear();
  console.log('\n📊 Cluster Information\n');

  const response = await prompts({
    type: 'select',
    name: 'infoType',
    message: 'Cluster Information:',
    choices: [
      { title: '🌐 Cluster Version', value: 'version' },
      { title: '📈 Cluster Health', value: 'health' },
      { title: '📋 All Resources', value: 'all' },
      { title: '🎯 Resource Usage', value: 'usage' },
      { title: '🔗 Nodes Status', value: 'nodes' },
      { title: '⚙️  API Resources', value: 'api' },
      { title: '⬅️ Retour', value: 'back' }
    ]
  });

  if (!response.infoType || response.infoType === 'back') return;

  switch (response.infoType) {
    case 'version':
      await runCommand('kubectl version --short', 'Kubernetes Version');
      break;
    case 'health':
      await runCommand('kubectl get componentstatuses', 'Cluster Components');
      break;
    case 'all':
      await runCommand('kubectl get all --all-namespaces', 'All Resources');
      break;
    case 'usage':
      await runCommand('kubectl top nodes', 'Node Resource Usage');
      await runCommand('kubectl top pods --all-namespaces', 'Pod Resource Usage');
      break;
    case 'nodes':
      await runCommand('kubectl get nodes -o wide', 'Nodes Information');
      break;
    case 'api':
      await runCommand('kubectl api-resources', 'API Resources');
      break;
  }
}

async function namespaceManager() {
  console.clear();
  console.log('\n📦 Namespace Management\n');

  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'Namespace Operations:',
    choices: [
      { title: '📋 List Namespaces', value: 'list' },
      { title: '➕ Create Namespace', value: 'create' },
      { title: '🗑️  Delete Namespace', value: 'delete' },
      { title: '🎯 Switch Context', value: 'switch' },
      { title: '📊 Resources by Namespace', value: 'resources' },
      { title: '⬅️ Retour', value: 'back' }
    ]
  });

  if (!response.action || response.action === 'back') return;

  switch (response.action) {
    case 'list':
      await runCommand('kubectl get namespaces', 'List Namespaces');
      break;
    case 'create':
      const createResponse = await prompts({
        type: 'text',
        name: 'name',
        message: 'Namespace name:',
        validate: value => value.trim() ? true : 'Name is required'
      });
      if (createResponse.name) {
        await runCommand(`kubectl create namespace ${createResponse.name}`, `Create namespace ${createResponse.name}`);
      }
      break;
    case 'delete':
      const deleteResponse = await prompts({
        type: 'text',
        name: 'name',
        message: 'Namespace to delete:',
        validate: value => value.trim() ? true : 'Name is required'
      });
      if (deleteResponse.name) {
        const confirm = await UI.confirm(`Are you sure you want to delete namespace "${deleteResponse.name}"?`);
        if (confirm) {
          await runCommand(`kubectl delete namespace ${deleteResponse.name}`, `Delete namespace ${deleteResponse.name}`);
        }
      }
      break;
    case 'switch':
      const namespaces = await getNamespaces();
      if (namespaces.length === 0) {
        UI.warning('No namespaces found');
        return;
      }
      
      const switchResponse = await prompts({
        type: 'select',
        name: 'namespace',
        message: 'Select namespace:',
        choices: namespaces.map(ns => ({ title: ns, value: ns }))
      });
      
      if (switchResponse.namespace) {
        await runCommand(`kubectl config set-context --current --namespace=${switchResponse.namespace}`, 
          `Switch to namespace ${switchResponse.namespace}`);
      }
      break;
    case 'resources':
      const nsResponse = await prompts({
        type: 'text',
        name: 'namespace',
        message: 'Namespace (empty for all):',
        initial: 'default'
      });
      
      const nsFlag = nsResponse.namespace ? `-n ${nsResponse.namespace}` : '--all-namespaces';
      await runCommand(`kubectl get all ${nsFlag}`, `Resources ${nsResponse.namespace ? `in ${nsResponse.namespace}` : 'in all namespaces'}`);
      break;
  }
}

async function deploymentManager() {
  console.clear();
  console.log('\n🚀 Deployment Management\n');

  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'Deployment Operations:',
    choices: [
      { title: '📋 List Deployments', value: 'list' },
      { title: '➕ Create Deployment', value: 'create' },
      { title: '🔄 Update Deployment', value: 'update' },
      { title: '📊 Scale Deployment', value: 'scale' },
      { title: '🔍 Describe Deployment', value: 'describe' },
      { title: '📜 Deployment Logs', value: 'logs' },
      { title: '♻️  Restart Deployment', value: 'restart' },
      { title: '⬅️ Retour', value: 'back' }
    ]
  });

  if (!response.action || response.action === 'back') return;

  const namespace = await getCurrentNamespace();

  switch (response.action) {
    case 'list':
      await runCommand(`kubectl get deployments --all-namespaces`, 'List Deployments');
      break;
    case 'create':
      await createDeploymentWizard();
      break;
    case 'scale':
      await scaleDeployment(namespace);
      break;
    case 'logs':
      await viewDeploymentLogs(namespace);
      break;
    case 'describe':
      await describeDeployment(namespace);
      break;
    case 'restart':
      await restartDeployment(namespace);
      break;
    case 'update':
      await updateDeployment(namespace);
      break;
  }
}

async function createDeploymentWizard() {
  console.clear();
  console.log('\n➕ Create Deployment Wizard\n');

  const answers = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Deployment name:',
      validate: value => value.trim() ? true : 'Name is required'
    },
    {
      type: 'text',
      name: 'namespace',
      message: 'Namespace:',
      initial: 'default'
    },
    {
      type: 'text',
      name: 'image',
      message: 'Docker image:',
      initial: 'nginx:latest'
    },
    {
      type: 'number',
      name: 'replicas',
      message: 'Number of replicas:',
      initial: 2,
      min: 1
    },
    {
      type: 'number',
      name: 'port',
      message: 'Container port:',
      initial: 80
    },
    {
      type: 'confirm',
      name: 'createService',
      message: 'Create a Service?',
      initial: true
    }
  ]);

  if (!answers.name || !answers.image) return;

  const deploymentYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${answers.name}
  namespace: ${answers.namespace}
spec:
  replicas: ${answers.replicas}
  selector:
    matchLabels:
      app: ${answers.name}
  template:
    metadata:
      labels:
        app: ${answers.name}
    spec:
      containers:
      - name: ${answers.name}
        image: ${answers.image}
        ports:
        - containerPort: ${answers.port}`;

  const serviceYaml = answers.createService ? `---
apiVersion: v1
kind: Service
metadata:
  name: ${answers.name}-service
  namespace: ${answers.namespace}
spec:
  selector:
    app: ${answers.name}
  ports:
  - port: 80
    targetPort: ${answers.port}
  type: ClusterIP` : '';

  const manifest = deploymentYaml + (serviceYaml ? '\n' + serviceYaml : '');
  
  const tempFile = path.join(process.cwd(), 'temp-deployment.yaml');
  fs.writeFileSync(tempFile, manifest, 'utf8');

  console.log('\n📝 Generated Manifest:');
  console.log('='.repeat(50));
  console.log(manifest);
  console.log('='.repeat(50));

  const confirm = await UI.confirm('Apply this manifest?');
  if (confirm) {
    await runCommand(`kubectl apply -f ${tempFile}`, 'Create Deployment');
    fs.unlinkSync(tempFile);
  } else {
    fs.unlinkSync(tempFile);
    UI.info('Creation cancelled');
  }
}

async function scaleDeployment(namespace) {
  const deployments = await getDeployments(namespace);
  if (deployments.length === 0) {
    UI.warning('No deployments found');
    return;
  }

  const depResponse = await prompts({
    type: 'select',
    name: 'deployment',
    message: 'Select deployment:',
    choices: deployments.map(dep => ({ title: dep, value: dep }))
  });

  if (!depResponse.deployment) return;

  const scaleResponse = await prompts({
    type: 'number',
    name: 'replicas',
    message: `Number of replicas for ${depResponse.deployment}:`,
    initial: 2,
    min: 0
  });

  if (scaleResponse.replicas !== undefined) {
    await runCommand(
      `kubectl scale deployment ${depResponse.deployment} --replicas=${scaleResponse.replicas} -n ${namespace}`,
      `Scale deployment to ${scaleResponse.replicas} replicas`
    );
  }
}

async function serviceManager() {
  console.clear();
  console.log('\n📡 Service & Ingress Management\n');

  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'Service Operations:',
    choices: [
      { title: '📋 List Services', value: 'list' },
      { title: '➕ Create Service', value: 'create' },
      { title: '🌐 Create Ingress', value: 'ingress' },
      { title: '🔍 Service Details', value: 'describe' },
      { title: '🔗 Port Forwarding', value: 'port-forward' },
      { title: '⬅️ Retour', value: 'back' }
    ]
  });

  if (!response.action || response.action === 'back') return;

  const namespace = await getCurrentNamespace();

  switch (response.action) {
    case 'list':
      await runCommand(`kubectl get services --all-namespaces`, 'List Services');
      break;
    case 'create':
      await createServiceWizard(namespace);
      break;
    case 'ingress':
      await createIngressWizard(namespace);
      break;
    case 'describe':
      const services = await getServices(namespace);
      if (services.length === 0) {
        UI.warning('No services found');
        return;
      }
      
      const serviceResponse = await prompts({
        type: 'select',
        name: 'service',
        message: 'Select service:',
        choices: services.map(svc => ({ title: svc, value: svc }))
      });
      
      if (serviceResponse.service) {
        await runCommand(
          `kubectl describe service ${serviceResponse.service} -n ${namespace}`,
          `Describe service ${serviceResponse.service}`
        );
      }
      break;
    case 'port-forward':
      await portForwardService(namespace);
      break;
  }
}

async function createServiceWizard(namespace) {
  console.clear();
  console.log('\n➕ Create Service Wizard\n');

  const answers = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Service name:',
      validate: value => value.trim() ? true : 'Name is required'
    },
    {
      type: 'select',
      name: 'type',
      message: 'Service type:',
      choices: [
        { title: 'ClusterIP (internal)', value: 'ClusterIP' },
        { title: 'NodePort (external access)', value: 'NodePort' },
        { title: 'LoadBalancer (cloud LB)', value: 'LoadBalancer' },
        { title: 'ExternalName (DNS proxy)', value: 'ExternalName' }
      ]
    },
    {
      type: 'text',
      name: 'selector',
      message: 'Selector (app label):',
      initial: 'my-app'
    },
    {
      type: 'number',
      name: 'port',
      message: 'Service port:',
      initial: 80
    },
    {
      type: 'number',
      name: 'targetPort',
      message: 'Target port:',
      initial: 80
    }
  ]);

  if (!answers.name || !answers.type) return;

  const serviceYaml = `apiVersion: v1
kind: Service
metadata:
  name: ${answers.name}
  namespace: ${namespace}
spec:
  type: ${answers.type}
  selector:
    app: ${answers.selector}
  ports:
  - port: ${answers.port}
    targetPort: ${answers.targetPort}`;

  const tempFile = path.join(process.cwd(), 'temp-service.yaml');
  fs.writeFileSync(tempFile, serviceYaml, 'utf8');

  console.log('\n📝 Generated Service:');
  console.log('='.repeat(50));
  console.log(serviceYaml);
  console.log('='.repeat(50));

  const confirm = await UI.confirm('Apply this service?');
  if (confirm) {
    await runCommand(`kubectl apply -f ${tempFile}`, 'Create Service');
    fs.unlinkSync(tempFile);
  } else {
    fs.unlinkSync(tempFile);
    UI.info('Creation cancelled');
  }
}

async function podManager() {
  console.clear();
  console.log('\n👀 Pod Monitoring\n');

  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'Pod Operations:',
    choices: [
      { title: '📋 List Pods', value: 'list' },
      { title: '🔍 Describe Pod', value: 'describe' },
      { title: '📜 Pod Logs', value: 'logs' },
      { title: '⚡ Exec into Pod', value: 'exec' },
      { title: '📊 Resource Usage', value: 'resources' },
      { title: '🚨 Debug Pod', value: 'debug' },
      { title: '⬅️ Retour', value: 'back' }
    ]
  });

  if (!response.action || response.action === 'back') return;

  const namespace = await getCurrentNamespace();

  switch (response.action) {
    case 'list':
      await runCommand(`kubectl get pods --all-namespaces -o wide`, 'List Pods');
      break;
    case 'describe':
      await describePod(namespace);
      break;
    case 'logs':
      await viewPodLogs(namespace);
      break;
    case 'exec':
      await execIntoPod(namespace);
      break;
    case 'resources':
      await runCommand(`kubectl top pods -n ${namespace}`, 'Pod Resource Usage');
      break;
    case 'debug':
      await debugPod(namespace);
      break;
  }
}

async function viewPodLogs(namespace) {
  const pods = await getPods(namespace);
  if (pods.length === 0) {
    UI.warning('No pods found');
    return;
  }

  const podResponse = await prompts({
    type: 'select',
    name: 'pod',
    message: 'Select pod:',
    choices: pods.map(pod => ({ title: pod, value: pod }))
  });

  if (!podResponse.pod) return;

  const logResponse = await prompts({
    type: 'select',
    name: 'logType',
    message: 'Log options:',
    choices: [
      { title: '📜 View logs', value: 'view' },
      { title: '📜 Follow logs (tail -f)', value: 'follow' },
      { title: '📜 Previous container logs', value: 'previous' }
    ]
  });

  let command = `kubectl logs ${podResponse.pod} -n ${namespace}`;
  
  if (logResponse.logType === 'follow') {
    command += ' -f';
  } else if (logResponse.logType === 'previous') {
    command += ' --previous';
  }

  await runCommand(command, `Pod logs for ${podResponse.pod}`);
}

async function helmManager() {
  console.clear();
  console.log('\n⚡ Helm Charts Manager\n');

  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'Helm Operations:',
    choices: [
      { title: '📋 List Releases', value: 'list' },
      { title: '🔍 Search Charts', value: 'search' },
      { title: '📥 Install Chart', value: 'install' },
      { title: '⬅️ Retour', value: 'back' }
    ]
  });

  if (!response.action || response.action === 'back') return;

  switch (response.action) {
    case 'list':
      await runCommand('helm list --all-namespaces', 'List Helm Releases');
      break;
    case 'search':
      await searchHelmCharts();
      break;
    case 'install':
      await installHelmChart();
      break;
  }
}

async function searchHelmCharts() {
  const searchResponse = await prompts({
    type: 'text',
    name: 'query',
    message: 'Search term:',
    initial: ''
  });

  if (!searchResponse.query) return;

  console.log('\n🔍 Searching charts...');
  await runCommand(`helm search hub ${searchResponse.query}`, `Search for ${searchResponse.query}`);
  await runCommand(`helm search repo ${searchResponse.query}`, `Search in local repos`);
}

async function installHelmChart() {
  const answers = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Release name:',
      validate: value => value.trim() ? true : 'Name is required'
    },
    {
      type: 'text',
      name: 'chart',
      message: 'Chart name (e.g., stable/nginx):',
      validate: value => value.trim() ? true : 'Chart is required'
    },
    {
      type: 'text',
      name: 'namespace',
      message: 'Namespace:',
      initial: 'default'
    },
    {
      type: 'confirm',
      name: 'setValues',
      message: 'Set custom values?',
      initial: false
    }
  ]);

  if (!answers.name || !answers.chart) return;

  let command = `helm install ${answers.name} ${answers.chart} --namespace ${answers.namespace}`;
  
  if (answers.setValues) {
    const valuesResponse = await prompts({
      type: 'text',
      name: 'values',
      message: 'Value overrides (e.g., --set replicaCount=3):',
      initial: '--set replicaCount=2'
    });
    
    if (valuesResponse.values) {
      command += ` ${valuesResponse.values}`;
    }
  }

  await runCommand(command, `Install Helm chart ${answers.chart}`);
}

async function advancedOperations() {
  console.clear();
  console.log('\n🔧 Advanced Operations\n');

  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'Advanced Operations:',
    choices: [
      { title: '🔧 Custom Kubectl Command', value: 'custom' },
      { title: '⬅️ Retour', value: 'back' }
    ]
  });

  if (!response.action || response.action === 'back') return;

  switch (response.action) {
    case 'custom':
      await customKubectlCommand();
      break;
  }
}

async function customKubectlCommand() {
  const response = await prompts({
    type: 'text',
    name: 'command',
    message: 'Custom kubectl command:',
    initial: 'kubectl '
  });

  if (response.command && response.command.trim()) {
    await runCommand(response.command, 'Custom kubectl command');
  }
}

async function applyManifest() {
  const response = await prompts({
    type: 'select',
    name: 'source',
    message: 'Manifest source:',
    choices: [
      { title: '📄 File', value: 'file' },
      { title: '📝 URL', value: 'url' },
      { title: '📋 Clipboard', value: 'clipboard' },
      { title: '📁 Directory', value: 'dir' }
    ]
  });

  if (!response.source) return;

  let command = 'kubectl apply ';
  
  switch (response.source) {
    case 'file':
      const fileResponse = await prompts({
        type: 'text',
        name: 'file',
        message: 'Manifest file path:',
        initial: './deployment.yaml'
      });
      
      if (fileResponse.file) {
        command += `-f ${fileResponse.file}`;
      }
      break;
    case 'url':
      const urlResponse = await prompts({
        type: 'text',
        name: 'url',
        message: 'Manifest URL:',
        initial: 'https://example.com/manifest.yaml'
      });
      
      if (urlResponse.url) {
        command += `-f ${urlResponse.url}`;
      }
      break;
    case 'dir':
      const dirResponse = await prompts({
        type: 'text',
        name: 'directory',
        message: 'Directory path:',
        initial: './k8s'
      });
      
      if (dirResponse.directory) {
        command += `-k ${dirResponse.directory}`;
      }
      break;
    case 'clipboard':
      UI.info('Paste your YAML manifest (Ctrl+D to finish):');
      const lines = [];
      process.stdin.resume();
      process.stdin.on('data', data => lines.push(data.toString()));
      await new Promise(resolve => process.stdin.on('end', resolve));
      process.stdin.pause();
      
      const manifest = lines.join('');
      const tempFile = path.join(process.cwd(), 'temp-manifest.yaml');
      fs.writeFileSync(tempFile, manifest, 'utf8');
      command += `-f ${tempFile}`;
      break;
  }

  if (command !== 'kubectl apply ') {
    await runCommand(command, 'Apply Manifest');
  }
}

async function getNamespaces() {
  try {
    const { execa } = await import('execa');
    const { stdout } = await execa('kubectl', ['get', 'namespaces', '--no-headers', '-o', 'custom-columns=:metadata.name']);
    return stdout.trim().split('\n').filter(n => n);
  } catch (error) {
    return [];
  }
}

async function getCurrentNamespace() {
  try {
    const { execa } = await import('execa');
    const { stdout } = await execa('kubectl', ['config', 'view', '--minify', '--output', 'jsonpath={..namespace}']);
    return stdout || 'default';
  } catch (error) {
    return 'default';
  }
}

async function getDeployments(namespace) {
  try {
    const { execa } = await import('execa');
    const { stdout } = await execa('kubectl', ['get', 'deployments', '-n', namespace, '--no-headers', '-o', 'custom-columns=:metadata.name']);
    return stdout.trim().split('\n').filter(d => d);
  } catch (error) {
    return [];
  }
}

async function getServices(namespace) {
  try {
    const { execa } = await import('execa');
    const { stdout } = await execa('kubectl', ['get', 'services', '-n', namespace, '--no-headers', '-o', 'custom-columns=:metadata.name']);
    return stdout.trim().split('\n').filter(s => s);
  } catch (error) {
    return [];
  }
}

async function getPods(namespace) {
  try {
    const { execa } = await import('execa');
    const { stdout } = await execa('kubectl', ['get', 'pods', '-n', namespace, '--no-headers', '-o', 'custom-columns=:metadata.name']);
    return stdout.trim().split('\n').filter(p => p);
  } catch (error) {
    return [];
  }
}

async function describePod(namespace) {
  const pods = await getPods(namespace);
  if (pods.length === 0) {
    UI.warning('No pods found');
    return;
  }

  const podResponse = await prompts({
    type: 'select',
    name: 'pod',
    message: 'Select pod:',
    choices: pods.map(pod => ({ title: pod, value: pod }))
  });

  if (podResponse.pod) {
    await runCommand(
      `kubectl describe pod ${podResponse.pod} -n ${namespace}`,
      `Describe pod ${podResponse.pod}`
    );
  }
}

async function execIntoPod(namespace) {
  const pods = await getPods(namespace);
  if (pods.length === 0) {
    UI.warning('No pods found');
    return;
  }

  const podResponse = await prompts({
    type: 'select',
    name: 'pod',
    message: 'Select pod:',
    choices: pods.map(pod => ({ title: pod, value: pod }))
  });

  if (!podResponse.pod) return;

  const containerResponse = await prompts({
    type: 'text',
    name: 'container',
    message: 'Container name (optional):',
    initial: ''
  });

  const shellResponse = await prompts({
    type: 'select',
    name: 'shell',
    message: 'Shell to use:',
    choices: [
      { title: 'bash', value: 'bash' },
      { title: 'sh', value: 'sh' },
      { title: '/bin/bash', value: '/bin/bash' },
      { title: '/bin/sh', value: '/bin/sh' }
    ]
  });

  let command = `kubectl exec -it ${podResponse.pod} -n ${namespace}`;
  if (containerResponse.container) {
    command += ` -c ${containerResponse.container}`;
  }
  command += ` -- ${shellResponse.shell}`;

  console.log(`\n🔍 Executing into pod ${podResponse.pod}...\n`);
  await runCommand(command, `Exec into pod ${podResponse.pod}`);
}

// Additional functions needed (stubs - implement as needed)
async function createIngressWizard(namespace) {
  UI.info('Ingress wizard - To be implemented');
}

async function configManager() {
  UI.info('ConfigMaps & Secrets manager - To be implemented');
}

async function storageManager() {
  UI.info('Persistent Volumes manager - To be implemented');
}

async function restartDeployment(namespace) {
  const deployments = await getDeployments(namespace);
  if (deployments.length === 0) {
    UI.warning('No deployments found');
    return;
  }

  const depResponse = await prompts({
    type: 'select',
    name: 'deployment',
    message: 'Select deployment to restart:',
    choices: deployments.map(dep => ({ title: dep, value: dep }))
  });

  if (depResponse.deployment) {
    await runCommand(
      `kubectl rollout restart deployment/${depResponse.deployment} -n ${namespace}`,
      `Restart deployment ${depResponse.deployment}`
    );
  }
}

async function updateDeployment(namespace) {
  const deployments = await getDeployments(namespace);
  if (deployments.length === 0) {
    UI.warning('No deployments found');
    return;
  }

  const depResponse = await prompts({
    type: 'select',
    name: 'deployment',
    message: 'Select deployment to update:',
    choices: deployments.map(dep => ({ title: dep, value: dep }))
  });

  if (!depResponse.deployment) return;

  const updateResponse = await prompts({
    type: 'text',
    name: 'image',
    message: 'New image:',
    validate: value => value.trim() ? true : 'Image is required'
  });

  if (updateResponse.image) {
    await runCommand(
      `kubectl set image deployment/${depResponse.deployment} *=${updateResponse.image} -n ${namespace}`,
      `Update deployment image`
    );
  }
}

async function portForwardService(namespace) {
  const services = await getServices(namespace);
  if (services.length === 0) {
    UI.warning('No services found');
    return;
  }

  const serviceResponse = await prompts({
    type: 'select',
    name: 'service',
    message: 'Select service:',
    choices: services.map(svc => ({ title: svc, value: svc }))
  });

  if (!serviceResponse.service) return;

  const portResponse = await prompts([
    {
      type: 'number',
      name: 'localPort',
      message: 'Local port:',
      initial: 8080,
      min: 1,
      max: 65535
    },
    {
      type: 'number',
      name: 'servicePort',
      message: 'Service port:',
      initial: 80,
      min: 1,
      max: 65535
    }
  ]);

  if (portResponse.localPort && portResponse.servicePort) {
    console.log(`\n🔗 Port forwarding ${serviceResponse.service}:${portResponse.servicePort} -> localhost:${portResponse.localPort}`);
    console.log('Press Ctrl+C to stop\n');
    
    await runCommand(
      `kubectl port-forward service/${serviceResponse.service} ${portResponse.localPort}:${portResponse.servicePort} -n ${namespace}`,
      'Port forwarding'
    );
  }
}

async function debugPod(namespace) {
  const pods = await getPods(namespace);
  if (pods.length === 0) {
    UI.warning('No pods found');
    return;
  }

  const podResponse = await prompts({
    type: 'select',
    name: 'pod',
    message: 'Select pod to debug:',
    choices: pods.map(pod => ({ title: pod, value: pod }))
  });

  if (!podResponse.pod) return;

  const debugResponse = await prompts({
    type: 'select',
    name: 'action',
    message: 'Debug action:',
    choices: [
      { title: '🔍 Describe events', value: 'events' },
      { title: '📜 All logs', value: 'all-logs' },
      { title: '🔄 Debug container', value: 'debug-container' },
      { title: '📊 Resource limits', value: 'resources' }
    ]
  });

  switch (debugResponse.action) {
    case 'events':
      await runCommand(`kubectl describe pod ${podResponse.pod} -n ${namespace} | grep -A 10 Events`, 'Pod events');
      break;
    case 'all-logs':
      await runCommand(`kubectl logs ${podResponse.pod} -n ${namespace} --all-containers`, 'All container logs');
      break;
    case 'debug-container':
      await runCommand(`kubectl debug -it ${podResponse.pod} -n ${namespace} --image=busybox --target=${podResponse.pod}`, 'Debug container');
      break;
    case 'resources':
      await runCommand(`kubectl describe pod ${podResponse.pod} -n ${namespace} | grep -A 5 "Limits\|Requests"`, 'Resource limits');
      break;
  }
}

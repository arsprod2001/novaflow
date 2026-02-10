<h1 align="center"
    style="
      font-size: 3.8rem;
      font-weight: 900;
      letter-spacing: 0.6px;
      margin-bottom: -10px;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
  <span style="color:#6C63FF;">Nova</span><span style="color:#00D4FF;">flow</span>
</h1>

<p align="center" style="margin-top: 0;">
  <strong>
    The modern CLI that centralizes your development workflow
  </strong>
</p>

<p align="center">
  <img src="src/assets/logo.png" alt="Novaflow Logo" width="220">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" />
  <img src="https://img.shields.io/badge/platform-linux%20%7C%20macos%20%7C%20windows-lightgrey.svg" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/arsprod2001/novaflow" />
  <img src="https://img.shields.io/github/issues/arsprod2001/novaflow" />
</p>

<p align="center">
  🌍 <a href="README.md">English</a> · 🇫🇷 <a href="README.fr.md">Français</a>
</p>

<p align="center">
  NovaFlow is a <strong>cross-platform, interactive CLI</strong> built for developers  
  who want to <strong>manage Docker, Git, databases, and system environments</strong>  
  from a <strong>single, fast, and intuitive tool</strong>.
</p>

<p align="center">
  <em>
    Fewer commands to remember.  
    Fewer tools to juggle.  
    More time to build.
  </em>
</p>

<p align="center">
  <img src="src/assets/demo.gif" alt="Novaflow CLI Demo" width="760">
</p>

<hr />


---

## Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Custom Commands](#-custom-commands)
- [Development](#️-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)
- [Support](#-support)
- [Star History](#-star-history)


---

## ✨ Features

### 🎯 **Main Modules**

- 🐳 **Docker Manager** - Complete management of containers, images and Docker Compose
- ☸️ **Kubernetes Manager** - Cluster information, namespace management, deployment management, services and ingress, ConfigMaps & Secrets, persistent volumes, pod monitoring, Helm charts, kubeconfig management
- 📦 **Git Manager** - Commit changes, push to remote repository, pull from remote repository, branch management, quick actions, visualization
- 📦 **NPM/Yarn/PNPM** - Multi-package manager support
- 💾 **Database Manager** - MySQL/MariaDB support, PostgreSQL, MongoDB, Redis, SQLite, Docker databases
- 🌐 **Network Tools** - Connection testing, network information, port analysis, network statistics, SSL verification, network tools, DNS scanning, firewall
- 📊 **System Monitoring** - Real-time dashboard, CPU/RAM/Disk metrics, real-time logs
- ⚙️ **System Tools** - System information, cleanup, real-time monitoring, process management, file explorer, system utilities
- 🔧 **Custom Commands** - Create and manage your own commands


### 🎨 **Interface & Customization**

- ✅ Colorful and modern interactive interface
- ✅ Intuitive navigation with keyboard arrows
- ✅ Multi-selection support
- ✅ Quick mode for frequent actions

### 🔒 **Robustness & Quality**

- ✅ Advanced error handling
- ✅ Multi-level logging (DEBUG, INFO, WARN, ERROR)
- ✅ User input validation
- ✅ Compatible with Linux, macOS, Windows

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 14.0.0
- **npm** or **yarn** or **pnpm**

### Quick Installation

```bash
# Clone the repository
git clone https://github.com/arsprod2001/novaflow.git

# Navigate to the folder
cd novaflow

# Install dependencies
npm install

# Make executable (Unix/Linux/Mac)
chmod +x index.js

# Create global link (optional)
npm link
```

### Installation Verification

```bash
# Display version
novaflow --version

# Display help
novaflow --help

# Launch the application
novaflow
```

---

## 📖 Usage

### Getting Started

```bash
# Interactive mode
novaflow

# or with Node.js
node index.js
```

### Navigation

| Key      | Action                                |
| -------- | ------------------------------------- |
| `↑` `↓`  | Navigate through menus                |
| `Enter`  | Select an option                      |
| `Space`  | Multiple selection (if applicable)    |
| `Ctrl+C` | Back/Cancel/Quit                      |
| `Tab`    | Auto-completion (specific contexts)   |

---

## 🔧 Custom Commands

### Create a Command

```bash
# Via the interface
novaflow → 🔧 Custom commands → ➕ Add a command

# Examples:
Name:         deploy
Command:      npm run build && npm run deploy
Description:  Production deployment

Name:         backup-db
Command:      docker exec mysql mysqldump -u root -p mydb > backup.sql
Description:  Database backup
```

### JSON Format

Commands are saved in `custom-commands.json`:

```json
{
  "deploy": {
    "command": "npm run build && npm run deploy",
    "description": "Production deployment"
  },
  "backup-db": {
    "command": "docker exec mysql mysqldump -u root -p mydb > backup.sql",
    "description": "Database backup"
  },
  "clean-all": {
    "command": "docker system prune -f && npm cache clean --force",
    "description": "Complete system cleanup"
  }
}
```

### Execute a Command

```bash
# Via the interface
novaflow → 🔧 Custom commands → ▶️  Execute a command

# Select the command to execute
```

---

## 🛠️ Development

### Project Structure

```
novaflow/
├── index.js                    # Entry point
├── package.json
├── README.md
├── LICENSE
├── .gitignore
├── src/
│   ├── commands/              # Command system
│   │   ├── custom.js
│   │   ├── executor.js
│   │   └── run.js
│   ├── lib/                   # Libraries
│   │   ├── ui.js
│   │   ├── logger.js
│   │   └── animator.js
│   ├── modules/               # Functional modules
│   │   ├── main.js
│   │   ├── docker.js
│   │   ├── git.js
│   │   ├── npm.js
│   │   ├── database.js
│   │   ├── network.js
│   │   ├── monitoring.js
│   │   ├── kubernetes
│   │   └── system.js
│   └── utils/                 # Utilities
│       ├── helpers.js
│       ├── os-detector.js
│       └── validators.js
└── custom-commands.json       # Custom commands
```

### Add a Module

1. **Create the file** in `src/modules/my-module.js`:

```javascript
import prompts from "prompts";
import { runPlatformCommand } from "../commands/executor.js";
import { UI } from "../lib/ui.js";

export async function myModule() {
  while (true) {
    UI.header("🎯 My Module");

    const response = await prompts({
      type: "select",
      name: "action",
      message: "Actions:",
      choices: [
        { title: "📋 Action 1", value: "action1" },
        { title: "⬅️ Back", value: "back" },
      ],
    });

    if (!response.action || response.action === "back") break;
    await handleAction(response.action);
  }
}

async function handleAction(action) {
  switch (action) {
    case "action1":
      await runPlatformCommand({
        win32: 'command',
        linux: 'command',
        darwin: 'command'
      }, "Description");
      break;
  }
}
```

2. **Integrate into the main menu** in `src/modules/main.js`:

```javascript
import { myModule } from './my-module.js';

// Add to choices:
{ title: '🎯 My Module', value: 'my-module' }

// Add to switch:
case 'my-module':
  await myModule();
  break;
```

### NPM Scripts

```json
{
   "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "build": "echo 'Build completed'",
    "test": "jest",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  },
}
```

### Dependencies

```json
{
  "dependencies": {
    "boxen": "^8.0.1",
    "chalk": "^5.6.2",
    "chalk-animation": "^2.0.3",
    "cli-table3": "^0.6.5",
    "commander": "^14.0.3",
    "date-fns": "^4.1.0",
    "execa": "^9.6.1",
    "figlet": "^1.10.0",
    "gradient-string": "^3.0.0",
    "nanospinner": "^1.2.2",
    "ora": "^9.1.0",
    "prompts": "^2.4.2"
  },
  "devDependencies": {
    "eslint": "^9.39.2",
    "nodemon": "^3.1.11",
    "prettier": "^3.8.1"
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

### Contribution Process

1. **Fork** the project
2. **Create** a branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Guidelines

#### Commits

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Refactoring
- `test:` - Tests
- `chore:` - Maintenance

Examples:

```bash
git commit -m "feat: add PostgreSQL support"
git commit -m "fix: resolve Docker connection issue"
git commit -m "docs: update installation instructions"
```



#### Documentation

- Document new features
- Update README if necessary
- Add usage examples

### Report a Bug

Create an issue with:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment (OS, Node version)

### Propose a Feature

Create an issue with:

- Feature description
- Use cases
- Mockups/examples if applicable
- Expected benefits

---

## 📄 License

This project is licensed under the **MIT** license.
See the [LICENSE](LICENSE) file for more details.

---

## 🙏 Acknowledgments

Thanks to all contributors and the open-source community for:

- [Node.js](https://nodejs.org/)
- [Chalk](https://github.com/chalk/chalk)
- [Prompts](https://github.com/terkelg/prompts)
- [Execa](https://github.com/sindresorhus/execa)
- [Boxen](https://github.com/sindresorhus/boxen)
- [Commander.js](https://github.com/tj/commander.js)
- All other packages used

---

## 📞 Support

### Contact

- 📧 Email: contact@amadousow.dev
- 💼 LinkedIn: [Amadou Sow](https://www.linkedin.com/in/amadou-sow-8390a124a/)

---

## 🌟 Star History

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=arsprod2001/novaflow&type=Date)](https://star-history.com/#arsprod2001/novaflow&Date)


---

## 📊 Statistics

![Alt](https://repobeats.axiom.co/api/embed/84aaae40214802a9b0d34f4befa7560ef52172a5.svg "Repobeats analytics image")

---

<p align="center">
  <strong>Made with ❤️ by the Novaflow community</strong>
</p>

<p align="center">
  <a href="#-table-of-contents">Back to top ⬆️</a>
</p>

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
    Le CLI moderne qui centralise votre workflow de développement
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
  NovaFlow est un <strong>CLI interactif et cross-platform</strong> conçu pour les développeurs  
  qui veulent <strong>gérer Docker, Git, bases de données et environnement système</strong>  
  depuis un <strong>seul outil cohérent et rapide</strong>.
</p>

<p align="center">
  <em>
    Moins de commandes à mémoriser.  
    Moins d’outils dispersés.  
    Plus de focus sur le code.
  </em>
</p>

<p align="center">
  <img src="src/assets/demo.gif" alt="Novaflow CLI Demo" width="760">
</p>

<hr />

---

## 📋 Table des Matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🚀 Installation](#-installation)
- [📖 Utilisation](#-utilisation)
- [🔧 Commandes Personnalisées](#-commandes-personnalisées)
- [🛠️ Développement](#️-développement)
- [🤝 Contribution](#-contribution)
- [📄 License](#-license)
- [🙏 Remerciements](#-remerciements)
- [📞 Support](#-support)
- [🌟 Star History](#-star-history)


---

## ✨ Fonctionnalités

### 🎯 **Modules Principaux**

- 🐳 **Docker Manager** - Gestion complète des conteneurs, des images et de Docker Compose
- ☸️ **Kubernetes Manager** - Informations du cluster, gestion des namespaces, gestion des déploiements, services et ingress, ConfigMaps & Secrets, volumes persistants, monitoring des pods, charts Helm, gestion du kubeconfig
- 📦 **Git Manager** - Commit des changements, push vers le dépôt distant, pull depuis le dépôt distant, gestion des branches, actions rapides, visualisation
- 📦 **NPM/Yarn/PNPM** - Gestion des packages multi-gestionnaires
- 💾 **Database Manager** - Support MySQL/MariaDB, PostgreSQL, MongoDB, Redis, SQLite, bases de données Docker
- 🌐 **Network Tools** - Test de connexion, informations réseau, analyse des ports, statistiques réseau, vérification SSL, outils réseau, scan DNS, pare-feu
- 📊 **System Monitoring** - Tableau de bord en temps réel, métriques CPU/RAM/Disque, logs en temps réel
- ⚙️ **System Tools** - Informations système, nettoyage, monitoring en temps réel, gestion des processus, explorateur de fichiers, utilitaires système
- 🔧 **Custom Commands** - Créez et gérez vos propres commandes


### 🎨 **Interface & Personnalisation**

- ✅ Interface interactive colorée et moderne
- ✅ Navigation intuitive avec flèches clavier
- ✅ Support multi-sélection
- ✅ Mode rapide pour actions fréquentes

### 🔒 **Robustesse & Qualité**

- ✅ Gestion d'erreurs avancée
- ✅ Logging multi-niveaux (DEBUG, INFO, WARN, ERROR)
- ✅ Validation des entrées utilisateur
- ✅ Compatible Linux, macOS, Windows

---

## 🚀 Installation

### Prérequis

- **Node.js** >= 14.0.0
- **npm** ou **yarn** ou **pnpm**

### Installation Rapide

```bash
# Cloner le repository
git clone https://github.com/arsprod2001/novaflow.git

# Naviguer dans le dossier
cd novaflow

# Installer les dépendances
npm install

# Rendre exécutable (Unix/Linux/Mac)
chmod +x index.js

# Créer un lien global (optionnel)
npm link
```

### Vérification de l'installation

```bash
# Afficher la version
novaflow --version

# Afficher l'aide
novaflow --help

# Lancer l'application
novaflow
```

---

## 📖 Utilisation

### Démarrage

```bash
# Mode interactif
novaflow

# ou avec Node.js
node index.js
```

### Navigation

| Touche   | Action                                  |
| -------- | --------------------------------------- |
| `↑` `↓`  | Naviguer dans les menus                 |
| `Enter`  | Sélectionner une option                 |
| `Espace` | Sélection multiple (si applicable)      |
| `Ctrl+C` | Retour/Annuler/Quitter                  |
| `Tab`    | Auto-complétion (contextes spécifiques) |

---

## 🔧 Commandes Personnalisées

### Créer une Commande

```bash
# Via l'interface
novaflow → 🔧 Commandes personnalisées → ➕ Ajouter une commande

# Exemples:
Nom:         deploy
Commande:    npm run build && npm run deploy
Description: Déploiement production

Nom:         backup-db
Commande:    docker exec mysql mysqldump -u root -p mydb > backup.sql
Description: Sauvegarde base de données
```

### Format JSON

Les commandes sont sauvegardées dans `custom-commands.json`:

```json
{
  "deploy": {
    "command": "npm run build && npm run deploy",
    "description": "Déploiement production"
  },
  "backup-db": {
    "command": "docker exec mysql mysqldump -u root -p mydb > backup.sql",
    "description": "Sauvegarde base de données"
  },
  "clean-all": {
    "command": "docker system prune -f && npm cache clean --force",
    "description": "Nettoyage complet système"
  }
}
```

### Exécuter une Commande

```bash
# Via l'interface
novaflow → 🔧 Commandes personnalisées → ▶️  Exécuter une commande

# Sélectionner la commande à exécuter
```

---

## 🛠️ Développement

### Structure du Projet

```
novaflow/
├── index.js                    # Point d'entrée
├── package.json
├── README.md
├── LICENSE
├── .gitignore
├── src/
│   ├── commands/              # Système de commandes
│   │   ├── custom.js
│   │   ├── executor.js
│   │   └── run.js
│   ├── lib/                   # Bibliothèques
│   │   ├── ui.js
│   │   ├── logger.js
│   │   └── animator.js
│   ├── modules/               # Modules fonctionnels
│   │   ├── main.js
│   │   ├── docker.js
│   │   ├── git.js
│   │   ├── npm.js
│   │   ├── database.js
│   │   ├── network.js
│   │   ├── monitoring.js
│   │   ├── kubernetes
│   │   └── system.js
│   └── utils/                 # Utilitaires
│       ├── helpers.js
│       ├── os-detector.js
│       └── validators.js
└── custom-commands.json       # Commandes personnalisées
```

### Ajouter un Module

1. **Créer le fichier** dans `src/modules/mon-module.js`:

```javascript
import prompts from "prompts";
import { runPlatformCommand } from "../commands/executor.js";
import { UI } from "../lib/ui.js";

export async function monModule() {
  while (true) {
    UI.header("🎯 Mon Module");

    const response = await prompts({
      type: "select",
      name: "action",
      message: "Actions:",
      choices: [
        { title: "📋 Action 1", value: "action1" },
        { title: "⬅️ Retour", value: "back" },
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
        win32: 'commande',
        linux: 'commande',
        darwin: 'commande'
      }, "Description");
      break;
  }
}
```

2. **Intégrer au menu principal** dans `src/modules/main.js`:

```javascript
import { monModule } from './mon-module.js';

// Ajouter dans choices:
{ title: '🎯 Mon Module', value: 'mon-module' }

// Ajouter dans switch:
case 'mon-module':
  await monModule();
  break;
```

### Scripts NPM

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

### Dépendances

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

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer:

### Process de Contribution

1. **Fork** le projet
2. **Créer** une branche (`git checkout -b feature/amazing-feature`)
3. **Commit** vos changements (`git commit -m 'feat: add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### Guidelines

#### Commits

Utilisez les commits conventionnels:

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage
- `refactor:` - Refactorisation
- `test:` - Tests
- `chore:` - Maintenance

Exemples:

```bash
git commit -m "feat: add PostgreSQL support"
git commit -m "fix: resolve Docker connection issue"
git commit -m "docs: update installation instructions"
```



#### Documentation

- Documenter les nouvelles fonctionnalités
- Mettre à jour le README si nécessaire
- Ajouter des exemples d'utilisation

### Signaler un Bug

Créez une issue avec:

- Description claire du bug
- Étapes pour reproduire
- Comportement attendu vs actuel
- Screenshots si applicable
- Environnement (OS, Node version)

### Proposer une Fonctionnalité

Créez une issue avec:

- Description de la fonctionnalité
- Cas d'utilisation
- Mockups/exemples si applicable
- Bénéfices attendus

---

## 📄 License

Ce projet est sous licence **MIT**.
Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

Merci à tous les contributeurs et à la communauté open-source pour:

- [Node.js](https://nodejs.org/)
- [Chalk](https://github.com/chalk/chalk)
- [Prompts](https://github.com/terkelg/prompts)
- [Execa](https://github.com/sindresorhus/execa)
- [Boxen](https://github.com/sindresorhus/boxen)
- [Commander.js](https://github.com/tj/commander.js)
- Tous les autres packages utilisés

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

## 📊 Statistiques

![Alt](https://repobeats.axiom.co/api/embed/84aaae40214802a9b0d34f4befa7560ef52172a5.svg "Repobeats analytics image")

---

<p align="center">
  <strong>Fait avec ❤️ par la communauté Novaflow</strong>
</p>

<p align="center">
  <a href="#-table-des-matières">Retour en haut ⬆️</a>
</p>

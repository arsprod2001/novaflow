import prompts from "prompts";
import chalk from "chalk";
import { UI } from "../lib/ui.js";
import { dockerModule } from "./docker.js";
import { gitModule } from "./git.js";
import { npmModule } from "./npm.js";
import { systemModule } from "./system.js";
import { databaseModule } from "./database.js";
import { networkModule } from "./network.js";
import { monitoringModule } from "./monitoring.js";
import { servicesModule } from "./systemd.js";
import { CustomCommands } from "../commands/custom.js";
import { kubernetesModule } from "./kubernetes.js";
import readline from "readline";
import figlet from 'figlet';
import gradient from 'gradient-string';



export async function mainMenu() {
  if (!process.stdin.isTTY || process.env.CI) {
    console.log(chalk.yellow("⚠️  Non-interactive mode detected."));
    console.log(chalk.yellow("   Switching to command-line mode..."));
    return;
  }

  while (true) {
    try {
      console.clear();
      await showBanner();

      const response = await prompts({
        type: "select",
        name: "action",
        message: "📋 What would you like to do?",
        choices: [
          { title: "🐳 Docker – Container management", value: "docker" },
          { title: "☸️  Kubernetes – Orchestration", value: "kubernetes" },
          { title: "📦 Git – Version control", value: "git" },
          { title: "📦 NPM/Yarn – Package management", value: "npm" },
          { title: "💾 Databases", value: "database" },
          { title: "🌐 Network tools", value: "network" },
          { title: "📊 System monitoring", value: "monitoring" },
          { title: "⚙️  Systemd services", value: "systemd" },
          { title: "⚙️  System commands", value: "system" },
          { title: "🔧 Custom commands", value: "custom" },
          { title: "─────────────────────────────", disabled: true },
          { title: "❌ Exit", value: "exit" },
        ],
        initial: 0,
      });

      if (!response.action) {
        console.log(chalk.yellow("\nOperation cancelled."));
        process.exit(0);
      }

      const { action } = response;

      switch (action) {
        case "docker":
          await dockerModule();
          break;
        case "kubernetes":
          await kubernetesModule();
          break;
        case "security":
          await securityModule();
          break;
        case "git":
          await gitModule();
          break;
        case "npm":
          await npmModule();
          break;
        case "database":
          await databaseModule();
          break;
        case "network":
          await networkModule();
          break;
        case "monitoring":
          await monitoringModule();
          break;
        case "systemd":
          await servicesModule();
          break;
        case "system":
          await systemModule();
          break;
        case "custom":
          await customCommandsModule();
          break;
        case "exit":
          console.log(chalk.green("\n👋 Thanks for using Novaflow!"));
          process.exit(0);
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      console.log(chalk.gray("Press Enter to continue..."));

      await waitForEnter();
    }
  }
}

async function showBanner() {
  console.clear();

  const colors = {
    violet: '#6C63FF',
    blue: '#00D4FF',
    pink: '#FF6B9D',
    white: '#FFFFFF',
    black: '#0A0E17'
  };
  const novaGradient = gradient([colors.violet, colors.blue, colors.pink]);
  
  const headerText = figlet.textSync('NovaFlow', {
    font: 'Standard',
    horizontalLayout: 'full'
  });

  console.log(novaGradient(headerText));
}


async function waitForEnter() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("", () => {
      rl.close();
      resolve();
    });
  });
}

async function customCommandsModule() {
  while (true) {
    console.clear();
    console.log(chalk.cyan.bold("\n🔧 Custom Commands\n"));

    try {
      const response = await prompts({
        type: "select",
        name: "action",
        message: "Custom commands management:",
        choices: [
          { title: "📋 List commands", value: "list" },
          { title: "➕ Add a command", value: "add" },
          { title: "▶️  Run a command", value: "execute" },
          { title: "🗑️  Delete a command", value: "remove" },
          { title: "⬅️ Back", value: "back" },
        ],
      });

      if (!response.action || response.action === "back") break;

      const { action } = response;

      switch (action) {
        case "list":
          CustomCommands.list();
          await waitForEnter();
          break;
        case "add":
          const answers = await prompts([
            {
              type: "text",
              name: "name",
              message: "Command name:",
              validate: (value) => (value.trim() ? true : "Le nom est requis"),
            },
            {
              type: "text",
              name: "command",
              message: "Command to run:",
              validate: (value) =>
                value.trim() ? true : "Command is required",
            },
            {
              type: "text",
              name: "description",
              message: "Description (optionnal):",
              initial: "",
            },
          ]);

          if (answers.name && answers.command) {
            CustomCommands.add(
              answers.name,
              answers.command,
              answers.description || "",
            );
          }
          await waitForEnter();
          break;
        case "execute":
          const commands = Object.keys(CustomCommands.commands);
          if (commands.length === 0) {
            UI.warning("No commands available.");
            await waitForEnter();
            break;
          }

          const execResponse = await prompts({
            type: "select",
            name: "cmdName",
            message: "Select a command:",
            choices: [
              ...commands.map((cmd) => ({ title: cmd, value: cmd })),
              { title: "⬅️ Back", value: "back" },
            ],
          });

          if (execResponse.cmdName && execResponse.cmdName !== "back") {
            await CustomCommands.execute(execResponse.cmdName);
            await waitForEnter();
          }
          break;
        case "remove":
          const cmdList = Object.keys(CustomCommands.commands);
          if (cmdList.length === 0) {
            UI.warning("No commands available.");
            await waitForEnter();
            break;
          }

          const removeResponse = await prompts({
            type: "select",
            name: "cmdToRemove",
            message: "Command to delete:",
            choices: cmdList.map((cmd) => ({ title: cmd, value: cmd })),
          });

          if (removeResponse.cmdToRemove) {
            CustomCommands.remove(removeResponse.cmdToRemove);
          }
          await waitForEnter();
          break;
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      await waitForEnter();
    }
  }
}

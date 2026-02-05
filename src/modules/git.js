import prompts from "prompts";
import {
  runPlatformCommand,
} from "../commands/executor.js";
import { UI } from "../lib/ui.js";

export async function gitModule() {
  while (true) {
    console.clear();
    UI.header("📦 Git Manager (Multi-platform)");

    //const gitCheck = await checkGitInstalled();
    {/**
    if (!gitCheck) {
      await installGitMenu();
      continue;
    }
       */}

    const response = await prompts({
      type: "select",
      name: "action",
      message: "Git Actions:",
      choices: [
        { title: "📊 Repository Status", value: "status" },
        { title: "📝 Commit Changes", value: "commit" },
        { title: "📤 Push to Remote", value: "push" },
        { title: "📥 Pull from Remote", value: "pull" },
        { title: "🔄 Branch Management", value: "branch" },
        { title: "⚡ Quick Actions", value: "quick" },
        { title: "📈 Visualization", value: "graph" },
        { title: "-----------------------", value: "separator", disabled: true },
        { title: "⬅️ Back", value: "back" },
      ],
    });

    if (!response.action || response.action === "back") break;

    await handleGitAction(response.action);

    await prompts({
      type: "text",
      name: "continue",
      message: "Press Enter to continue...",
      initial: "",
    });
  }
}

async function checkGitInstalled() {
  const commandMap = {
    win32: 'git --version 2>nul || echo "Git not installed"',
    linux: 'git --version 2>/dev/null || echo "Git not installed"',
    darwin: 'git --version 2>/dev/null || echo "Git not installed"',
    default: "git --version",
  };

  const result = await runPlatformCommand(commandMap, "Checking Git", false);
  return !result.output.includes("not installed");
}

async function installGitMenu() {
  console.clear();
  UI.header("📦 Git Installation Required");

  console.log("\n⚠️  Git is not installed on your system.\n");

  const response = await prompts({
    type: "select",
    name: "platform",
    message: "Select your platform for installation instructions:",
    choices: [
      { title: "🪟 Windows", value: "windows" },
      { title: "🐧 Linux", value: "linux" },
      { title: "🍎 macOS", value: "macos" },
      { title: "❌ Skip installation", value: "skip" },
    ],
  });

  if (!response.platform || response.platform === "skip") return;

  const instructions = {
    windows: `
🪟 Windows Installation:
  1. Download from: https://git-scm.com/download/win
  2. Run the installer
  3. Select "Git from the command line and also from 3rd-party software"
  4. Choose "Use the OpenSSH executable"
  5. Select "Checkout Windows-style, commit Unix-style line endings"
  6. Complete installation and restart your terminal
    `,
    linux: `
🐧 Linux Installation:
  Ubuntu/Debian:
    sudo apt-get update
    sudo apt-get install git -y

  Fedora:
    sudo dnf install git -y

  Arch Linux:
    sudo pacman -S git
    `,
    macos: `
🍎 macOS Installation:
  Option 1: Using Homebrew (Recommended)
    brew install git

  Option 2: Using Xcode Command Line Tools
    xcode-select --install

  Option 3: Download from: https://git-scm.com/download/mac
    `,
  };

  console.log(instructions[response.platform]);

  await prompts({
    type: "text",
    name: "continue",
    message: "Press Enter to continue...",
    initial: "",
  });
}

async function handleGitAction(action) {
  switch (action) {
    case "status":
      await gitStatus();
      break;
    case "commit":
      await gitCommit();
      break;
    case "push":
      await gitPush();
      break;
    case "pull":
      await gitPull();
      break;
    case "branch":
      await gitBranchManager();
      break;
    case "quick":
      await gitQuickActions();
      break;
    case "graph":
      await gitGraph();
      break;
  }
}

async function gitStatus() {
  const response = await prompts({
    type: "select",
    name: "statusType",
    message: "Status Options:",
    choices: [
      { title: "📊 Basic Status", value: "basic" },
      { title: "📋 Detailed Status", value: "detailed" },
      { title: "📁 File Changes", value: "files" },
      { title: "🔄 Branch Status", value: "branch" },
      { title: "⬅️ Back", value: "back" },
    ],
  });

  if (!response.action || response.action === "back") return;

  const commandMap = {
    basic: { default: "git status" },
    detailed: { default: "git status -v" },
    files: { default: "git status --porcelain" },
    branch: { default: "git status -b" },
  };

  await runPlatformCommand(commandMap[response.statusType], "Git Status");
}

async function gitCommit() {
  console.clear();
  console.log("\n📝 Commit Changes\n");

  await runPlatformCommand({ default: "git status" }, "Current Status", false);
  console.log();

  const response = await prompts([
    {
      type: "select",
      name: "addOption",
      message: "What to add:",
      choices: [
        { title: "📁 All changes", value: "all" },
        { title: "📄 Specific files", value: "specific" },
        { title: "🎯 Interactive add", value: "interactive" },
      ],
    },
  ]);

  if (!response.addOption) return;

  switch (response.addOption) {
    case "all":
      await runPlatformCommand({ default: "git add ." }, "Adding all files");
      break;
    case "specific":
      await addSpecificFiles();
      break;
    case "interactive":
      await runPlatformCommand({ default: "git add -i" }, "Interactive add");
      break;
  }

  const commitTypeResponse = await prompts({
    type: "select",
    name: "commitType",
    message: "Commit type (Conventional Commits):",
    choices: [
      { title: "✨ feat - New feature", value: "feat" },
      { title: "🐛 fix - Bug fix", value: "fix" },
      { title: "📚 docs - Documentation", value: "docs" },
      { title: "🎨 style - Code style", value: "style" },
      { title: "♻️ refactor - Code refactoring", value: "refactor" },
      { title: "⚡ perf - Performance", value: "perf" },
      { title: "✅ test - Tests", value: "test" },
      { title: "🔧 chore - Maintenance", value: "chore" },
      { title: "🚀 ci - CI/CD", value: "ci" },
      { title: "🔒 security - Security", value: "security" },
      { title: "🚧 wip - Work in progress", value: "wip" },
      { title: "📦 build - Build system", value: "build" },
      { title: "💚 green - Fix CI build", value: "green" },
      { title: "🎉 init - Initial commit", value: "init" },
      { title: "🚨 lint - Lint fixes", value: "lint" },
      { title: "🔖 release - Release", value: "release" },
    ],
  });

  if (!commitTypeResponse.commitType) return;

  const messageResponse = await prompts({
    type: "text",
    name: "message",
    message: "Commit message:",
    validate: (value) => (value.trim() ? true : "Message is required"),
  });

  if (!messageResponse.message) return;

  const scopeResponse = await prompts({
    type: "text",
    name: "scope",
    message: "Scope (optional - e.g., auth, ui, api):",
    initial: "",
  });

  let commitMessage = `${commitTypeResponse.commitType}`;
  if (scopeResponse.scope && scopeResponse.scope.trim()) {
    commitMessage += `(${scopeResponse.scope.trim()})`;
  }
  commitMessage += `: ${messageResponse.message}`;

  const bodyResponse = await prompts({
    type: "text",
    name: "body",
    message: "Commit body (optional - Enter for none):",
    initial: "",
  });

  if (bodyResponse.body && bodyResponse.body.trim()) {
    commitMessage += `\n\n${bodyResponse.body}`;
  }

  await runPlatformCommand(
    { default: `git commit -m "${commitMessage.replace(/"/g, '\\"')}"` },
    "Committing changes",
  );
}

async function addSpecificFiles() {
  const filesResult = await runPlatformCommand(
    { default: "git status --porcelain | cut -c4-" },
    "Getting modified files",
    false,
  );

  if (!filesResult.success || !filesResult.output) {
    UI.error("No modified files found");
    return;
  }

  const files = filesResult.output
    .trim()
    .split("\n")
    .filter((f) => f.trim());

  if (files.length === 0) {
    UI.error("No modified files found");
    return;
  }

  const fileResponse = await prompts({
    type: "multiselect",
    name: "files",
    message: "Select files to add:",
    choices: files.map((file) => ({
      title: file,
      value: file,
      selected: false,
    })),
    hint: "- Space to select, Enter to confirm",
  });

  if (fileResponse.files && fileResponse.files.length > 0) {
    for (const file of fileResponse.files) {
      await runPlatformCommand(
        { default: `git add "${file}"` },
        `Adding ${file}`,
      );
    }
  }
}

async function gitPush() {
  const response = await prompts({
    type: "select",
    name: "pushType",
    message: "Push Options:",
    choices: [
      { title: "🚀 Push to origin", value: "origin" },
      { title: "📤 Push with tags", value: "tags" },
      { title: "🔄 Push to specific remote", value: "remote" },
      { title: "💪 Force push", value: "force" },
      { title: "🎯 Push specific branch", value: "branch" },
    ],
  });

  let command = "git push";

  switch (response.pushType) {
    case "origin":
      command += " origin HEAD";
      break;
    case "tags":
      command += " --tags";
      break;
    case "force":
      const forceConfirm = await prompts({
        type: "confirm",
        name: "confirm",
        message: "⚠️  Force push can overwrite history. Are you sure?",
        initial: false,
      });

      if (forceConfirm.confirm) {
        command += " --force-with-lease";
      } else {
        return;
      }
      break;
    case "branch":
      const branchResponse = await prompts({
        type: "text",
        name: "branch",
        message: "Branch name:",
        validate: (value) => (value.trim() ? true : "Branch name is required"),
      });

      if (branchResponse.branch) {
        command += ` origin ${branchResponse.branch}`;
      } else {
        return;
      }
      break;
    case "remote":
      const remoteResponse = await prompts({
        type: "text",
        name: "remote",
        message: "Remote name (e.g., origin, upstream):",
        initial: "origin",
      });

      if (remoteResponse.remote) {
        command += ` ${remoteResponse.remote} HEAD`;
      } else {
        return;
      }
      break;
  }

  await runPlatformCommand({ default: command }, "Pushing to remote");
}

async function gitPull() {
  const response = await prompts({
    type: "select",
    name: "pullType",
    message: "Pull Options:",
    choices: [
      { title: "📥 Pull from origin", value: "origin" },
      { title: "🔀 Pull with rebase", value: "rebase" },
      { title: "🧹 Pull with prune", value: "prune" },
      { title: "🔧 Pull specific remote", value: "remote" },
    ],
  });

  let command = "git pull";

  switch (response.pullType) {
    case "origin":
      command += " origin HEAD";
      break;
    case "rebase":
      command += " --rebase";
      break;
    case "prune":
      command += " --prune";
      break;
    case "remote":
      const remoteResponse = await prompts({
        type: "text",
        name: "remote",
        message: "Remote name:",
        initial: "origin",
      });

      if (remoteResponse.remote) {
        command += ` ${remoteResponse.remote} HEAD`;
      } else {
        return;
      }
      break;
  }

  await runPlatformCommand({ default: command }, "Pulling from remote");
}

async function gitBranchManager() {
  console.clear();
  console.log("\n🔄 Branch Management\n");

  const response = await prompts({
    type: "select",
    name: "branchAction",
    message: "Branch Actions:",
    choices: [
      { title: "📋 List branches", value: "list" },
      { title: "➕ Create new branch", value: "create" },
      { title: "🔄 Switch branch", value: "switch" },
      { title: "🗑️  Delete branch", value: "delete" },
      { title: "📤 Push branch", value: "push" },
      { title: "📥 Pull branch", value: "pull" },
      { title: "🔄 Rename branch", value: "rename" },
      { title: "📊 Branch comparison", value: "compare" },
      { title: "⬅️ Back", value: "back" },
    ],
  });

  if (!response.branchAction || response.branchAction === "back") return;

  switch (response.branchAction) {
    case "list":
      await listBranches();
      break;
    case "create":
      await createBranch();
      break;
    case "switch":
      await switchBranch();
      break;
    case "delete":
      await deleteBranch();
      break;
    case "push":
      await pushBranch();
      break;
    case "pull":
      await pullBranch();
      break;
    case "rename":
      await renameBranch();
      break;
    case "compare":
      await compareBranches();
      break;
  }
}

async function listBranches() {
  const response = await prompts({
    type: "select",
    name: "listType",
    message: "Branch List Type:",
    choices: [
      { title: "📋 Local branches", value: "local" },
      { title: "🌐 Remote branches", value: "remote" },
      { title: "📊 All branches", value: "all" },
      { title: "👤 Your branches", value: "mine" },
    ],
  });

  const commandMap = {
    local: { default: "git branch" },
    remote: { default: "git branch -r" },
    all: { default: "git branch -a" },
    mine: {
      default:
        'git branch --list | grep -E "(feature|fix|hotfix|release)/" || echo "No personal branches"',
    },
  };

  await runPlatformCommand(commandMap[response.listType], "Branch List");
}

async function createBranch() {
  const response = await prompts([
    {
      type: "select",
      name: "branchType",
      message: "Branch type:",
      choices: [
        { title: "✨ feature/", value: "feature" },
        { title: "🐛 fix/", value: "fix" },
        { title: "🔥 hotfix/", value: "hotfix" },
        { title: "🚀 release/", value: "release" },
        { title: "🔧 chore/", value: "chore" },
        { title: "📚 docs/", value: "docs" },
        { title: "🎨 style/", value: "style" },
        { title: "🔄 other", value: "other" },
      ],
    },
    {
      type: "text",
      name: "branchName",
      message: "Branch name (without type prefix):",
      validate: (value) => (value.trim() ? true : "Branch name is required"),
    },
    {
      type: "text",
      name: "baseBranch",
      message: "Base branch (leave empty for current):",
      initial: "",
    },
  ]);

  if (!response.branchName) return;

  let branchName = response.branchName.trim();
  if (response.branchType !== "other") {
    branchName = `${response.branchType}/${branchName}`;
  }

  let command = "git checkout";
  if (response.baseBranch && response.baseBranch.trim()) {
    command += ` ${response.baseBranch.trim()}`;
  }
  command += ` && git checkout -b ${branchName}`;

  await runPlatformCommand(
    { default: command },
    `Creating branch ${branchName}`,
  );
}

async function switchBranch() {
  // Get list of local branches
  const branchesResult = await runPlatformCommand(
    { default: 'git branch --format="%(refname:short)"' },
    "Getting branches",
    false,
  );

  if (!branchesResult.success || !branchesResult.output) {
    UI.error("No branches found");
    return;
  }

  const branches = branchesResult.output
    .trim()
    .split("\n")
    .filter((b) => b.trim());

  const response = await prompts({
    type: "select",
    name: "branch",
    message: "Select branch to switch to:",
    choices: [
      ...branches.map((branch) => ({ title: branch, value: branch })),
      { title: "✏️ Enter branch name", value: "manual" },
    ],
  });

  let branchName = response.branch;

  if (branchName === "manual") {
    const manualResponse = await prompts({
      type: "text",
      name: "branch",
      message: "Branch name:",
      validate: (value) => (value.trim() ? true : "Branch name is required"),
    });

    if (!manualResponse.branch) return;
    branchName = manualResponse.branch;
  }

  await runPlatformCommand(
    { default: `git checkout ${branchName}` },
    `Switching to ${branchName}`,
  );
}

async function deleteBranch() {
  const response = await prompts({
    type: "select",
    name: "deleteType",
    message: "Delete branch type:",
    choices: [
      { title: "🗑️  Local branch", value: "local" },
      { title: "🌐 Remote branch", value: "remote" },
      { title: "🚫 Both local and remote", value: "both" },
    ],
  });

  const branchResponse = await prompts({
    type: "text",
    name: "branch",
    message: "Branch name to delete:",
    validate: (value) => (value.trim() ? true : "Branch name is required"),
  });

  if (!branchResponse.branch) return;

  let command = "";
  switch (response.deleteType) {
    case "local":
      command = `git branch -d ${branchResponse.branch}`;
      break;
    case "remote":
      command = `git push origin --delete ${branchResponse.branch}`;
      break;
    case "both":
      command = `git branch -d ${branchResponse.branch} && git push origin --delete ${branchResponse.branch}`;
      break;
  }

  const confirm = await prompts({
    type: "confirm",
    name: "confirm",
    message: `Are you sure you want to delete ${branchResponse.branch}?`,
    initial: false,
  });

  if (confirm.confirm) {
    await runPlatformCommand(
      { default: command },
      `Deleting ${branchResponse.branch}`,
    );
  }
}

async function gitQuickActions() {
  console.clear();
  console.log("\n⚡ Git Quick Actions\n");

  const response = await prompts({
    type: "select",
    name: "quickAction",
    message: "Quick Actions:",
    choices: [
      { title: "🔄 Sync (Pull + Push)", value: "sync" },
      { title: "🧹 Clean up branches", value: "cleanup" },
      { title: "📦 Stash + Pull + Pop", value: "stashpull" },
      { title: "⚡ Commit & Push", value: "commitpush" },
      { title: "🎯 Update all submodules", value: "submodules" },
      { title: "🔍 Find large files", value: "largefiles" },
      { title: "⬅️ Back", value: "back" },
    ],
  });

  if (!response.quickAction || response.quickAction === "back") return;

  switch (response.quickAction) {
    case "sync":
      await runPlatformCommand(
        { default: "git pull && git push" },
        "Sync Repository",
      );
      break;
    case "cleanup":
      await runPlatformCommand(
        {
          default:
            'git fetch --prune && git branch --merged | grep -v "\\*" | xargs -n 1 git branch -d',
        },
        "Cleaning up branches",
      );
      break;
    case "stashpull":
      await runPlatformCommand(
        { default: "git stash && git pull && git stash pop" },
        "Stash, Pull, Pop",
      );
      break;
    case "commitpush":
      const messageResponse = await prompts({
        type: "text",
        name: "message",
        message: "Commit message:",
        initial: "Quick commit",
      });

      if (messageResponse.message) {
        await runPlatformCommand(
          {
            default: `git add . && git commit -m "${messageResponse.message}" && git push`,
          },
          "Commit & Push",
        );
      }
      break;
    case "submodules":
      await runPlatformCommand(
        { default: "git submodule update --init --recursive" },
        "Updating submodules",
      );
      break;
    case "largefiles":
      await runPlatformCommand(
        {
          default:
            "git rev-list --objects --all | git cat-file --batch-check=\"%(objecttype) %(objectname) %(objectsize) %(rest)\" | awk '/^blob/ {print substr($0,6)}' | sort --numeric-sort --key=2 | tail -10",
        },
        "Finding large files",
      );
      break;
  }
}

async function gitGraph() {
  const response = await prompts({
    type: "select",
    name: "graphType",
    message: "Graph Options:",
    choices: [
      { title: "📈 Simple graph", value: "simple" },
      { title: "📊 Detailed graph", value: "detailed" },
      { title: "🎨 Colored graph", value: "colored" },
      { title: "📅 Last N days", value: "recent" },
    ],
  });

  let command = "git log";
  switch (response.graphType) {
    case "simple":
      command += " --oneline --graph --all -20";
      break;
    case "detailed":
      command += " --graph --all --decorate --oneline";
      break;
    case "colored":
      command += " --graph --all --decorate --oneline --color=always";
      break;
    case "recent":
      const daysResponse = await prompts({
        type: "number",
        name: "days",
        message: "Number of days:",
        initial: 7,
        min: 1,
      });

      if (daysResponse.days) {
        command += ` --since="${daysResponse.days} days ago" --graph --oneline`;
      } else {
        return;
      }
      break;
  }

  await runPlatformCommand({ default: command }, "Git Graph");
}



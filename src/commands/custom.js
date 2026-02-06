import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runCommand } from './executor.js';
import { UI } from '../lib/ui.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CUSTOM_COMMANDS_FILE = path.join(__dirname, '../../custom-commands.json');

export class CustomCommands {
  static commands = {};

  static load() {
    if (fs.existsSync(CUSTOM_COMMANDS_FILE)) {
      try {
        const data = fs.readFileSync(CUSTOM_COMMANDS_FILE, 'utf8');
        this.commands = JSON.parse(data);
        UI.success('Custom commands loaded successfully!');
      } catch (error) {
        UI.error(`Error loading custom commands: ${error.message}`);
        this.commands = {};
      }
    } else {
      this.save();
    }
  }

  static save() {
    try {
      fs.writeFileSync(
        CUSTOM_COMMANDS_FILE,
        JSON.stringify(this.commands, null, 2),
        'utf8'
      );
    } catch (error) {
      UI.error(`Error saving custom commands: ${error.message}`);
    }
  }

  static add(name, command, description = '') {
    if (!name || !command) {
      UI.error('Both name and command are required.');
      return;
    }

    this.commands[name] = { 
      command: command.trim(), 
      description: description.trim() 
    };
    this.save();
    UI.success(`Command "${name}" added successfully!`);
  }

  static remove(name) {
    if (this.commands[name]) {
      delete this.commands[name];
      this.save();
      UI.success(`Command "${name}" removed successfully!`);
    } else {
      UI.error(`Command "${name}" not found.`);
    }
  }

  static list() {
    if (Object.keys(this.commands).length === 0) {
      UI.warning('No custom commands defined.');
      return;
    }

    try {
      const tableData = Object.entries(this.commands).map(([name, cmd]) => {
        if (!cmd || typeof cmd !== 'object') {
          console.warn(`Command "${name}" has invalid format:`, cmd);
          return [name, 'INVALID FORMAT', 'INVALID FORMAT'];
        }
        
        return [
          name,
          cmd.command || 'NOT DEFINED',
          cmd.description || 'No description'
        ];
      });

      UI.table(['Name', 'Command', 'Description'], tableData);
      
      console.log(`\n📊 Total: ${Object.keys(this.commands).length} command(s)`);
    } catch (error) {
      UI.error(`Error displaying commands: ${error.message}`);
      console.error('Error details:', error);
      console.log('this.commands content:', this.commands);
    }
  }

  static async execute(name) {
    if (!this.commands[name]) {
      UI.error(`Command "${name}" not found.`);
      return false;
    }

    const { command, description } = this.commands[name];
    const commandDescription = description || `Executing "${name}"`;
    
    UI.info(`Running: ${commandDescription}`);
    console.log(`📝 Command: ${command}\n`);
    
    const success = await runCommand(command, commandDescription);
    
    if (success) {
      UI.success(`Command "${name}" executed successfully!`);
    } else {
      UI.error(`Command "${name}" failed to execute.`);
    }
    
    return success;
  }

  static edit(name) {
    if (!this.commands[name]) {
      UI.error(`Command "${name}" not found.`);
      return false;
    }

    const currentCommand = this.commands[name];
    console.log(`\n📝 Editing command: ${name}`);
    console.log(`Current command: ${currentCommand.command}`);
    console.log(`Current description: ${currentCommand.description || '(none)'}`);

    UI.info('Editing functionality would be implemented with user prompts.');
    return true;
  }

  static search(keyword) {
    if (!keyword) {
      UI.error('Please provide a search keyword.');
      return [];
    }

    const results = Object.entries(this.commands).filter(([name, cmd]) => {
      const searchStr = `${name} ${cmd.command} ${cmd.description || ''}`.toLowerCase();
      return searchStr.includes(keyword.toLowerCase());
    });

    if (results.length === 0) {
      UI.warning(`No commands found matching "${keyword}"`);
      return [];
    }

    console.log(`\n🔍 Search results for "${keyword}":`);
    results.forEach(([name, cmd]) => {
      console.log(`\n${name}:`);
      console.log(`  Command: ${cmd.command}`);
      console.log(`  Description: ${cmd.description || 'No description'}`);
    });

    return results;
  }

  static exportToFile(filePath = './custom-commands-backup.json') {
    try {
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalCommands: Object.keys(this.commands).length,
          version: '1.0'
        },
        commands: this.commands
      };

      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf8');
      UI.success(`Commands exported to ${filePath}`);
      return true;
    } catch (error) {
      UI.error(`Export failed: ${error.message}`);
      return false;
    }
  }

  static importFromFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        UI.error(`File not found: ${filePath}`);
        return false;
      }

      const data = fs.readFileSync(filePath, 'utf8');
      const imported = JSON.parse(data);
      
      const commandsToImport = imported.commands || imported;
      
      if (typeof commandsToImport !== 'object') {
        UI.error('Invalid import file format.');
        return false;
      }

      const count = Object.keys(commandsToImport).length;
      this.commands = { ...this.commands, ...commandsToImport };
      this.save();
      
      UI.success(`Successfully imported ${count} command(s) from ${filePath}`);
      return true;
    } catch (error) {
      UI.error(`Import failed: ${error.message}`);
      return false;
    }
  }

  static clearAll() {
    if (Object.keys(this.commands).length === 0) {
      UI.warning('No commands to clear.');
      return false;
    }

    const count = Object.keys(this.commands).length;
    this.commands = {};
    this.save();
    
    UI.success(`Cleared all ${count} custom command(s).`);
    return true;
  }
}

CustomCommands.load();
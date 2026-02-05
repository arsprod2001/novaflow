#!/usr/bin/env node
import chalk from 'chalk';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import { program } from 'commander';
import { mainMenu } from './modules/main.js';


console.clear();

const rainbow = gradient(['#ff0000', '#00ff00', '#0000ff']);
const headerText = figlet.textSync('NovaFlow', {
  font: 'Standard',
  horizontalLayout: 'full'
});

console.log(rainbow(headerText));


async function init() {
  try {
    const spinner = createSpinner('Checking system...').start();
    await new Promise(resolve => setTimeout(resolve, 1000));
    spinner.success({ text: 'System ready!' });

    await mainMenu();
    
  } catch (error) {
    console.error(chalk.red('\n⚠️  Error:'), error.message);
    process.exit(1);
  }
}


program
  .name('novaflow')
  .description('Development toolbox')
  .version('1.0.0')
  .action(() => {
    init();
  });


program.parse(process.argv);
import { execa } from 'execa';
import chalk from 'chalk';

export async function run(command) {
  console.log(chalk.green(`\n▶ ${command}\n`));

  const subprocess = execa(command, {
    stdio: 'inherit',
    shell: true,
  });

  await subprocess;
}



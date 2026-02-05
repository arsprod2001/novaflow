import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import Table from 'cli-table3';
import ora from 'ora';
import readline from 'readline';

export class UI {
  static themes = {
    dark: {
      primary: '#00ffff',
      secondary: '#ff6b6b',
      background: '#0a0a0a',
      text: '#ffffff',
    },
    light: {
      primary: '#007acc',
      secondary: '#ff4081',
      background: '#ffffff',
      text: '#000000',
    },
    neon: {
      primary: '#00ff9d',
      secondary: '#ff00ff',
      background: '#000000',
      text: '#ffffff',
    },
  };

  static currentTheme = 'dark';

  static setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
    }
  }

  static header(title) {
    const theme = this.themes[this.currentTheme];
    const rainbow = gradient([theme.primary, theme.secondary]);

    console.log('\n');
    console.log(
      boxen(rainbow(title), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: theme.primary,
        backgroundColor: theme.background,
      }),
    );
  }

  static card(title, content, options = {}) {
    const theme = this.themes[this.currentTheme];
    const width = options.width || 60;

    const box = boxen(
      `${chalk.hex(theme.primary).bold(title)}\n\n${content}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: theme.primary,
        width,
        backgroundColor: options.backgroundColor || theme.background,
      },
    );

    console.log(box);
  }

static table(headers, rows, options = {}) {
  const theme = this.themes[this.currentTheme];

  if (!Array.isArray(rows) || rows.length === 0) {
    console.log(chalk.yellow('Aucune donnée à afficher dans le tableau.'));
    return;
  }

  const validRows = rows.filter(row => Array.isArray(row) && row.length === headers.length);
  
  if (validRows.length === 0) {
    console.log(chalk.yellow('Format de données invalide pour le tableau.'));
    return;
  }

  try {
    const table = new Table({
      head: headers.map((h) =>
        chalk.hex(theme.primary).bold(h),
      ),
      colWidths: options.colWidths || [30, 40, 30], // Ajouter des valeurs par défaut
      style: {
        head: [],
        border: [theme.secondary],
      },
      wordWrap: true, // Ajouter le word wrapping
    });

    table.push(...validRows);
    console.log(table.toString());
  } catch (error) {
    console.error(chalk.red(`Erreur lors de la création du tableau: ${error.message}`));
    console.log(chalk.gray('Headers:'), headers);
    console.log(chalk.gray('First row:'), rows[0]);
  }
}

  static async progressBar(title, task) {
    const spinner = ora({
      text: chalk.cyan(title),
      spinner: 'dots',
    }).start();

    try {
      await task();
      spinner.succeed(chalk.green(`${title} terminé !`));
    } catch (error) {
      spinner.fail(
        chalk.red(`${title} échoué : ${error.message}`),
      );
      throw error;
    }
  }

  static confirm(message) {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        chalk.yellow(`❓ ${message} (o/n) : `),
        (answer) => {
          rl.close();
          resolve(
            answer.toLowerCase() === 'o' ||
              answer.toLowerCase() === 'oui',
          );
        },
      );
    });
  }

  static listMenu(items, message = 'Choisissez une option') {
    console.log('\n' + chalk.cyan('═'.repeat(50)));
    console.log(chalk.yellow.bold(` ${message}`));
    console.log(chalk.cyan('═'.repeat(50)));

    items.forEach((item, index) => {
      const number = chalk.green(`${index + 1}.`);
      console.log(`  ${number} ${item}`);
    });

    console.log(chalk.cyan('═'.repeat(50)));
  }

  static success(message) {
    console.log(chalk.green(`\n✅ ${message}`));
  }

  static error(message) {
    console.log(chalk.red(`\n❌ ${message}`));
  }

  static warning(message) {
    console.log(chalk.yellow(`\n⚠️  ${message}`));
  }

  static info(message) {
    console.log(chalk.blue(`\nℹ️  ${message}`));
  }
}

export function displayHeader() {
  const banner = `
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║  ${chalk.cyan.bold('NovaFlow')} ${chalk.gray('v1.0.0')}                          ║
║  ${chalk.gray('Votre assistant de développement ultime')}           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`;

  console.log(banner);
}
import prompts from 'prompts';
import { runPlatformCommand } from '../commands/executor.js';
import { UI } from '../lib/ui.js';
import os from 'os';


export async function databaseModule() {
  while (true) {
    console.clear();
    UI.header('💾 Database Manager (Multi-platform)');
    
    const platform = os.platform();
    console.log(`📱 Platform: ${platform}\n`);

    const response = await prompts({
      type: 'select',
      name: 'dbType',
      message: 'Database Type:',
      choices: [
        { title: '🐬 MySQL/MariaDB', value: 'mysql' },
        { title: '🐘 PostgreSQL', value: 'postgres' },
        { title: '📊 MongoDB', value: 'mongodb' },
        { title: '💎 Redis', value: 'redis' },
        { title: '🗄️ SQLite', value: 'sqlite' },
        { title: '🐳 Docker Databases', value: 'docker' },
        { title: '', value: 'separator', disabled: true },
        { title: '⬅️ Back', value: 'back' }
      ]
    });

    if (!response.dbType || response.dbType === 'back') break;

    await databaseMenu(response.dbType);
  }
}

async function databaseMenu(dbType) {
  while (true) {
    console.clear();
    UI.header(`💾 ${dbType.toUpperCase()} Database Manager`);
    
    const dbName = getDatabaseDisplayName(dbType);
    console.log(`📊 Database: ${dbName}\n`);

    const menuOptions = getDatabaseMenuOptions(dbType);
    
    const response = await prompts({
      type: 'select',
      name: 'action',
      message: `${dbName} Actions:`,
      choices: menuOptions
    });

    if (!response.action || response.action === 'back') break;

    await handleDatabaseAction(dbType, response.action);
    
    await prompts({
      type: 'text',
      name: 'continue',
      message: 'Press Enter to continue...',
      initial: ''
    });
  }
}

function getDatabaseDisplayName(dbType) {
  const names = {
    'mysql': 'MySQL/MariaDB',
    'postgres': 'PostgreSQL',
    'mongodb': 'MongoDB',
    'redis': 'Redis',
    'sqlite': 'SQLite',
    'docker': 'Docker Databases'
  };
  return names[dbType] || dbType.toUpperCase();
}

function getDatabaseMenuOptions(dbType) {
  const baseOptions = [
    { title: '🚀 Start Service', value: 'start' },
    { title: '⏹️ Stop Service', value: 'stop' },
    { title: '🔄 Restart Service', value: 'restart' },
    { title: '📊 Service Status', value: 'status' },
    { title: '🔌 Connect/Shell', value: 'connect' },
    { title: '📁 List Databases', value: 'list' },
    { title: '💾 Backup Database', value: 'backup' },
    { title: '🔄 Restore Database', value: 'restore' },
    { title: '📝 Run Query', value: 'query' },
    { title: '📊 Database Info', value: 'info' },
    { title: '⚙️ Configuration', value: 'config' },
    { title: '', value: 'separator', disabled: true },
    { title: '⬅️ Back', value: 'back' }
  ];
  
  if (dbType === 'sqlite') {
    return baseOptions.filter(opt => 
      !['start', 'stop', 'restart', 'status'].includes(opt.value)
    );
  }
  
  if (dbType === 'docker') {
    return [
      { title: '🐳 List Database Containers', value: 'list' },
      { title: '🚀 Start Container', value: 'start' },
      { title: '⏹️ Stop Container', value: 'stop' },
      { title: '🔄 Restart Container', value: 'restart' },
      { title: '📊 Container Status', value: 'status' },
      { title: '🔌 Connect to Container', value: 'connect' },
      { title: '📝 Run Container Command', value: 'command' },
      { title: '📁 View Container Logs', value: 'logs' },
      { title: '', value: 'separator', disabled: true },
      { title: '⬅️ Back', value: 'back' }
    ];
  }
  
  return baseOptions;
}

async function handleDatabaseAction(dbType, action) {
  switch (dbType) {
    case 'mysql':
      await handleMySQL(action);
      break;
    case 'postgres':
      await handlePostgreSQL(action);
      break;
    case 'mongodb':
      await handleMongoDB(action);
      break;
    case 'redis':
      await handleRedis(action);
      break;
    case 'sqlite':
      await handleSQLite(action);
      break;
    case 'docker':
      await handleDockerDatabases(action);
      break;
  }
}

async function handleMySQL(action) {
  const commands = getMySQLCommands(action);
  if (commands) {
    await runPlatformCommand(commands, `MySQL ${action}`);
  }
}

function getMySQLCommands(action) {
  const commandMap = {
    start: {
      win32: 'net start MySQL || echo "MySQL service not found. Try: mysql start"',
      linux: 'sudo systemctl start mysql || sudo systemctl start mariadb',
      darwin: 'brew services start mysql || brew services start mariadb',
      default: 'echo "Starting MySQL service not supported on this platform"'
    },
    stop: {
      win32: 'net stop MySQL 2>nul || echo "MySQL service not found"',
      linux: 'sudo systemctl stop mysql || sudo systemctl stop mariadb',
      darwin: 'brew services stop mysql || brew services stop mariadb',
      default: 'echo "Stopping MySQL service not supported on this platform"'
    },
    restart: {
      win32: 'net stop MySQL 2>nul && net start MySQL 2>nul || echo "MySQL service not found"',
      linux: 'sudo systemctl restart mysql || sudo systemctl restart mariadb',
      darwin: 'brew services restart mysql || brew services restart mariadb',
      default: 'echo "Restarting MySQL service not supported on this platform"'
    },
    status: {
      win32: 'sc query MySQL 2>nul || echo "MySQL service not installed"',
      linux: 'sudo systemctl status mysql || sudo systemctl status mariadb',
      darwin: 'brew services list | grep -E "mysql|mariadb"',
      default: 'echo "MySQL status not available"'
    },
    connect: {
      win32: 'mysql -u root -p',
      linux: 'sudo mysql -u root -p || mysql -u root -p',
      darwin: 'mysql -u root -p',
      default: 'mysql -u root -p'
    },
    list: {
      win32: 'mysql -u root -p -e "SHOW DATABASES;"',
      linux: 'sudo mysql -u root -p -e "SHOW DATABASES;" || mysql -u root -p -e "SHOW DATABASES;"',
      darwin: 'mysql -u root -p -e "SHOW DATABASES;"',
      default: 'mysql -u root -p -e "SHOW DATABASES;"'
    },
    backup: {
      win32: 'mysqldump -u root -p --all-databases > mysql_backup_$(date +%Y%m%d).sql',
      linux: 'sudo mysqldump -u root -p --all-databases > mysql_backup_$(date +%Y%m%d).sql',
      darwin: 'mysqldump -u root -p --all-databases > mysql_backup_$(date +%Y%m%d).sql',
      default: 'mysqldump -u root -p --all-databases > mysql_backup_$(date +%Y%m%d).sql'
    },
    restore: {
      win32: 'echo "Restore command: mysql -u root -p < backup_file.sql"',
      linux: 'echo "Restore command: sudo mysql -u root -p < backup_file.sql"',
      darwin: 'echo "Restore command: mysql -u root -p < backup_file.sql"',
      default: 'echo "Restore command: mysql -u root -p < backup_file.sql"'
    },
    query: {
      win32: 'echo "Run query: mysql -u root -p -e \\"YOUR QUERY\\""',
      linux: 'echo "Run query: sudo mysql -u root -p -e \\"YOUR QUERY\\""',
      darwin: 'echo "Run query: mysql -u root -p -e \\"YOUR QUERY\\""',
      default: 'echo "Run query: mysql -u root -p -e \\"YOUR QUERY\\""'
    },
    info: {
      win32: 'mysql -u root -p -e "STATUS;"',
      linux: 'sudo mysql -u root -p -e "STATUS;" || mysql -u root -p -e "STATUS;"',
      darwin: 'mysql -u root -p -e "STATUS;"',
      default: 'mysql -u root -p -e "STATUS;"'
    },
    config: {
      win32: 'echo "MySQL config file: C:\\ProgramData\\MySQL\\MySQL Server X.X\\my.ini"',
      linux: 'sudo cat /etc/mysql/my.cnf 2>/dev/null || echo "Config file not found"',
      darwin: 'cat /usr/local/etc/my.cnf 2>/dev/null || echo "Config file not found"',
      default: 'echo "MySQL configuration"'
    }
  };
  
  return commandMap[action];
}

async function handlePostgreSQL(action) {
  const commands = getPostgreSQLCommands(action);
  if (commands) {
    await runPlatformCommand(commands, `PostgreSQL ${action}`);
  }
}

function getPostgreSQLCommands(action) {
  const commandMap = {
    start: {
      win32: 'net start postgresql-x64-14 || echo "PostgreSQL service not found"',
      linux: 'sudo systemctl start postgresql',
      darwin: 'brew services start postgresql',
      default: 'echo "Starting PostgreSQL service not supported on this platform"'
    },
    stop: {
      win32: 'net stop postgresql-x64-14 2>nul || echo "PostgreSQL service not found"',
      linux: 'sudo systemctl stop postgresql',
      darwin: 'brew services stop postgresql',
      default: 'echo "Stopping PostgreSQL service not supported on this platform"'
    },
    restart: {
      win32: 'net stop postgresql-x64-14 2>nul && net start postgresql-x64-14 2>nul || echo "PostgreSQL service not found"',
      linux: 'sudo systemctl restart postgresql',
      darwin: 'brew services restart postgresql',
      default: 'echo "Restarting PostgreSQL service not supported on this platform"'
    },
    status: {
      win32: 'sc query postgresql-x64-14 2>nul || echo "PostgreSQL service not installed"',
      linux: 'sudo systemctl status postgresql',
      darwin: 'brew services list | grep postgresql',
      default: 'echo "PostgreSQL status not available"'
    },
    connect: {
      win32: 'psql -U postgres',
      linux: 'sudo -u postgres psql || psql -U postgres',
      darwin: 'psql -U postgres',
      default: 'psql -U postgres'
    },
    list: {
      win32: 'psql -U postgres -c "\\l"',
      linux: 'sudo -u postgres psql -c "\\l" || psql -U postgres -c "\\l"',
      darwin: 'psql -U postgres -c "\\l"',
      default: 'psql -U postgres -c "\\l"'
    },
    backup: {
      win32: 'pg_dumpall -U postgres > postgres_backup_$(date +%Y%m%d).sql',
      linux: 'sudo -u postgres pg_dumpall > postgres_backup_$(date +%Y%m%d).sql',
      darwin: 'pg_dumpall -U postgres > postgres_backup_$(date +%Y%m%d).sql',
      default: 'pg_dumpall -U postgres > postgres_backup_$(date +%Y%m%d).sql'
    },
    restore: {
      win32: 'echo "Restore command: psql -U postgres -f backup_file.sql"',
      linux: 'echo "Restore command: sudo -u postgres psql -f backup_file.sql"',
      darwin: 'echo "Restore command: psql -U postgres -f backup_file.sql"',
      default: 'echo "Restore command: psql -U postgres -f backup_file.sql"'
    },
    query: {
      win32: 'psql -U postgres -c "SELECT version();"',
      linux: 'sudo -u postgres psql -c "SELECT version();" || psql -U postgres -c "SELECT version();"',
      darwin: 'psql -U postgres -c "SELECT version();"',
      default: 'psql -U postgres -c "SELECT version();"'
    },
    info: {
      win32: 'psql -U postgres -c "SELECT version();"',
      linux: 'sudo -u postgres psql -c "SELECT version();" || psql -U postgres -c "SELECT version();"',
      darwin: 'psql -U postgres -c "SELECT version();"',
      default: 'psql -U postgres -c "SELECT version();"'
    },
    config: {
      win32: 'echo "PostgreSQL config: C:\\Program Files\\PostgreSQL\\X.X\\data\\postgresql.conf"',
      linux: 'sudo cat /etc/postgresql/*/main/postgresql.conf 2>/dev/null || echo "Config file not found"',
      darwin: 'cat /usr/local/var/postgres/postgresql.conf 2>/dev/null || echo "Config file not found"',
      default: 'echo "PostgreSQL configuration"'
    }
  };
  
  return commandMap[action];
}

async function handleMongoDB(action) {
  const commands = getMongoDBCommands(action);
  if (commands) {
    await runPlatformCommand(commands, `MongoDB ${action}`);
  }
}

function getMongoDBCommands(action) {
  const commandMap = {
    start: {
      win32: 'net start MongoDB || echo "MongoDB service not found"',
      linux: 'sudo systemctl start mongod',
      darwin: 'brew services start mongodb-community',
      default: 'echo "Starting MongoDB service not supported on this platform"'
    },
    stop: {
      win32: 'net stop MongoDB 2>nul || echo "MongoDB service not found"',
      linux: 'sudo systemctl stop mongod',
      darwin: 'brew services stop mongodb-community',
      default: 'echo "Stopping MongoDB service not supported on this platform"'
    },
    restart: {
      win32: 'net stop MongoDB 2>nul && net start MongoDB 2>nul || echo "MongoDB service not found"',
      linux: 'sudo systemctl restart mongod',
      darwin: 'brew services restart mongodb-community',
      default: 'echo "Restarting MongoDB service not supported on this platform"'
    },
    status: {
      win32: 'sc query MongoDB 2>nul || echo "MongoDB service not installed"',
      linux: 'sudo systemctl status mongod',
      darwin: 'brew services list | grep mongodb',
      default: 'echo "MongoDB status not available"'
    },
    connect: {
      win32: 'mongosh',
      linux: 'mongosh',
      darwin: 'mongosh',
      default: 'mongosh'
    },
    list: {
      win32: 'mongosh --eval "show dbs"',
      linux: 'mongosh --eval "show dbs"',
      darwin: 'mongosh --eval "show dbs"',
      default: 'mongosh --eval "show dbs"'
    },
    backup: {
      win32: 'mongodump --out mongodb_backup_$(date +%Y%m%d)',
      linux: 'mongodump --out mongodb_backup_$(date +%Y%m%d)',
      darwin: 'mongodump --out mongodb_backup_$(date +%Y%m%d)',
      default: 'mongodump --out mongodb_backup_$(date +%Y%m%d)'
    },
    restore: {
      win32: 'echo "Restore command: mongorestore backup_directory/"',
      linux: 'echo "Restore command: mongorestore backup_directory/"',
      darwin: 'echo "Restore command: mongorestore backup_directory/"',
      default: 'echo "Restore command: mongorestore backup_directory/"'
    },
    query: {
      win32: 'mongosh --eval "db.version()"',
      linux: 'mongosh --eval "db.version()"',
      darwin: 'mongosh --eval "db.version()"',
      default: 'mongosh --eval "db.version()"'
    },
    info: {
      win32: 'mongosh --eval "db.serverStatus().version"',
      linux: 'mongosh --eval "db.serverStatus().version"',
      darwin: 'mongosh --eval "db.serverStatus().version"',
      default: 'mongosh --eval "db.serverStatus().version"'
    },
    config: {
      win32: 'echo "MongoDB config: C:\\Program Files\\MongoDB\\Server\\X.X\\bin\\mongod.cfg"',
      linux: 'sudo cat /etc/mongod.conf 2>/dev/null || echo "Config file not found"',
      darwin: 'cat /usr/local/etc/mongod.conf 2>/dev/null || echo "Config file not found"',
      default: 'echo "MongoDB configuration"'
    }
  };
  
  return commandMap[action];
}

async function handleRedis(action) {
  const commands = getRedisCommands(action);
  if (commands) {
    await runPlatformCommand(commands, `Redis ${action}`);
  }
}

function getRedisCommands(action) {
  const commandMap = {
    start: {
      win32: 'net start Redis || echo "Redis service not found. Redis on Windows requires Redis for Windows"',
      linux: 'sudo systemctl start redis',
      darwin: 'brew services start redis',
      default: 'echo "Starting Redis service not supported on this platform"'
    },
    stop: {
      win32: 'net stop Redis 2>nul || echo "Redis service not found"',
      linux: 'sudo systemctl stop redis',
      darwin: 'brew services stop redis',
      default: 'echo "Stopping Redis service not supported on this platform"'
    },
    restart: {
      win32: 'net stop Redis 2>nul && net start Redis 2>nul || echo "Redis service not found"',
      linux: 'sudo systemctl restart redis',
      darwin: 'brew services restart redis',
      default: 'echo "Restarting Redis service not supported on this platform"'
    },
    status: {
      win32: 'sc query Redis 2>nul || echo "Redis service not installed"',
      linux: 'sudo systemctl status redis',
      darwin: 'brew services list | grep redis',
      default: 'echo "Redis status not available"'
    },
    connect: {
      win32: 'redis-cli',
      linux: 'redis-cli',
      darwin: 'redis-cli',
      default: 'redis-cli'
    },
    list: {
      win32: 'redis-cli INFO keyspace',
      linux: 'redis-cli INFO keyspace',
      darwin: 'redis-cli INFO keyspace',
      default: 'redis-cli INFO keyspace'
    },
    backup: {
      win32: 'redis-cli SAVE',
      linux: 'sudo redis-cli SAVE',
      darwin: 'redis-cli SAVE',
      default: 'redis-cli SAVE'
    },
    restore: {
      win32: 'echo "Redis restore: Copy dump.rdb to Redis data directory and restart"',
      linux: 'echo "Redis restore: Copy dump.rdb to /var/lib/redis/ and restart"',
      darwin: 'echo "Redis restore: Copy dump.rdb to /usr/local/var/db/redis/ and restart"',
      default: 'echo "Redis restore requires manual file copy"'
    },
    query: {
      win32: 'redis-cli INFO',
      linux: 'redis-cli INFO',
      darwin: 'redis-cli INFO',
      default: 'redis-cli INFO'
    },
    info: {
      win32: 'redis-cli INFO',
      linux: 'redis-cli INFO',
      darwin: 'redis-cli INFO',
      default: 'redis-cli INFO'
    },
    config: {
      win32: 'echo "Redis config: C:\\Program Files\\Redis\\redis.conf"',
      linux: 'sudo cat /etc/redis/redis.conf 2>/dev/null || echo "Config file not found"',
      darwin: 'cat /usr/local/etc/redis.conf 2>/dev/null || echo "Config file not found"',
      default: 'echo "Redis configuration"'
    }
  };
  
  return commandMap[action];
}

async function handleSQLite(action) {
  const commands = getSQLiteCommands(action);
  if (commands) {
    await runPlatformCommand(commands, `SQLite ${action}`);
  }
}

function getSQLiteCommands(action) {
  const commandMap = {
    connect: {
      win32: 'sqlite3',
      linux: 'sqlite3',
      darwin: 'sqlite3',
      default: 'sqlite3'
    },
    list: {
      win32: 'echo ".databases" | sqlite3',
      linux: 'echo ".databases" | sqlite3',
      darwin: 'echo ".databases" | sqlite3',
      default: 'echo ".databases" | sqlite3'
    },
    backup: {
      win32: 'echo "SQLite backup: .backup main backup.db"',
      linux: 'echo "SQLite backup: .backup main backup.db"',
      darwin: 'echo "SQLite backup: .backup main backup.db"',
      default: 'echo "SQLite backup: .backup main backup.db"'
    },
    restore: {
      win32: 'echo "SQLite restore: cp backup.db original.db"',
      linux: 'echo "SQLite restore: cp backup.db original.db"',
      darwin: 'echo "SQLite restore: cp backup.db original.db"',
      default: 'echo "SQLite restore: cp backup.db original.db"'
    },
    query: {
      win32: 'echo "SQLite query: sqlite3 database.db \\"SELECT * FROM table;\\""',
      linux: 'echo "SQLite query: sqlite3 database.db \\"SELECT * FROM table;\\""',
      darwin: 'echo "SQLite query: sqlite3 database.db \\"SELECT * FROM table;\\""',
      default: 'echo "SQLite query: sqlite3 database.db \\"SELECT * FROM table;\\""'
    },
    info: {
      win32: 'sqlite3 --version',
      linux: 'sqlite3 --version',
      darwin: 'sqlite3 --version',
      default: 'sqlite3 --version'
    },
    config: {
      win32: 'echo "SQLite configuration is per database file"',
      linux: 'echo "SQLite configuration is per database file"',
      darwin: 'echo "SQLite configuration is per database file"',
      default: 'echo "SQLite configuration is per database file"'
    }
  };
  
  return commandMap[action];
}

async function handleDockerDatabases(action) {
  const response = await prompts({
    type: 'select',
    name: 'dbType',
    message: 'Select Database Type:',
    choices: [
      { title: '🐬 MySQL (Docker)', value: 'mysql' },
      { title: '🐘 PostgreSQL (Docker)', value: 'postgres' },
      { title: '📊 MongoDB (Docker)', value: 'mongodb' },
      { title: '💎 Redis (Docker)', value: 'redis' },
      { title: '📁 List All Containers', value: 'list_all' },
      { title: '⬅️ Back', value: 'back' }
    ]
  });

  if (!response.dbType || response.dbType === 'back') return;

  if (response.dbType === 'list_all') {
    await listDockerContainers();
    return;
  }

  await handleDockerDatabaseAction(response.dbType, action);
}

async function handleDockerDatabaseAction(dbType, action) {
  const containerName = `${dbType}-container`;
  
  const commandMap = {
    start: {
      default: `docker start ${containerName} 2>/dev/null || echo "Container ${containerName} not found. Create with: docker run --name ${containerName} -e MYSQL_ROOT_PASSWORD=password -d mysql"`
    },
    stop: {
      default: `docker stop ${containerName} 2>/dev/null || echo "Container ${containerName} not found"`
    },
    restart: {
      default: `docker restart ${containerName} 2>/dev/null || echo "Container ${containerName} not found"`
    },
    status: {
      default: `docker ps -a | grep ${containerName} || echo "Container ${containerName} not found"`
    },
    connect: {
      mysql: { default: `docker exec -it ${containerName} mysql -u root -p` },
      postgres: { default: `docker exec -it ${containerName} psql -U postgres` },
      mongodb: { default: `docker exec -it ${containerName} mongosh` },
      redis: { default: `docker exec -it ${containerName} redis-cli` }
    },
    command: {
      default: `echo "Example: docker exec ${containerName} [command]"`
    },
    logs: {
      default: `docker logs ${containerName} 2>/dev/null || echo "Container ${containerName} not found"`
    }
  };

  let command = commandMap[action];
  if (action === 'connect' && command[dbType]) {
    command = command[dbType];
  }

  if (command) {
    await runPlatformCommand(command, `Docker ${dbType} ${action}`);
  }
}

async function listDockerContainers() {
  const command = {
    default: 'docker ps -a --filter "name=mysql\|postgres\|mongo\|redis" --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"'
  };
  
  await runPlatformCommand(command, 'Database Containers');
}

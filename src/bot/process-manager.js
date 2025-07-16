// Менеджер процессов для координации работы бота и веб-приложения
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProcessManager {
  constructor() {
    this.processes = new Map();
    this.isShuttingDown = false;
    this.setupSignalHandlers();
  }

  setupSignalHandlers() {
    // Graceful shutdown on SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      console.log('\n🛑 Получен сигнал завершения (SIGINT)...');
      this.shutdown();
    });

    // Graceful shutdown on SIGTERM
    process.on('SIGTERM', () => {
      console.log('\n🛑 Получен сигнал завершения (SIGTERM)...');
      this.shutdown();
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Необработанное исключение в менеджере процессов:', error);
      this.shutdown(1);
    });
  }

  async startProcess(name, command, args = [], options = {}) {
    if (this.processes.has(name)) {
      console.log(`⚠️ Процесс ${name} уже запущен`);
      return;
    }

    console.log(`🚀 Запуск процесса: ${name}`);
    console.log(`   Команда: ${command} ${args.join(' ')}`);

    const childProcess = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      ...options
    });

    // Store process reference
    this.processes.set(name, {
      process: childProcess,
      name,
      startTime: new Date(),
      restartCount: 0
    });

    // Handle process output
    childProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`[${name}] ${output}`);
      }
    });

    childProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.error(`[${name}] ❌ ${output}`);
      }
    });

    // Handle process exit
    childProcess.on('exit', (code, signal) => {
      const processInfo = this.processes.get(name);
      if (processInfo) {
        console.log(`[${name}] 🔚 Процесс завершен с кодом ${code} (сигнал: ${signal})`);
        
        if (!this.isShuttingDown && code !== 0) {
          console.log(`[${name}] ⚠️ Процесс завершился с ошибкой`);
          
          // Auto-restart logic for critical processes
          if (name === 'TelegramBot' && processInfo.restartCount < 3) {
            console.log(`[${name}] 🔄 Попытка перезапуска (${processInfo.restartCount + 1}/3)...`);
            setTimeout(() => {
              this.restartProcess(name);
            }, 5000);
          }
        }
        
        this.processes.delete(name);
      }
    });

    childProcess.on('error', (error) => {
      console.error(`[${name}] 💥 Ошибка процесса:`, error);
      this.processes.delete(name);
    });

    return childProcess;
  }

  async restartProcess(name) {
    const processInfo = this.processes.get(name);
    if (processInfo) {
      processInfo.restartCount++;
      
      // Kill existing process
      this.stopProcess(name);
      
      // Wait a bit before restart
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Restart based on process type
      if (name === 'TelegramBot') {
        await this.startTelegramBot();
      }
    }
  }

  stopProcess(name) {
    const processInfo = this.processes.get(name);
    if (processInfo) {
      console.log(`🛑 Остановка процесса: ${name}`);
      
      try {
        processInfo.process.kill('SIGTERM');
        
        // Force kill after 10 seconds if not stopped
        setTimeout(() => {
          if (this.processes.has(name)) {
            console.log(`[${name}] ⚡ Принудительная остановка`);
            processInfo.process.kill('SIGKILL');
          }
        }, 10000);
        
      } catch (error) {
        console.error(`[${name}] ❌ Ошибка остановки:`, error);
      }
    }
  }

  async startTelegramBot() {
    const botPath = path.resolve(__dirname, 'index.js');
    
    // Check if bot file exists
    if (!fs.existsSync(botPath)) {
      console.error('❌ Файл бота не найден:', botPath);
      return;
    }

    await this.startProcess('TelegramBot', 'node', [botPath], {
      env: { ...process.env, NODE_ENV: 'production' }
    });
  }

  async startWebApp() {
    const projectRoot = path.resolve(__dirname, '../..');
    
    await this.startProcess('WebApp', 'npm', ['run', 'dev'], {
      cwd: projectRoot,
      env: { ...process.env }
    });
  }

  async startAll() {
    console.log('🌟 ЗАПУСК ESPERANTO-LETO ПЛАТФОРМЫ');
    console.log('=' .repeat(50));
    
    try {
      // Start Telegram Bot
      console.log('\n📱 Запуск Telegram бота...');
      await this.startTelegramBot();
      
      // Wait a bit for bot to initialize
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Start Web Application
      console.log('\n🌐 Запуск веб-приложения...');
      await this.startWebApp();
      
      console.log('\n✅ Все сервисы запущены успешно!');
      console.log('📱 Telegram бот: Активен');
      console.log('🌐 Веб-приложение: http://localhost:5173');
      console.log('\n💡 Для остановки нажмите Ctrl+C');
      
    } catch (error) {
      console.error('❌ Ошибка запуска сервисов:', error);
      this.shutdown(1);
    }
  }

  getStatus() {
    console.log('\n📊 СТАТУС ПРОЦЕССОВ:');
    console.log('=' .repeat(30));
    
    if (this.processes.size === 0) {
      console.log('⚪ Нет активных процессов');
      return;
    }

    for (const [name, info] of this.processes) {
      const uptime = Math.floor((Date.now() - info.startTime.getTime()) / 1000);
      const status = info.process.killed ? '🔴 Остановлен' : '🟢 Активен';
      
      console.log(`${status} ${name}`);
      console.log(`   PID: ${info.process.pid}`);
      console.log(`   Время работы: ${uptime}с`);
      console.log(`   Перезапусков: ${info.restartCount}`);
      console.log('');
    }
  }

  async shutdown(exitCode = 0) {
    if (this.isShuttingDown) {
      return;
    }
    
    this.isShuttingDown = true;
    console.log('\n🔄 Завершение работы всех процессов...');
    
    // Stop all processes
    const stopPromises = Array.from(this.processes.keys()).map(name => {
      return new Promise((resolve) => {
        const processInfo = this.processes.get(name);
        if (processInfo) {
          processInfo.process.on('exit', resolve);
          this.stopProcess(name);
        } else {
          resolve();
        }
      });
    });
    
    // Wait for all processes to stop (max 15 seconds)
    await Promise.race([
      Promise.all(stopPromises),
      new Promise(resolve => setTimeout(resolve, 15000))
    ]);
    
    console.log('✅ Все процессы остановлены');
    console.log('👋 До свидания!');
    
    process.exit(exitCode);
  }
}

// Export for use in other modules
export default ProcessManager;

// If this file is run directly, start all services
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new ProcessManager();
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--status')) {
    manager.getStatus();
  } else if (args.includes('--bot-only')) {
    console.log('🤖 Запуск только Telegram бота...');
    manager.startTelegramBot();
  } else if (args.includes('--webapp-only')) {
    console.log('🌐 Запуск только веб-приложения...');
    manager.startWebApp();
  } else {
    // Start all services by default
    manager.startAll();
  }
}

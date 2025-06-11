const { exec, spawn } = require('child_process');
const http = require('http');

function checkPort(port) {
  console.log(`检查端口 ${port} 是否被占用...`);
  return new Promise(resolve => {
    const req = http.get({ hostname: 'localhost', port, timeout: 1000 }, () => {
      console.log(`端口 ${port} 已被占用`);
      resolve(true);
    });
    req.on('error', () => {
      console.log(`端口 ${port} 未被占用`);
      resolve(false);
    });
    req.end();
  });
}
3
async function killProcessOnPort(port) {
  console.log(`尝试杀掉占用端口 ${port} 的进程...`);
  return new Promise((resolve, reject) => {
    exec(`lsof -ti:${port} | xargs kill -9`, (err) => {
      if (err) {
        console.log(`端口 ${port} 未被占用或 kill 失败: ${err.message}`);
      } else {
        console.log(`已 kill 掉占用端口 ${port} 的进程`);
      }
      resolve();
    });
  });
}

async function waitForServer(port, timeout = 20000) {
  console.log(`等待服务在端口 ${port} 启动，最大等待时间 ${timeout}ms...`);
  const start = Date.now();
  let attempts = 0;
  while (Date.now() - start < timeout) {
    attempts++;
    console.log(`第 ${attempts} 次检查服务是否就绪...`);
    if (await checkPort(port)) {
      console.log(`服务在端口 ${port} 已就绪，耗时 ${Date.now() - start}ms`);
      return true;
    }
    console.log(`服务尚未就绪，等待1秒后重试...`);
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`等待服务超时，总耗时 ${Date.now() - start}ms`);
  return false;
}

(async () => {
  console.log('🚀 开始自动化测试流程...');
  const port = 3000;
  
  console.log('步骤1: 检查端口状态');
  const isRunning = await checkPort(port);

  if (isRunning) {
    console.log(`步骤2: 端口 ${port} 被占用，自动 kill 并重启服务...`);
    await killProcessOnPort(port);
  } else {
    console.log('步骤2: 服务未启动，直接启动 yarn dev...');
  }

  console.log('步骤3: 启动开发服务器...');
  const devProcess = spawn('yarn', ['dev'], { stdio: 'inherit' });

  console.log('步骤4: 等待服务启动...');
  const ready = await waitForServer(port);
  if (!ready) {
    console.error('❌ 服务启动超时，测试终止');
    devProcess.kill();
    process.exit(1);
  }

  console.log('✅ 服务已就绪，准备运行 Playwright 测试...');
  console.log('>>> [LOG] Playwright 测试即将开始');
  // 运行 Playwright 测试
  const testProcess = spawn('npx', ['playwright', 'test'], { stdio: 'inherit' });
  testProcess.on('close', (code) => {
    console.log('>>> [LOG] Playwright 测试已结束');
    if (code !== 0) {
      console.error('❌ 测试执行出错，退出码:', code);
      console.log('🔄 关闭开发服务器...');
      devProcess.kill();
      process.exit(code);
    } else {
      console.log('✅ 测试执行完成');
      console.log('🔄 关闭开发服务器...');
      devProcess.kill();
      process.exit(0);
    }
  });
  testProcess.on('error', (error) => {
    console.error('❌ 测试进程启动失败:', error);
    devProcess.kill();
    process.exit(1);
  });
  console.log('⏳ 测试正在运行中，请等待...');
})(); 
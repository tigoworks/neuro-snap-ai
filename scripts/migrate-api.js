#!/usr/bin/env node

/**
 * API迁移脚本
 * 自动将项目中的API调用从直接fetch转换为使用apiRequest
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const API_PATTERNS = [
  {
    // 匹配: fetch('/api/survey-questions?model=xxx')
    pattern: /fetch\s*\(\s*['"`]\/api\/([^'"`]+)['"`]/g,
    replacement: (match, endpoint) => {
      return `apiRequest('/api/${endpoint}')`;
    }
  },
  {
    // 匹配: fetch('/api/submit-test', {...})
    pattern: /fetch\s*\(\s*['"`]\/api\/([^'"`]+)['"`]\s*,\s*({[^}]+})/g,
    replacement: (match, endpoint, options) => {
      return `apiRequest('/api/${endpoint}', ${options})`;
    }
  }
];

const IMPORT_STATEMENT = "import { apiRequest } from '@/lib/api'";

/**
 * 检查文件是否需要迁移
 */
function needsMigration(content) {
  return /fetch\s*\(\s*['"`]\/api\//.test(content);
}

/**
 * 检查文件是否已有import语句
 */
function hasApiImport(content) {
  return content.includes("import { apiRequest }") || content.includes("await import('@/lib/api')");
}

/**
 * 添加import语句
 */
function addImportStatement(content) {
  // 找到最后一个import语句的位置
  const importLines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i].trim().startsWith('import ') && !importLines[i].includes('//')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    importLines.splice(lastImportIndex + 1, 0, IMPORT_STATEMENT);
  } else {
    // 如果没有import语句，在文件开头添加
    importLines.unshift(IMPORT_STATEMENT);
  }
  
  return importLines.join('\n');
}

/**
 * 应用API模式替换
 */
function applyPatterns(content) {
  let result = content;
  
  API_PATTERNS.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, (match, ...args) => {
      console.log(`  替换: ${match.substring(0, 50)}...`);
      return replacement(match, ...args);
    });
  });
  
  return result;
}

/**
 * 迁移单个文件
 */
function migrateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (!needsMigration(content)) {
    return false;
  }
  
  console.log(`\n🔄 迁移文件: ${filePath}`);
  
  let newContent = content;
  
  // 应用API调用替换
  newContent = applyPatterns(newContent);
  
  // 添加import语句（如果需要）
  if (!hasApiImport(newContent)) {
    console.log('  ➕ 添加import语句');
    newContent = addImportStatement(newContent);
  }
  
  // 写入文件
  fs.writeFileSync(filePath, newContent);
  console.log('  ✅ 迁移完成');
  
  return true;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始API迁移...\n');
  
  // 查找所有需要迁移的文件
  const patterns = [
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}'
  ];
  
  let files = [];
  patterns.forEach(pattern => {
    const matches = glob.sync(pattern, { 
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'] 
    });
    files = files.concat(matches);
  });
  
  // 去重
  files = [...new Set(files)];
  
  console.log(`📁 找到 ${files.length} 个文件待检查`);
  
  let migratedCount = 0;
  
  files.forEach(file => {
    if (migrateFile(file)) {
      migratedCount++;
    }
  });
  
  console.log(`\n✨ 迁移完成！`);
  console.log(`📊 总共迁移了 ${migratedCount} 个文件`);
  
  if (migratedCount > 0) {
    console.log('\n📝 下一步操作:');
    console.log('1. 检查迁移结果');
    console.log('2. 运行测试确保功能正常');
    console.log('3. 创建 .env.local 文件设置 NEXT_PUBLIC_API_BASE_URL');
    console.log('4. 测试新后端API');
  }
}

// 检查是否安装了依赖
try {
  require('glob');
} catch (error) {
  console.error('❌ 缺少依赖: glob');
  console.log('请运行: npm install glob');
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, applyPatterns }; 
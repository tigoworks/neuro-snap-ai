/**
 * API迁移测试
 * 验证API配置和迁移功能
 */

const { applyPatterns } = require('../scripts/migrate-api');

describe('API迁移测试', () => {
  test('应该正确替换简单的API调用', () => {
    const input = `const response = await fetch('/api/survey-questions?model=fiveq')`;
    const expected = `const response = await apiRequest('/api/survey-questions?model=fiveq')`;
    
    const result = applyPatterns(input);
    expect(result).toBe(expected);
  });

  test('应该正确替换带选项的API调用', () => {
    const input = `const response = await fetch('/api/submit-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })`;
    
    const result = applyPatterns(input);
    expect(result).toContain('apiRequest(\'/api/submit-test\'');
  });

  test('不应该替换非API调用', () => {
    const input = `const response = await fetch('https://external-api.com/data')`;
    const result = applyPatterns(input);
    expect(result).toBe(input);
  });
});

describe('API配置测试', () => {
  test('没有环境变量时应该返回原始端点', () => {
    // 模拟没有环境变量的情况
    const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    
    // 这里需要动态导入以获取最新的环境变量
    jest.resetModules();
    const { getApiUrl } = require('../lib/api');
    
    const result = getApiUrl('/api/survey-questions');
    expect(result).toBe('/api/survey-questions');
    
    // 恢复环境变量
    if (originalEnv) {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    }
  });

  test('有环境变量时应该返回完整URL', () => {
    // 设置环境变量
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
    
    jest.resetModules();
    const { getApiUrl } = require('../lib/api');
    
    const result = getApiUrl('/api/survey-questions');
    expect(result).toBe('http://localhost:8080/api/survey-questions');
  });

  test('应该正确处理末尾斜杠', () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080/';
    
    jest.resetModules();
    const { getApiUrl } = require('../lib/api');
    
    const result = getApiUrl('/api/survey-questions');
    expect(result).toBe('http://localhost:8080/api/survey-questions');
  });
}); 
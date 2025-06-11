// API配置文件
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * 获取完整的API URL
 * @param endpoint API端点，如 '/api/survey-questions'
 * @returns 完整的API URL
 */
export function getApiUrl(endpoint: string): string {
  // 如果有配置的基础URL，使用外部API
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`;
  }
  
  // 否则使用本地API路由
  return endpoint;
}

/**
 * 封装的fetch函数，自动处理API URL
 * @param endpoint API端点
 * @param options fetch选项
 * @returns Promise<Response>
 */
export async function apiRequest(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(endpoint);
  
  console.log(`API请求: ${url}`);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API请求错误 [${url}]:`, error);
    throw error;
  }
} 
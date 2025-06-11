// 简化的API配置文件
// 现在统一使用backend-api.ts中的SDK，这个文件保留作为备用

/**
 * @deprecated 建议使用 lib/backend-api.ts 中的 SDK
 * 这个文件保留仅用于向后兼容
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function getApiUrl(endpoint: string): string {
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`;
  }
  return endpoint;
}

export async function apiRequest(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }
  
  return response;
} 
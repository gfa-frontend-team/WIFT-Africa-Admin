// Environment variables with type safety
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  apiVersion: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'WIFT Africa Admin',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const

// Construct full API base URL
export const API_BASE_URL = `${env.apiUrl}/api/${env.apiVersion}`

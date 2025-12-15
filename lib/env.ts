// Environment variables with validation

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue
  
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  
  return value
}

export const env = {
  // API Configuration
  API_URL: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:3001/api/v1'),
  API_VERSION: getEnvVar('NEXT_PUBLIC_API_VERSION', 'v1'),
  
  // App Configuration
  APP_NAME: getEnvVar('NEXT_PUBLIC_APP_NAME', 'WIFT Africa Admin'),
  APP_URL: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3002'),
} as const

export type Env = typeof env

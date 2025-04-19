// This file represents the development environment configuration
export const environment = {
  production: false,
  appName: 'Project Management App',
  version: '1.0.0',
  tokenExpiryTime: 3600, // in seconds
  USER_SERVICE_URL: 'http://localhost:1010/api',
  PROJECT_SERVICE_URL: 'http://localhost:8000/api',
  BILLING_SERVICE_URL: 'http://localhost:6060/api'
}; 
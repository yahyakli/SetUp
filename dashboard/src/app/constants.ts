import { environment } from '../environments/environment';

export const APP_CONSTANTS = {
  APP_NAME: environment.appName,
  VERSION: environment.version,
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'current_user',
  TOKEN_EXPIRY_TIME: environment.tokenExpiryTime,
  USER_SERVICE_URL: environment.USER_SERVICE_URL,
  PROJECT_SERVICE_URL: environment.PROJECT_SERVICE_URL,
  BILLING_SERVICE_URL: environment.BILLING_SERVICE_URL
};
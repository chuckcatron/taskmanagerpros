import { CognitoUserPool } from 'amazon-cognito-identity-js';

// Cognito configuration from environment variables
export const cognitoConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || '',
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
};

// Validate configuration
export function validateCognitoConfig() {
  const missing: string[] = [];

  if (!cognitoConfig.region) missing.push('NEXT_PUBLIC_AWS_REGION');
  if (!cognitoConfig.userPoolId) missing.push('NEXT_PUBLIC_COGNITO_USER_POOL_ID');
  if (!cognitoConfig.clientId) missing.push('NEXT_PUBLIC_COGNITO_CLIENT_ID');

  if (missing.length > 0) {
    throw new Error(
      `Missing required Cognito configuration: ${missing.join(', ')}. ` +
      'Please check your .env.local file.'
    );
  }
}

// Lazy-load Cognito User Pool to avoid build-time errors
let _userPool: CognitoUserPool | null = null;

export function getUserPool(): CognitoUserPool {
  if (!_userPool) {
    // Only create pool if credentials are actually set (not placeholders)
    if (
      cognitoConfig.userPoolId &&
      cognitoConfig.userPoolId !== 'your-user-pool-id' &&
      cognitoConfig.clientId &&
      cognitoConfig.clientId !== 'your-client-id'
    ) {
      _userPool = new CognitoUserPool({
        UserPoolId: cognitoConfig.userPoolId,
        ClientId: cognitoConfig.clientId,
      });
    } else {
      throw new Error(
        'Cognito configuration not set. Please update your .env.local file with valid credentials.'
      );
    }
  }
  return _userPool;
}

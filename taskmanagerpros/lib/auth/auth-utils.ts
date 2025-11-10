import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  ISignUpResult,
} from 'amazon-cognito-identity-js';
import { getUserPool } from './cognito-config';

export interface SignUpParams {
  email: string;
  password: string;
  name?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface ConfirmResetPasswordParams {
  email: string;
  code: string;
  newPassword: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Sign up a new user with Cognito
 */
export async function signUp({ email, password, name }: SignUpParams): Promise<AuthResult> {
  return new Promise((resolve) => {
    const attributeList: CognitoUserAttribute[] = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
    ];

    if (name) {
      attributeList.push(
        new CognitoUserAttribute({
          Name: 'name',
          Value: name,
        })
      );
    }

    const pool = getUserPool();
    pool.signUp(email, password, attributeList, [], (err, result: ISignUpResult | undefined) => {
      if (err) {
        resolve({
          success: false,
          message: err.message || 'Sign up failed',
        });
        return;
      }

      resolve({
        success: true,
        message: 'Sign up successful. Please check your email for verification.',
        data: {
          userSub: result?.userSub,
          userConfirmed: result?.userConfirmed,
        },
      });
    });
  });
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: SignInParams): Promise<AuthResult> {
  return new Promise((resolve) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const pool = getUserPool();
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: pool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        resolve({
          success: true,
          message: 'Sign in successful',
          data: {
            accessToken: session.getAccessToken().getJwtToken(),
            idToken: session.getIdToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
          },
        });
      },
      onFailure: (err) => {
        resolve({
          success: false,
          message: err.message || 'Sign in failed',
        });
      },
      newPasswordRequired: () => {
        resolve({
          success: false,
          message: 'New password required. Please reset your password.',
        });
      },
    });
  });
}

/**
 * Sign out the current user
 */
export function signOut(): Promise<AuthResult> {
  return new Promise((resolve) => {
    const pool = getUserPool();
    const cognitoUser = pool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.signOut();
      resolve({
        success: true,
        message: 'Sign out successful',
      });
    } else {
      resolve({
        success: false,
        message: 'No user is currently signed in',
      });
    }
  });
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<CognitoUser | null> {
  return new Promise((resolve) => {
    const pool = getUserPool();
    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: any) => {
      if (err || !session.isValid()) {
        resolve(null);
        return;
      }

      resolve(cognitoUser);
    });
  });
}

/**
 * Get the current user's session
 */
export async function getSession(): Promise<any> {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error('No user is currently signed in'));
      return;
    }

    cognitoUser.getSession((err: Error | null, session: any) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(session);
    });
  });
}

/**
 * Initiate password reset
 */
export async function forgotPassword({ email }: ResetPasswordParams): Promise<AuthResult> {
  return new Promise((resolve) => {
    const pool = getUserPool();
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: pool,
    });

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve({
          success: true,
          message: 'Password reset code sent to your email',
        });
      },
      onFailure: (err) => {
        resolve({
          success: false,
          message: err.message || 'Password reset failed',
        });
      },
    });
  });
}

/**
 * Confirm password reset with code
 */
export async function confirmPassword({
  email,
  code,
  newPassword,
}: ConfirmResetPasswordParams): Promise<AuthResult> {
  return new Promise((resolve) => {
    const pool = getUserPool();
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: pool,
    });

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve({
          success: true,
          message: 'Password reset successful',
        });
      },
      onFailure: (err) => {
        resolve({
          success: false,
          message: err.message || 'Password confirmation failed',
        });
      },
    });
  });
}

/**
 * Get user attributes
 */
export async function getUserAttributes(): Promise<Record<string, string> | null> {
  return new Promise((resolve) => {
    const pool = getUserPool();
    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: any) => {
      if (err || !session.isValid()) {
        resolve(null);
        return;
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err || !attributes) {
          resolve(null);
          return;
        }

        const attributeMap: Record<string, string> = {};
        attributes.forEach((attribute) => {
          attributeMap[attribute.Name] = attribute.Value;
        });

        resolve(attributeMap);
      });
    });
  });
}

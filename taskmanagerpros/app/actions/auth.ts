'use server';

import { redirect } from 'next/navigation';
import { setSessionCookie, deleteSessionCookie } from '@/lib/auth/session';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoConfig } from '@/lib/auth/cognito-config';

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: cognitoConfig.region,
});

interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Sign up a new user
 */
export async function signUpAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  // Validation
  const errors: Record<string, string[]> = {};

  if (!email || !email.includes('@')) {
    errors.email = ['Please enter a valid email address'];
  }

  if (!password || password.length < 8) {
    errors.password = ['Password must be at least 8 characters long'];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Validation failed',
      errors,
    };
  }

  try {
    const command = new SignUpCommand({
      ClientId: cognitoConfig.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        ...(name
          ? [
              {
                Name: 'name',
                Value: name,
              },
            ]
          : []),
      ],
    });

    const response = await cognitoClient.send(command);

    return {
      success: true,
      message: 'Sign up successful! Please check your email for verification.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Sign up failed. Please try again.',
    };
  }
}

/**
 * Sign in an existing user
 */
export async function signInAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validation
  const errors: Record<string, string[]> = {};

  if (!email || !email.includes('@')) {
    errors.email = ['Please enter a valid email address'];
  }

  if (!password) {
    errors.password = ['Password is required'];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Validation failed',
      errors,
    };
  }

  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: cognitoConfig.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      return {
        success: false,
        message: 'Authentication failed',
      };
    }

    const { IdToken, AccessToken } = response.AuthenticationResult;

    // Decode the ID token to get user information
    if (IdToken) {
      const tokenParts = IdToken.split('.');
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

      // Set session cookie
      await setSessionCookie({
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
      });
    }

    redirect('/dashboard');
  } catch (error: any) {
    if (error.name === 'NEXT_REDIRECT') {
      throw error;
    }

    return {
      success: false,
      message: error.message || 'Sign in failed. Please check your credentials.',
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOutAction(): Promise<void> {
  await deleteSessionCookie();
  redirect('/');
}

/**
 * Initiate password reset
 */
export async function forgotPasswordAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get('email') as string;

  // Validation
  if (!email || !email.includes('@')) {
    return {
      success: false,
      message: 'Please enter a valid email address',
      errors: {
        email: ['Please enter a valid email address'],
      },
    };
  }

  try {
    const command = new ForgotPasswordCommand({
      ClientId: cognitoConfig.clientId,
      Username: email,
    });

    await cognitoClient.send(command);

    return {
      success: true,
      message: 'Password reset code sent to your email',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Password reset failed. Please try again.',
    };
  }
}

/**
 * Confirm password reset with verification code
 */
export async function confirmPasswordAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const code = formData.get('code') as string;
  const newPassword = formData.get('newPassword') as string;

  // Validation
  const errors: Record<string, string[]> = {};

  if (!email || !email.includes('@')) {
    errors.email = ['Please enter a valid email address'];
  }

  if (!code) {
    errors.code = ['Verification code is required'];
  }

  if (!newPassword || newPassword.length < 8) {
    errors.newPassword = ['Password must be at least 8 characters long'];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Validation failed',
      errors,
    };
  }

  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: cognitoConfig.clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await cognitoClient.send(command);

    return {
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Password confirmation failed. Please try again.',
    };
  }
}

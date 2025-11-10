# AWS Cognito Authentication Setup

This project uses AWS Cognito for user authentication with Next.js 15 App Router.

## Features

- Email/password sign-up and sign-in
- Password reset functionality
- Protected routes with middleware
- Session management using JWT
- Server-side authentication state in server components and server actions

## Prerequisites

1. An AWS account
2. A Cognito User Pool configured

## AWS Cognito Setup

### 1. Create a Cognito User Pool

1. Go to the [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Click "Create user pool"
3. Choose the following options:
   - **Authentication providers**: Cognito user pool
   - **Cognito user pool sign-in options**: Email
   - **Password policy**: Default or customize as needed
   - **Multi-factor authentication (MFA)**: Optional (recommended: Optional MFA)
   - **User account recovery**: Email only
   - **Self-service sign-up**: Enable
   - **Attribute verification**: Email
   - **Required attributes**: email, name (optional)
   - **Email provider**: Use Cognito's default email service (or configure SES)

4. Create an App Client:
   - **App type**: Public client
   - **App client name**: Choose a name (e.g., "taskmanagerpros-web")
   - **Authentication flows**:
     - ✅ ALLOW_USER_PASSWORD_AUTH
     - ✅ ALLOW_REFRESH_TOKEN_AUTH
   - **Don't generate a client secret** (for client-side apps)

5. Note the following values:
   - User Pool ID (format: `us-east-1_xxxxxxxxx`)
   - App Client ID
   - AWS Region

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Cognito details:
   ```env
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
   NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
   SESSION_SECRET=your-session-secret-key-at-least-32-characters-long
   ```

3. Generate a secure session secret:
   ```bash
   openssl rand -base64 32
   ```

## Project Structure

```
app/
├── actions/
│   └── auth.ts              # Server actions for authentication
├── auth/
│   ├── signin/
│   │   └── page.tsx         # Sign-in page
│   ├── signup/
│   │   └── page.tsx         # Sign-up page
│   └── forgot-password/
│       └── page.tsx         # Password reset page
├── dashboard/
│   └── page.tsx             # Protected dashboard page
└── page.tsx                 # Home page

lib/
└── auth/
    ├── cognito-config.ts    # Cognito configuration
    ├── auth-utils.ts        # Client-side auth utilities
    └── session.ts           # Server-side session management

middleware.ts                # Route protection middleware
```

## Authentication Flow

### Sign Up

1. User visits `/auth/signup`
2. User enters email, password, and optional name
3. Cognito sends verification email
4. User verifies email via link in email

### Sign In

1. User visits `/auth/signin`
2. User enters email and password
3. Server action authenticates with Cognito
4. Session cookie is created with JWT
5. User is redirected to `/dashboard`

### Password Reset

1. User visits `/auth/forgot-password`
2. User enters email
3. Cognito sends verification code to email
4. User enters code and new password
5. Password is updated in Cognito

### Sign Out

1. User clicks "Sign out"
2. Session cookie is deleted
3. User is redirected to home page

## Protected Routes

Routes are protected using Next.js middleware (`middleware.ts`):

- `/dashboard/*` - Requires authentication
- `/auth/signin` - Redirects to dashboard if already authenticated
- `/auth/signup` - Redirects to dashboard if already authenticated

## Usage in Components

### Server Components

```tsx
import { getCurrentUserFromSession } from '@/lib/auth/session';

export default async function MyPage() {
  const user = await getCurrentUserFromSession();

  if (!user) {
    return <p>Not authenticated</p>;
  }

  return <p>Welcome, {user.email}!</p>;
}
```

### Server Actions

```tsx
import { getCurrentUserFromSession } from '@/lib/auth/session';

export async function myAction() {
  'use server';

  const user = await getCurrentUserFromSession();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Perform action...
}
```

## Testing

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables (see above)

3. Run development server:
   ```bash
   pnpm dev
   ```

4. Test the authentication flow:
   - Visit `http://localhost:3000`
   - Click "Sign up" and create an account
   - Check your email for verification
   - Sign in with your credentials
   - Access the dashboard
   - Sign out

## Security Considerations

- Session tokens are encrypted using JWT with HS256 algorithm
- Session cookies are httpOnly and secure in production
- Passwords are validated with minimum length requirements
- All authentication flows use server actions (server-side only)
- Protected routes are enforced by middleware

## Troubleshooting

### "Missing required Cognito configuration" Error

Ensure all environment variables in `.env.local` are set correctly:
- `NEXT_PUBLIC_AWS_REGION`
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- `SESSION_SECRET`

### "NotAuthorizedException" Error

This usually means:
- Incorrect email/password
- User not confirmed (check email for verification)
- User doesn't exist in the Cognito User Pool

### Email Not Received

- Check spam folder
- Verify SES is configured correctly (if using custom email)
- Check Cognito User Pool email settings

### Build Errors

Run type checking:
```bash
pnpm build
```

## Additional Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/building-your-application/authentication)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

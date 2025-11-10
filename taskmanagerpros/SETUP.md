# Task Manager Pro - Setup Guide

## Prerequisites

- Node.js 18+ and pnpm
- AWS Account
- AWS CLI configured (optional, for local development)

## Environment Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required environment variables in `.env.local`:

   - `NEXT_PUBLIC_AWS_REGION`: Your AWS region (e.g., `us-east-1`)
   - `NEXT_PUBLIC_COGNITO_USER_POOL_ID`: Your Cognito User Pool ID
   - `NEXT_PUBLIC_COGNITO_CLIENT_ID`: Your Cognito App Client ID
   - `NEXT_PUBLIC_COGNITO_DOMAIN`: Your Cognito domain
   - `DYNAMODB_USERS_TABLE`: Name of the DynamoDB Users table (default: `TaskManagerPro-Users`)
   - `SESSION_SECRET`: A random secret string for JWT encryption (generate with `openssl rand -base64 32`)

## AWS Infrastructure Setup

### 1. Create Cognito User Pool

If you haven't already set up a Cognito User Pool:

1. Go to AWS Console → Cognito
2. Create a User Pool with the following settings:
   - Sign-in options: Email
   - Password policy: Your preference
   - MFA: Optional
   - User attributes: email (required), name (optional)
3. Create an App Client:
   - App type: Public client
   - Authentication flows: `ALLOW_USER_PASSWORD_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH`
   - Don't generate a client secret (public client)

### 2. Create DynamoDB Tables

Run the setup script to create the required DynamoDB tables:

```bash
pnpm ts-node scripts/create-dynamodb-tables.ts
```

Or create the table manually:

- **Table Name**: `TaskManagerPro-Users` (or your custom name)
- **Partition Key**: `userId` (String)
- **Global Secondary Index**:
  - Name: `EmailIndex`
  - Partition Key: `email` (String)
  - Projection: All attributes

## Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run the development server:

   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Testing Authentication

1. Go to `/auth/signup` to create a new account
2. Check your email for the verification code (if configured)
3. Sign in at `/auth/signin`
4. You'll be redirected to `/app` (dashboard)

## Application Routes

- `/` - Landing page
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/auth/forgot-password` - Password reset flow
- `/app` - Dashboard (protected route)
- `/app/profile` - User profile page (protected route)

## Protected Routes

The following routes require authentication:

- `/app/*` - All app routes
- `/dashboard` - Legacy dashboard route

If you try to access these routes without being logged in, you'll be redirected to `/auth/signin`.

## User Data Flow

1. User signs up via Cognito
2. User signs in
3. On successful sign-in:
   - User record is created/retrieved from DynamoDB
   - Session cookie is set with JWT
   - User is redirected to `/app`

## Development

Build the application:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

Lint the code:

```bash
pnpm lint
```

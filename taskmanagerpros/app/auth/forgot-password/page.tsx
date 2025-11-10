'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction, confirmPasswordAction } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');

  const [requestState, requestFormAction, isRequestPending] = useActionState(
    forgotPasswordAction,
    null
  );
  const [confirmState, confirmFormAction, isConfirmPending] = useActionState(
    confirmPasswordAction,
    null
  );

  // If password reset code was sent successfully, move to confirm step
  if (requestState?.success && step === 'request') {
    setStep('confirm');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'request' ? 'Reset your password' : 'Enter verification code'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              return to sign in
            </Link>
          </p>
        </div>

        {step === 'request' ? (
          <form className="mt-8 space-y-6" action={requestFormAction}>
            {requestState?.message && (
              <div
                className={`rounded-md p-4 ${
                  requestState.success
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                <p className="text-sm">{requestState.message}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {requestState?.errors?.email && (
                <p className="mt-1 text-sm text-red-600">
                  {requestState.errors.email[0]}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isRequestPending}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequestPending ? 'Sending code...' : 'Send reset code'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" action={confirmFormAction}>
            {confirmState?.message && (
              <div
                className={`rounded-md p-4 ${
                  confirmState.success
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                <p className="text-sm">{confirmState.message}</p>
              </div>
            )}

            <input type="hidden" name="email" value={email} />

            <div className="space-y-4">
              <div>
                <label htmlFor="code" className="sr-only">
                  Verification code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter verification code"
                />
                {confirmState?.errors?.code && (
                  <p className="mt-1 text-sm text-red-600">
                    {confirmState.errors.code[0]}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="sr-only">
                  New password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="New password (min. 8 characters)"
                />
                {confirmState?.errors?.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {confirmState.errors.newPassword[0]}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isConfirmPending}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConfirmPending ? 'Resetting password...' : 'Reset password'}
              </button>
            </div>

            {confirmState?.success && (
              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Return to sign in
                </Link>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

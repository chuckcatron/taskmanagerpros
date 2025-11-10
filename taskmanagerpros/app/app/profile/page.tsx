import { redirect } from 'next/navigation';
import { getCurrentUserFromSession } from '@/lib/auth/session';
import { getUser } from '@/lib/db/user-service';
import Link from 'next/link';

export default async function ProfilePage() {
  // Get session from cookie
  const session = await getCurrentUserFromSession();

  // Redirect to sign-in if not authenticated
  if (!session) {
    redirect('/auth/signin');
  }

  // Get user data from DynamoDB
  const user = await getUser(session.userId);

  // Use session data as fallback if user not in DB yet
  const userData = {
    name: user?.name || session.name || 'Not provided',
    email: user?.email || session.email,
    accountType: user?.accountType || 'individual',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Profile
            </h1>
            <Link
              href="/app"
              className="text-gray-700 hover:text-gray-900"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
          <h2 className="text-xl font-semibold text-gray-900">
            User Information
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="mt-1 text-base text-gray-900">{userData.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-base text-gray-900">{userData.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <p className="mt-1 text-base capitalize text-gray-900">
                {userData.accountType}
              </p>
            </div>
          </div>

          {user && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-500">
                Account Details
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-gray-700">User ID</dt>
                  <dd className="mt-1 font-mono text-xs text-gray-600">
                    {user.userId}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Created</dt>
                  <dd className="mt-1 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Last Updated</dt>
                  <dd className="mt-1 text-gray-600">
                    {new Date(user.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

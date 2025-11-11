import { redirect } from 'next/navigation';
import { getCurrentUserFromSession } from '@/lib/auth/session';
import { getUser } from '@/lib/db/user-service';
import { signOutAction } from '@/app/actions/auth';
import Link from 'next/link';

export default async function AppDashboard() {
  // Get session from cookie
  const session = await getCurrentUserFromSession();

  // Redirect to sign-in if not authenticated (belt and suspenders with middleware)
  if (!session) {
    redirect('/auth/signin');
  }

  // Get user data from DynamoDB
  const user = await getUser(session.userId);

  // If user doesn't exist in DB (shouldn't happen but handle it)
  const displayName = user?.name || session.name || 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
            <nav className="flex gap-4">
              <Link
                href="/app/profile"
                className="text-gray-700 hover:text-gray-900"
              >
                Profile
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome, {displayName}
          </h2>
          <p className="mt-2 text-gray-600">
            You are successfully logged in to Task Manager Pro.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Tasks</h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your tasks and projects
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">0</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Projects</h3>
              <p className="mt-1 text-sm text-gray-500">
                View all your projects
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">0</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Completed</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tasks you have completed
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

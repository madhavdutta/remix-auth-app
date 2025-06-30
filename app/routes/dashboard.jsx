import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { requireUserId } from "../lib/auth.server.js";

export const loader = async ({ request }) => {
  const userId = await requireUserId(request);
  return json({ userId });
};

export default function Dashboard() {
  const { userId } = useLoaderData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to your Dashboard!
              </h1>
              <p className="text-gray-600 mb-8">
                You are successfully signed in. User ID: {userId}
              </p>
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

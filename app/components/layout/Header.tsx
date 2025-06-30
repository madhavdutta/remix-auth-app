import { Form, Link } from "@remix-run/react";
import { Button } from "~/components/ui/Button";
import { getInitials } from "~/lib/utils";

interface HeaderProps {
  user?: {
    id: string;
    email?: string;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Your App
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Profile
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.avatar_url ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.avatar_url}
                      alt={user.full_name || user.email || "User"}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(user.full_name || user.email || "U")}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user.full_name || user.email}
                  </span>
                </div>
                <Form method="post" action="/logout">
                  <Button type="submit" variant="outline" size="sm">
                    Sign Out
                  </Button>
                </Form>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

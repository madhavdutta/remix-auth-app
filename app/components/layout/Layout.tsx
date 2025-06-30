import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  user?: {
    id: string;
    email?: string;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

export function Layout({ children, user }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main>{children}</main>
    </div>
  );
}

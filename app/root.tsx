import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  LiveReload,
  useLoaderData,
} from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Toaster } from "react-hot-toast";
import { Layout } from "~/components/layout/Layout";
import { getUserProfile } from "~/lib/auth.server";
import "./tailwind.css";

export const meta = () => [
  { charset: "utf-8" },
  { name: "viewport", content: "width=device-width,initial-scale=1" },
  { title: "Remix Supabase Boilerplate" },
  { name: "description", content: "A comprehensive Remix + Supabase authentication boilerplate" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const profile = await getUserProfile(request);
    return json({ user: profile });
  } catch {
    return json({ user: null });
  }
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <Layout user={user}>
          <Outlet />
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

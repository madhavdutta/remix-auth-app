import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { supabase, supabaseAdmin } from "./supabase.server";
import type { Database } from "~/types/database.types";

const sessionSecret = process.env.SESSION_SECRET || "your-session-secret-key-here-change-in-production";

const storage = createCookieSessionStorage({
  cookie: {
    name: "remix_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

export async function createUserSession(
  userId: string,
  accessToken: string,
  refreshToken: string,
  redirectTo: string
) {
  const session = await storage.getSession();
  session.set("userId", userId);
  session.set("accessToken", accessToken);
  session.set("refreshToken", refreshToken);
  
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request): Promise<string | null> {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function getAccessToken(request: Request): Promise<string | null> {
  const session = await getUserSession(request);
  const accessToken = session.get("accessToken");
  if (!accessToken || typeof accessToken !== "string") return null;
  return accessToken;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<string> {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/signin?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  const accessToken = await getAccessToken(request);
  
  if (!accessToken) {
    throw await logout(request);
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error || !user) {
      throw await logout(request);
    }

    return user;
  } catch {
    throw await logout(request);
  }
}

export async function getUserProfile(request: Request) {
  const user = await requireUser(request);
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return profile;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  const accessToken = session.get("accessToken");
  
  // Sign out from Supabase if we have a token
  if (accessToken) {
    try {
      await supabaseAdmin.auth.signOut();
    } catch (error) {
      console.error('Error signing out from Supabase:', error);
    }
  }
  
  return redirect("/signin", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function refreshUserSession(request: Request) {
  const session = await getUserSession(request);
  const refreshToken = session.get("refreshToken");
  
  if (!refreshToken) {
    throw await logout(request);
  }

  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw await logout(request);
    }

    return createUserSession(
      data.user.id,
      data.session.access_token,
      data.session.refresh_token,
      new URL(request.url).pathname
    );
  } catch {
    throw await logout(request);
  }
}

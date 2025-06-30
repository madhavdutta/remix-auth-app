import { redirect } from "@remix-run/node";
import { logout } from "../lib/auth.server.js";

export const action = async ({ request }) => {
  return logout(request);
};

export const loader = async ({ request }) => {
  return logout(request);
};

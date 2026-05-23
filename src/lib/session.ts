import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId:    string;
  email:     string;
  name:      string;
  role:      string;
  isLoggedIn: boolean;
}

// In production, SESSION_SECRET must be set — refuse to start without it
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET env var is not set. Refusing to start in production.");
}

export const sessionOptions: SessionOptions = {
  password:   sessionSecret ?? "zippy-dev-only-32char-not-for-production!!",
  cookieName: "zippy_session",
  cookieOptions: {
    secure:   process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",          // blocks cross-site request forgery
    maxAge:   60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

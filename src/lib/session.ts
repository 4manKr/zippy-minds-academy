import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId:    string;
  email:     string;
  name:      string;
  role:      string;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "zippy-minds-super-secret-key-change-in-prod",
  cookieName: "zippy_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role     = searchParams.get("role")     ?? "PARENT";
  const redirect = searchParams.get("redirect") ?? "";

  const clientId    = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  // Encode role + redirect so we can read them back in the callback
  const state = Buffer.from(JSON.stringify({ role, redirect })).toString("base64url");

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id",     clientId);
  googleUrl.searchParams.set("redirect_uri",  redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope",         "openid email profile");
  googleUrl.searchParams.set("access_type",   "offline");
  googleUrl.searchParams.set("prompt",        "select_account");
  googleUrl.searchParams.set("state",         state);

  return NextResponse.redirect(googleUrl.toString());
}

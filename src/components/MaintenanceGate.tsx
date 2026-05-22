import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import MaintenancePage from "@/app/maintenance/page";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Server component — wraps every page.
 * If maintenance mode is ON in the DB, shows the maintenance page to
 * everyone except admins (who can still access the site to turn it off).
 */
export default async function MaintenanceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore(); // never cache — always read fresh from DB
  try {
    // Read maintenance setting directly from DB
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "maintenanceMode" },
    });

    if (setting?.value !== "true") {
      // Maintenance OFF — show site normally
      return <>{children}</>;
    }

    // Maintenance ON — check if current user is an admin
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (session.isLoggedIn && session.role === "ADMIN") {
      // Admins always pass through so they can disable maintenance
      return <>{children}</>;
    }

    // Everyone else sees the maintenance page
    return <MaintenancePage />;
  } catch {
    // If the DB check fails, show the site normally (fail open)
    return <>{children}</>;
  }
}

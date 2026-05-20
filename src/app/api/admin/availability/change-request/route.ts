import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import {
  sendAvailabilityChangeRequestEmail,
  sendAvailabilityAdminAlert,
  sendAvailabilityAppliedEmail,
} from "@/lib/emails";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.zippymindsacademy.com";

// GET — all change requests (admin only)
export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.availabilityChangeRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

// POST — create a new change request
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tutorId, tutorName, monthYear, proposedSlots, reason = "" } = body as {
    tutorId: string;
    tutorName: string;
    monthYear: string;
    proposedSlots: Record<string, string[]>;
    reason?: string;
  };

  if (!tutorId || !tutorName || !monthYear || !proposedSlots) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Find existing availability
  const existing = await prisma.tutorMonthlyAvailability.findFirst({
    where: { tutorId, monthYear },
  });

  const currentSlots: Record<string, string[]> = existing
    ? (JSON.parse(existing.slots) as Record<string, string[]>)
    : {};

  // Find confirmed bookings for this tutor
  const confirmedBookings = await prisma.booking.findMany({
    where: { tutorName, status: "CONFIRMED" },
  });

  // Unique parents
  const parentMap = new Map<string, string>();
  for (const booking of confirmedBookings) {
    if (booking.parentEmail && !parentMap.has(booking.parentEmail)) {
      parentMap.set(booking.parentEmail, booking.parentName);
    }
  }

  // Build parentApprovals
  const parentApprovals: Record<string, { name: string; token: string; status: string }> = {};
  for (const [email, name] of parentMap) {
    const token = crypto.randomBytes(32).toString("hex");
    parentApprovals[email] = { name, token, status: "pending" };
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const changeRequest = await prisma.availabilityChangeRequest.create({
    data: {
      tutorId,
      tutorName,
      monthYear,
      currentSlots: JSON.stringify(currentSlots),
      proposedSlots: JSON.stringify(proposedSlots),
      reason,
      status: parentMap.size === 0 ? "ALL_APPROVED" : "PENDING_PARENT",
      parentApprovals: JSON.stringify(parentApprovals),
      adminId: session.userId,
      adminName: session.name,
      expiresAt,
    },
  });

  // Fire emails to each parent
  for (const [email, info] of Object.entries(parentApprovals)) {
    const approveUrl = `${BASE_URL}/api/availability/respond?token=${info.token}&action=approve`;
    const rejectUrl  = `${BASE_URL}/api/availability/respond?token=${info.token}&action=reject`;
    void sendAvailabilityChangeRequestEmail({
      parentName: info.name,
      parentEmail: email,
      tutorName,
      monthYear,
      currentSlots,
      proposedSlots,
      reason,
      approveUrl,
      rejectUrl,
      expiresAt,
    });
  }

  // Notify admin
  void sendAvailabilityAdminAlert({
    tutorName,
    monthYear,
    parentCount: parentMap.size,
    requestId: changeRequest.id,
  });

  return NextResponse.json({ request: changeRequest });
}

// PATCH — apply an approved change request
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId } = await req.json() as { requestId: string };
  if (!requestId) {
    return NextResponse.json({ error: "requestId is required" }, { status: 400 });
  }

  const changeRequest = await prisma.availabilityChangeRequest.findUnique({
    where: { id: requestId },
  });

  if (!changeRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (changeRequest.status !== "ALL_APPROVED") {
    return NextResponse.json({ error: "Cannot apply — not all parents have approved" }, { status: 400 });
  }

  const proposedSlots = JSON.parse(changeRequest.proposedSlots) as Record<string, string[]>;

  // Update the availability record
  const existing = await prisma.tutorMonthlyAvailability.findFirst({
    where: { tutorId: changeRequest.tutorId, monthYear: changeRequest.monthYear },
  });

  if (existing) {
    await prisma.tutorMonthlyAvailability.update({
      where: { id: existing.id },
      data: { slots: changeRequest.proposedSlots, isLocked: true },
    });
  } else {
    await prisma.tutorMonthlyAvailability.create({
      data: {
        tutorId: changeRequest.tutorId,
        tutorName: changeRequest.tutorName,
        monthYear: changeRequest.monthYear,
        slots: changeRequest.proposedSlots,
        isLocked: true,
      },
    });
  }

  // Mark request as applied
  const updatedRequest = await prisma.availabilityChangeRequest.update({
    where: { id: requestId },
    data: { status: "APPLIED" },
  });

  // Notify all parents
  const parentApprovals = JSON.parse(changeRequest.parentApprovals) as Record<
    string,
    { name: string; token: string; status: string }
  >;
  for (const [email, info] of Object.entries(parentApprovals)) {
    void sendAvailabilityAppliedEmail({
      parentName: info.name,
      parentEmail: email,
      tutorName: changeRequest.tutorName,
      monthYear: changeRequest.monthYear,
      newSlots: proposedSlots,
    });
  }

  return NextResponse.json({ request: updatedRequest });
}

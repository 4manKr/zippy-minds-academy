import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendParentResponseAlertToAdmin } from "@/lib/emails";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.zippymindsacademy.com";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token  = searchParams.get("token");
  const action = searchParams.get("action") as "approve" | "reject" | null;

  if (!token || (action !== "approve" && action !== "reject")) {
    return NextResponse.redirect(`${BASE_URL}/availability/responded?action=invalid`);
  }

  // Find the change request that contains this token
  const allRequests = await prisma.availabilityChangeRequest.findMany({
    where: { status: { in: ["PENDING_PARENT", "ALL_APPROVED", "ANY_REJECTED"] } },
  });

  let targetRequest: (typeof allRequests)[0] | null = null;
  let parentEmail: string | null = null;

  for (const req of allRequests) {
    const approvals = JSON.parse(req.parentApprovals) as Record<
      string,
      { name: string; token: string; status: string }
    >;
    for (const [email, info] of Object.entries(approvals)) {
      if (info.token === token) {
        targetRequest = req;
        parentEmail = email;
        break;
      }
    }
    if (targetRequest) break;
  }

  if (!targetRequest || !parentEmail) {
    return NextResponse.redirect(`${BASE_URL}/availability/responded?action=invalid`);
  }

  // Update parent's status in parentApprovals
  const approvals = JSON.parse(targetRequest.parentApprovals) as Record<
    string,
    { name: string; token: string; status: string }
  >;
  const parentInfo = approvals[parentEmail];
  approvals[parentEmail] = { ...parentInfo, status: action === "approve" ? "approved" : "rejected" };

  // Recalculate overall status
  const allStatuses = Object.values(approvals).map(a => a.status);
  const anyRejected  = allStatuses.some(s => s === "rejected");
  const allApproved  = allStatuses.every(s => s === "approved");

  let newStatus: string;
  if (anyRejected) {
    newStatus = "ANY_REJECTED";
  } else if (allApproved) {
    newStatus = "ALL_APPROVED";
  } else {
    newStatus = "PENDING_PARENT";
  }

  await prisma.availabilityChangeRequest.update({
    where: { id: targetRequest.id },
    data: {
      parentApprovals: JSON.stringify(approvals),
      status: newStatus,
    },
  });

  const allResolved = anyRejected || allApproved;

  void sendParentResponseAlertToAdmin({
    parentName: parentInfo.name,
    parentEmail,
    tutorName: targetRequest.tutorName,
    action,
    allResolved,
    status: newStatus,
  });

  return NextResponse.redirect(`${BASE_URL}/availability/responded?action=${action}`);
}

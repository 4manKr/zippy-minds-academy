import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") return null;
  return session;
}

// GET /api/admin/coupons — list all coupons with usage details
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      usages: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true, userId: true, userEmail: true, userName: true,
          subscriptionId: true, courseName: true, discountGiven: true, createdAt: true,
        },
      },
    },
  });

  // Compute summary per coupon
  const enriched = coupons.map(c => ({
    ...c,
    uniqueUsers:     new Set(c.usages.map(u => u.userId)).size,
    totalDiscount:   c.usages.reduce((sum, u) => sum + u.discountGiven, 0),
    commissionOwed:  c.usages.length * c.commissionPerUse,
  }));

  return NextResponse.json({ coupons: enriched });
}

// POST /api/admin/coupons — create a new coupon
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    code, influencerName, discountType, discountValue,
    commissionPerUse, maxUses, maxUsesPerUser, isActive, expiresAt,
  } = body;

  if (!code || !influencerName || discountValue === undefined) {
    return NextResponse.json({ error: "code, influencerName and discountValue are required" }, { status: 400 });
  }

  const upper = String(code).toUpperCase().trim();

  const existing = await prisma.coupon.findFirst({ where: { code: upper } });
  if (existing) {
    return NextResponse.json({ error: `Code "${upper}" already exists` }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code:            upper,
      influencerName:  String(influencerName).trim(),
      discountType:    discountType ?? "flat",
      discountValue:   Number(discountValue) || 0,
      commissionPerUse: Number(commissionPerUse) || 0,
      maxUses:         maxUses ? Number(maxUses) : null,
      maxUsesPerUser:  Number(maxUsesPerUser) || 1,
      isActive:        isActive !== false,
      expiresAt:       expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json({ coupon }, { status: 201 });
}

// PATCH /api/admin/coupons — update a coupon
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Normalise code if changed
  if (fields.code) fields.code = String(fields.code).toUpperCase().trim();
  if (fields.discountValue !== undefined)  fields.discountValue  = Number(fields.discountValue);
  if (fields.commissionPerUse !== undefined) fields.commissionPerUse = Number(fields.commissionPerUse);
  if (fields.maxUses !== undefined)        fields.maxUses        = fields.maxUses ? Number(fields.maxUses) : null;
  if (fields.maxUsesPerUser !== undefined) fields.maxUsesPerUser = Number(fields.maxUsesPerUser) || 1;
  if (fields.expiresAt !== undefined)      fields.expiresAt      = fields.expiresAt ? new Date(fields.expiresAt) : null;

  const coupon = await prisma.coupon.update({ where: { id }, data: { ...fields, updatedAt: new Date() } });
  return NextResponse.json({ coupon });
}

// DELETE /api/admin/coupons — delete a coupon
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Delete usages first (FK constraint)
  await prisma.couponUsage.deleteMany({ where: { couponId: id } });
  await prisma.coupon.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

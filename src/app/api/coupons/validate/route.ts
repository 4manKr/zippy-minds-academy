import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

/**
 * POST /api/coupons/validate
 * Body: { code: string, originalPrice: number, currency: "INR"|"USD", courseId?: string }
 *
 * Returns: { valid, discountedPrice, discountAmount, discountLabel, coupon }
 * or:      { valid: false, error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ valid: false, error: "Please log in to use a coupon" }, { status: 401 });
    }

    const { code, originalPrice } = await req.json();
    if (!code) return NextResponse.json({ valid: false, error: "No code provided" }, { status: 400 });

    const upper = String(code).toUpperCase().trim();

    // 1. Find coupon
    const coupon = await prisma.coupon.findFirst({ where: { code: upper } });
    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" });
    }

    // 2. Active check
    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: "This coupon is no longer active" });
    }

    // 3. Expiry check
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" });
    }

    // 4. Global maxUses check
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its maximum uses" });
    }

    // 5. Per-user limit check
    const userId = session.userId ?? "";
    if (userId) {
      const userUsageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUsageCount >= coupon.maxUsesPerUser) {
        return NextResponse.json({
          valid: false,
          error: coupon.maxUsesPerUser === 1
            ? "You have already used this coupon"
            : `You can only use this coupon ${coupon.maxUsesPerUser} time(s). Limit reached.`,
        });
      }
    }

    // 6. Calculate discount
    const price = Number(originalPrice) || 0;
    let discountAmount: number;

    if (coupon.discountType === "percent") {
      discountAmount = Math.round((price * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    // Discount can't exceed original price
    discountAmount = Math.min(discountAmount, price);
    const discountedPrice = price - discountAmount;

    const discountLabel =
      coupon.discountType === "percent"
        ? `${coupon.discountValue}% off`
        : `₹${coupon.discountValue} off`;

    return NextResponse.json({
      valid:          true,
      discountAmount,
      discountedPrice,
      discountLabel,
      coupon: {
        id:            coupon.id,
        code:          coupon.code,
        influencerName: coupon.influencerName,
        discountType:  coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (err) {
    console.error("coupon validate error:", err);
    return NextResponse.json({ valid: false, error: "Could not validate coupon" }, { status: 500 });
  }
}

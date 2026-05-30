import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.zippymindsacademy.com";

// ── PayPal helpers ────────────────────────────────────────────────────────────

async function getPayPalAccessToken(): Promise<string> {
  const clientId     = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const mode         = process.env.PAYPAL_MODE === "live" ? "api-m" : "api-m.sandbox";

  const res = await fetch(`https://${mode}.paypal.com/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/x-www-form-urlencoded",
      "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

// Creates a payment order for the chosen gateway
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Please log in to make a payment" }, { status: 401 });
    }

    const { gateway, currency, courseId, courseName, couponCode } = await req.json();
    if (!gateway || !courseName) {
      return NextResponse.json({ error: "gateway and courseName are required" }, { status: 400 });
    }

    // ── Authoritative price from DB — never trust client-sent amount ──────────
    let amount: number;
    if (courseId) {
      const course = await prisma.course.findUnique({
        where:  { id: courseId },
        select: { price: true, priceUSD: true, status: true },
      });
      if (!course || course.status !== "active") {
        return NextResponse.json({ error: "Course not found or inactive" }, { status: 404 });
      }
      // INR for Razorpay, USD for PayPal/Stripe
      amount = (currency ?? "INR") === "INR" ? course.price : (course.priceUSD ?? 15);
    } else {
      amount = 0;
    }

    // ── Apply coupon discount (server-side, re-validated here) ────────────────
    let discountAmount = 0;
    let validatedCoupon: { id: string; code: string } | null = null;

    if (couponCode) {
      const upper = String(couponCode).toUpperCase().trim();
      const coupon = await prisma.coupon.findFirst({ where: { code: upper } });

      if (coupon && coupon.isActive) {
        const notExpired  = !coupon.expiresAt || new Date() <= coupon.expiresAt;
        const globalOk    = coupon.maxUses === null || coupon.usedCount < coupon.maxUses;

        const userId      = session.userId ?? "";
        const userUsages  = userId
          ? await prisma.couponUsage.count({ where: { couponId: coupon.id, userId } })
          : 0;
        const perUserOk   = userUsages < coupon.maxUsesPerUser;

        if (notExpired && globalOk && perUserOk) {
          discountAmount =
            coupon.discountType === "percent"
              ? Math.round((amount * coupon.discountValue) / 100)
              : coupon.discountValue;

          discountAmount  = Math.min(discountAmount, amount);
          amount          = amount - discountAmount;
          validatedCoupon = { id: coupon.id, code: coupon.code };
        }
      }
    }

    // ── Razorpay ──────────────────────────────────────────────────────────────
    if (gateway === "razorpay") {
      const keyId     = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        return NextResponse.json({ error: "Razorpay is not configured yet. Please contact support." }, { status: 503 });
      }

      const Razorpay = (await import("razorpay")).default;
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

      const order = await razorpay.orders.create({
        amount: amount * 100,           // paise
        currency: currency ?? "INR",
        receipt: `ZMA-${Date.now()}`,
        notes: { courseName, userId: session.userId ?? "", courseId: courseId ?? "" },
      });

      return NextResponse.json({
        gateway:        "razorpay",
        orderId:        order.id,
        amount:         order.amount,
        currency:       order.currency,
        keyId,
        name:           "Zippy Minds Academy",
        description:    `Monthly subscription — ${courseName}`,
        prefill:        { name: session.name ?? "", email: session.email ?? "" },
        discountAmount,
        coupon:         validatedCoupon,
      });
    }

    // ── Stripe ────────────────────────────────────────────────────────────────
    if (gateway === "stripe") {
      const secretKey = process.env.STRIPE_SECRET_KEY;

      if (!secretKey) {
        return NextResponse.json({ error: "Stripe is not configured yet. Please contact support." }, { status: 503 });
      }

      const Stripe  = (await import("stripe")).default;
      const stripe  = new Stripe(secretKey);

      const session2 = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: (currency ?? "usd").toLowerCase(),
            product_data: { name: `Zippy Minds — ${courseName}`, description: "Monthly 1-to-1 tutoring subscription" },
            unit_amount: amount * 100,  // cents
            recurring: { interval: "month" },
          },
          quantity: 1,
        }],
        mode:          "subscription",
        success_url:   `${BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:    `${BASE_URL}/enroll`,
        customer_email: session.email ?? undefined,
        metadata:      { courseName, userId: session.userId ?? "", courseId: courseId ?? "" },
      });

      return NextResponse.json({ gateway: "stripe", url: session2.url });
    }

    // ── PayPal ────────────────────────────────────────────────────────────────
    if (gateway === "paypal") {
      const clientId     = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "PayPal is not configured yet. Please contact support." }, { status: 503 });
      }

      const mode       = process.env.PAYPAL_MODE === "live" ? "api-m" : "api-m.sandbox";
      const accessToken = await getPayPalAccessToken();

      // PayPal requires USD/GBP/EUR for most countries
      const ppCurrency = ["USD","GBP","EUR","CAD","AUD"].includes((currency ?? "USD").toUpperCase())
        ? currency.toUpperCase()
        : "USD";

      const orderRes = await fetch(`https://${mode}.paypal.com/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "PayPal-Request-Id": `ZMA-${Date.now()}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            reference_id:  courseId ?? "course",
            description:   `Zippy Minds Academy — ${courseName} (Monthly subscription)`,
            amount: {
              currency_code: ppCurrency,
              value:         amount.toFixed(2),
            },
          }],
          payment_source: {
            paypal: {
              experience_context: {
                brand_name:          "Zippy Minds Academy",
                locale:              "en-US",
                landing_page:        "LOGIN",
                user_action:         "PAY_NOW",
                return_url:          `${BASE_URL}/payment/paypal-return?courseName=${encodeURIComponent(courseName)}`,
                cancel_url:          `${BASE_URL}/enroll`,
              },
            },
          },
        }),
      });

      const orderData = await orderRes.json() as {
        id: string;
        links: Array<{ rel: string; href: string }>;
      };

      const approvalLink = orderData.links?.find(l => l.rel === "payer-action");
      if (!approvalLink?.href) {
        return NextResponse.json({ error: "Failed to create PayPal order." }, { status: 500 });
      }

      return NextResponse.json({ gateway: "paypal", url: approvalLink.href });
    }

    return NextResponse.json({ error: "Unknown gateway" }, { status: 400 });
  } catch (err) {
    console.error("Payment create-order error:", JSON.stringify(err));
    // Razorpay SDK throws plain objects — extract nested message if present
    let msg = "Unknown error";
    if (err instanceof Error) {
      msg = err.message;
    } else if (typeof err === "object" && err !== null) {
      const e = err as Record<string, unknown>;
      // Razorpay error shape: { statusCode, error: { code, description, ... } }
      if (e.error && typeof e.error === "object") {
        const inner = e.error as Record<string, unknown>;
        msg = String(inner.description ?? inner.code ?? JSON.stringify(e.error));
      } else {
        msg = String(e.message ?? e.description ?? JSON.stringify(err));
      }
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

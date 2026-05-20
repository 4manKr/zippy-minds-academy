import { NextRequest, NextResponse } from "next/server";

// Captures a PayPal order after the user approves it on PayPal's site
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json() as { orderId: string };
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const clientId     = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "PayPal not configured" }, { status: 503 });
    }

    const mode = process.env.PAYPAL_MODE === "live" ? "api-m" : "api-m.sandbox";

    // Get fresh access token
    const tokenRes = await fetch(`https://${mode}.paypal.com/v1/oauth2/token`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });
    const { access_token } = await tokenRes.json() as { access_token: string };

    // Capture the order
    const captureRes = await fetch(`https://${mode}.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
    });

    const captureData = await captureRes.json() as { status: string; id: string };

    if (captureData.status === "COMPLETED") {
      return NextResponse.json({ success: true, orderId: captureData.id });
    }

    return NextResponse.json({ error: "PayPal payment not completed", status: captureData.status }, { status: 400 });
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.json({ error: "Failed to capture PayPal payment" }, { status: 500 });
  }
}

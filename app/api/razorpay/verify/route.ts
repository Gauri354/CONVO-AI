import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || "IJv1ipwNvgcyclqW9awrqUGw";
    
    // Verify signature
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    console.log("Verify Signature Debug:", {
      razorpay_order_id,
      razorpay_payment_id,
      received_signature: razorpay_signature,
      expected_digest: digest,
      secretPrefix: secret.substring(0, 4) // check if it loaded placeholder
    });

    if (digest !== razorpay_signature) {
      return NextResponse.json({ error: "Transaction not legit!" }, { status: 400 });
    }

    // Set expiry 30 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // Update user subscription in database
    await db.collection("users").doc(user.id).update({
      subscriptionPlan: "PRO",
      subscriptionStatus: "ACTIVE",
      subscriptionExpiry: expiryDate.toISOString(),
      razorpayCustomerId: razorpay_payment_id,
    });

    return NextResponse.json(
      { success: true, message: "Payment verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

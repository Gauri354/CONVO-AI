import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getCurrentUser } from "@/lib/actions/auth.action";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SiDmypXhC9EgFA",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "IJv1ipwNvgcyclqW9awrqUGw",
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pro subscription amount in INR paise (e.g., ₹299 = 29900 paise)
    const amount = 29900; 

    const options = {
      amount,
      currency: "INR",
      // Razorpay receipt max length is 40 characters
      receipt: `rcp_${user.id.substring(0, 10)}_${Date.now().toString().slice(-8)}`,
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

"use client";

import { useState } from "react";
import { X, CheckCircle, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";

export default function UpgradeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Initializing payment...");
    
    try {
      const isScriptLoaded = await loadRazorpayScript();
      
      if (!isScriptLoaded) {
        toast.dismiss(toastId);
        toast.error("Failed to load Razorpay SDK. Check your connection.");
        setIsLoading(false);
        return;
      }

      // Step 1: Create Order
      const res = await fetch("/api/razorpay/create", { method: "POST" });
      const orderData = await res.json();
      
      if (orderData.error) throw new Error(orderData.error);
      
      toast.dismiss(toastId);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SmartInterview PRO",
        description: "Unlock Resume-Based Interviews & Unlimited Practice",
        order_id: orderData.id,
        handler: async function (response: any) {
          const verifyToast = toast.loading("Verifying payment...");
          
          try {
            // Step 2: Verify Payment
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            
            const verifyData = await verifyRes.json();
            
            toast.dismiss(verifyToast);
            
            if (verifyData.success) {
              toast.success("Payment successful! You are now a PRO user.");
              onClose();
              router.refresh(); // Refresh page to rehydrate user state
            } else {
              toast.error(verifyData.error || "Payment verification failed.");
            }
          } catch (err) {
            toast.dismiss(verifyToast);
            toast.error("Something went wrong during verification.");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#4f46e5", // Primary brand color
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to process payment");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-8 overflow-hidden rounded-2xl bg-dark-100 border border-primary-500/30 shadow-[0_0_40px_-10px_rgba(79,70,229,0.3)] slide-in-from-bottom-4 duration-300">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-primary-500/20 blur-[60px] pointer-events-none rounded-full" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-light-400 hover:text-light-100 transition-colors"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-6 mt-4">
          <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center border border-primary-500/20">
            <Zap className="size-8 text-primary-400 fill-primary-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-light-100">Unlock Resume-Based Interviews 🚀</h2>
            <p className="text-light-400 mt-2">
              Upgrade to Pro to get personalized interview questions generated directly from your resume context.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full text-left bg-dark-200/50 p-4 rounded-xl border border-dark-300">
            <div className="flex items-center gap-3 text-light-200 text-sm">
              <CheckCircle className="size-4 text-primary-400" />
              <span>Personalized questions from your resume</span>
            </div>
            <div className="flex items-center gap-3 text-light-200 text-sm">
              <CheckCircle className="size-4 text-primary-400" />
              <span>Better interview prep tailored exactly to you</span>
            </div>
            <div className="flex items-center gap-3 text-light-200 text-sm">
              <CheckCircle className="size-4 text-primary-400" />
              <span>Unlimited AI practice sessions</span>
            </div>
          </div>

          <div className="w-full mt-2">
            <Button
              className="w-full btn-primary font-bold text-lg h-12 shadow-[0_0_20px_-5px_oklch(0.6_0.118_184.704/_0.5)]"
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Upgrade to PRO 🔒 (₹299/mo)"}
            </Button>
            <p className="text-xs text-light-500 mt-4">Secure payment via Razorpay. Cancel anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

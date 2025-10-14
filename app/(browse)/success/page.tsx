"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SubscriptionSuccessPage() {
  const { data: user } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if no user
  useEffect(() => {
    if (!user?.user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const upgrade = searchParams?.get("upgrade");

    if (upgrade === "success") {
      import("sonner").then(({ toast }) => {
        toast.success("🎉 Welcome to Premium!");
      });
    }
  }, [searchParams]);

  return (
    <div className="p-6 max-w-2xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-2">Welcome to Premium! 🎉</h1>
      <p className="text-gray-600 mb-6">
        Your subscription is now active. Enjoy unlimited access to all premium features!
      </p>

      <div className="mb-6 text-left">
        <h2 className="font-semibold mb-2">What's Included:</h2>
        <ul className="list-disc list-inside space-y-1">
          {[
            "Unlimited tutors and students",
            "Advanced analytics & reports",
            "Priority support",
            "Custom branding options",
          ].map((feature, i) => (
            <li key={i}>{feature}</li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-6 text-sm text-gray-700">
        Auto-renewal: Your subscription renews automatically. Cancel anytime from settings and keep access until the end of your billing period.
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="w-full sm:flex-1 bg-[#4AAF6C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#3d9959] transition-colors"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => (window.location.href = "/settings")}
          className="w-full sm:flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Settings
        </button>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Need help? <a href="/support" className="text-blue-600 underline">Contact Support</a>
      </p>
    </div>
  );
}

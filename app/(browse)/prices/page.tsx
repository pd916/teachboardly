'use client'

import { Check, Diamond } from "lucide-react";
import {initializePaddle, Paddle} from "@paddle/paddle-js"
import { useEffect, useState } from "react";
import { toast } from "sonner";

const plans = [
  {
    name: "Basic",
    price: "$0",
    duration: "Month",
    button: "Start Now",
    highlight: false,
    features: [
      "Pen, Pencil, Eraser",
      "Basic Shapes: Circle, Rectangle, Triangle, Line",
      "Text tool (basic fonts & colors)",
      "Image upload (limited)",
      "Ruler & Protractor",
      "8 participants per session",
      "Basic chat",
    ],
  },
  {
    name: "Premium",
    price: "$9.99",
    duration: "Month",
    button: "Purchase Now",
    highlight: true,
    features: [
      "Unlimited voice chat & mic time",
      "Screen sharing",
      "Unlimited participants",
      "Equation editor & Graphing tools",
      "Unlimited boards & history",
      "Export as PDF/Image",
      "Advanced chat (emoji, file sharing)",
      "Video Recording limited",
      "Dashboard",
    ],
  },
];
export default function Pricing() {
const [paddle, setPaddle] = useState<Paddle>();

useEffect(() => {
    initializePaddle({
      environment: 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!
    }).then((paddle) => {
      if (paddle) {
        setPaddle(paddle);
        console.log('Paddle initialized successfully');
      }
    }).catch((error) => {
      console.error('Failed to initialize Paddle:', error);
      toast.error('Payment system failed to initialize');
    });
  }, []);

const handleCheckout = async () => {
  if (!paddle) return toast("Paddle not initialized");

  const res = await fetch("/api/payment", { method: "POST" });

  if (!res.ok) {
    let message = "Payment failed";
    try {
      const errData = await res.json();
      if (errData?.error) message = errData.error;
    } catch {
      // ignore parse error
    }
    return toast.error(message);
  }

  const data = await res.json();
  paddle.Checkout.open({ 
    transactionId: data.transactionId,
    settings: {
      theme: 'dark',
      successUrl: 'http://localhost:3000/'
    }
   });
};




  return (
    <section className="relative bg-gradient-to-b from-[#8581F6] to-[#6b67e0] text-white px-6 py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Choose the Right Plan for You
        </h1>
        <p className="text-lg text-white/90">
          Flexible options for tutors, teachers, and institutions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-10 justify-center items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col max-w-md w-full rounded-3xl p-8 shadow-xl transition-transform hover:scale-[1.03] ${
              plan.highlight
                ? "bg-white text-gray-900 border border-yellow-400 shadow-yellow-200"
                : "bg-white/95 text-gray-900 border border-gray-200"
            }`}
            style={plan.highlight ? { transform: "translateY(-10px)" } : {}}
          >
            {plan.highlight && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 px-5 py-1 rounded-full flex items-center gap-2 font-semibold text-sm shadow-md">
                <Diamond className="text-yellow-700" />
                Premium
              </div>
            )}

            <h2 className="font-bold text-2xl text-center mb-4">{plan.name}</h2>

            <div className="text-center mb-8">
              <span className="text-5xl font-extrabold">{plan.price}</span>
              <span className="text-gray-500 text-lg">/{plan.duration}</span>
            </div>

            <ul className="space-y-3 flex-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="text-green-500 mt-1" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
            onClick={plan.name === "Premium" ? handleCheckout : undefined}
              className={`mt-8 w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                plan.highlight
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-300 hover:opacity-90 text-gray-900"
                  : "bg-gray-900 hover:bg-gray-800 text-white"
              }`}
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

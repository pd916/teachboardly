"use client";
import Script from "next/script";

export default function DesmosScript() {
  return (
    <Script
      src="https://www.desmos.com/api/v1.8/calculator.js?apikey=dcb31709b452b1cf9dc26972add0fda6"
      strategy="afterInteractive"
      onLoad={() => {
        window.dispatchEvent(new Event("desmos:loaded"));
      }}
    />
  );
}

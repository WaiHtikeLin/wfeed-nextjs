"use client";

import { useEffect } from "react";

export function AdsenseAd() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }
  }, []);

  return (
    <div className="my-6 flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: 90 }}
        data-ad-client="ca-pub-xxxxxxxxxxxxxxxx" // <-- Replace with your AdSense publisher ID
        data-ad-slot="1234567890" // <-- Replace with your AdSense ad slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden bg-ink-900">
      {/* Warm organic background blobs — no cold blue circles */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Top-left amber bloom */}
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, #e8a838 0%, #c96442 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Bottom-right sage bloom */}
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle at 60% 60%, #7ea87e 0%, #5a8a5a 50%, transparent 75%)",
            filter: "blur(90px)",
          }}
        />
        {/* Mid-page clay warmth */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] opacity-8"
          style={{
            background:
              "radial-gradient(ellipse, rgba(201, 100, 66, 0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <PricingSection />

      <footer className="border-t border-parchment-700/20 py-14 mt-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              {/* Inline logo mark */}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="10" stroke="#e8a838" strokeWidth="1.5" />
                <path d="M7 11h8M11 7v8" stroke="#e8a838" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span
                className="font-display text-parchment-100 text-lg"
                style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
              >
                EduCast
              </span>
            </div>
            <p className="text-parchment-600 text-sm text-center">
              Made with curiosity &amp; coffee. Powered by Claude AI &amp; ElevenLabs.
            </p>
            <p className="text-parchment-700 text-xs">
              © {new Date().getFullYear()} EduCast
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

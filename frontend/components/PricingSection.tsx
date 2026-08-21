"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    emoji: "🌱",
    price: "$0",
    period: "forever",
    tagline: "Dip your toes in.",
    features: [
      "3 podcast videos per month",
      "All subjects supported",
      "Flashcards & quiz included",
      "Video download",
    ],
    cta: "Start for free",
    href: "/auth",
    popular: false,
  },
  {
    name: "Student",
    emoji: "🎧",
    price: "$12",
    period: "/ month",
    tagline: "For the seriously curious.",
    features: [
      "Unlimited podcast videos",
      "All subjects + 20+ languages",
      "Flashcards & quiz included",
      "HD video download",
      "Shareable links",
      "Priority generation",
    ],
    cta: "Start free trial",
    href: "/auth",
    popular: true,
  },
  {
    name: "Family",
    emoji: "🏡",
    price: "$20",
    period: "/ month",
    tagline: "Learning runs in the family.",
    features: [
      "Everything in Student",
      "Up to 4 student accounts",
      "Parent progress dashboard",
      "Shared video library",
      "Email support",
    ],
    cta: "Get Family plan",
    href: "/auth",
    popular: false,
  },
];

function CheckMark({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
      <circle cx="7" cy="7" r="6.25" stroke={color} strokeWidth="1.25"/>
      <path d="M4 7l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function PricingSection() {
  return (
    <section id="pricing" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <div className="mb-16 text-center">
          <div className="section-label mb-6 mx-auto">Pricing</div>
          <h2
            className="text-4xl lg:text-5xl text-parchment-100 leading-tight"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Honest, simple{" "}
            <em className="text-warm not-italic">pricing</em>
          </h2>
          <p className="text-parchment-500 text-lg mt-4 font-light max-w-sm mx-auto">
            Start free. Pay only when you need more. No sneaky stuff.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-[22px] p-7 flex flex-col transition-transform duration-200 hover:-translate-y-1 ${
                plan.popular
                  ? "popular-ring"
                  : "border border-parchment-700/15"
              }`}
              style={{
                background: plan.popular
                  ? "linear-gradient(160deg, rgba(232,168,56,0.07) 0%, rgba(201,100,66,0.04) 100%)"
                  : "#1f1a14",
              }}
            >
              {/* Popular label */}
              {plan.popular && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
                  style={{
                    background: "#e8a838",
                    color: "#0e0b08",
                    letterSpacing: "0.12em",
                  }}
                >
                  Most loved ✦
                </div>
              )}

              {/* Plan emoji + name */}
              <div className="flex items-center gap-3 mb-5 mt-2">
                <span className="text-3xl leading-none">{plan.emoji}</span>
                <div>
                  <div
                    className="text-parchment-100 text-lg leading-none"
                    style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
                  >
                    {plan.name}
                  </div>
                  <div className="text-parchment-600 text-xs mt-0.5 font-light italic">
                    {plan.tagline}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 mb-6">
                <span
                  className="text-5xl text-parchment-100 leading-none"
                  style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
                >
                  {plan.price}
                </span>
                <span className="text-parchment-600 text-sm font-light">{plan.period}</span>
              </div>

              {/* Divider */}
              <div
                className="h-px mb-6"
                style={{
                  background: plan.popular
                    ? "linear-gradient(to right, transparent, rgba(232,168,56,0.25), transparent)"
                    : "rgba(253,246,227,0.06)",
                }}
              />

              {/* Feature list */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-parchment-400 font-light">
                    <CheckMark color={plan.popular ? "#e8a838" : "#7ea87e"} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`w-full text-center font-semibold py-3 rounded-xl transition-all duration-200 text-sm ${
                  plan.popular
                    ? "btn-gold justify-center"
                    : "btn-ghost justify-center"
                }`}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Reassurance line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-parchment-600 text-sm mt-12 font-light italic"
        >
          No credit card to start. Cancel from your dashboard, any time, no questions asked.
        </motion.p>
      </div>
    </section>
  );
}

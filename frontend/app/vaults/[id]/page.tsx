"use client";

import React, { use, useState } from "react";
import { VaultCardProps } from "@/type";
import { vaultLists } from "@/constants";

// ── Exposure coin icons shown on the vault page ──────────────────────────────
const EXPOSURE_ICONS = [
  { src: "/images/coins/btc.png", alt: "BTC" },
  { src: "/images/coins/weth.png", alt: "WETH" },
  { src: "/images/coins/eth.png", alt: "ETH" },
  { src: "/images/coins/usdc.png", alt: "USDC" },
];

// ── Props extend VaultCardProps with extra vault-page fields ─────────────────
interface VaultDetailsProps extends VaultCardProps {
  totalDeposits?: string;
  totalDepositsRaw?: string;
  liquidityRaw?: string;
  description?: string;
  address?: string;
  balance?: string; // user's wallet balance of this token
}

interface VaultPageProps {
  params: Promise<{
    id: string;
  }>;
}

function VaultDetails({
  network,
  token,
  name,
  curator,
  liquidity,
  liquidityRaw,
  apy,
  totalDeposits = "$452.1M",
  totalDepositsRaw = "452.25M USDC",
  description = "This vault aims to optimise yields by lending against blue chip crypto and real world asset RWA collateral markets depending on market conditions. We call this the dual engine.",
  address = "0xBEEF...83b2",
  balance = "0.08",
}: VaultDetailsProps) {
  const [amount, setAmount] = useState("");

  // Derive the token ticker from the token image path e.g. "/images/coins/usdc.png" → "USDC"
  const tokenTicker = token
    ? token.split("/").pop()?.replace(/\.[^.]+$/, "").toUpperCase() ?? "TOKEN"
    : "TOKEN";

  // Derive network name from path e.g. "/images/networks/eth.png" → "Ethereum"
  const networkName = (() => {
    const key = network?.split("/").pop()?.replace(/\.[^.]+$/, "").toLowerCase();
    const map: Record<string, string> = {
      eth: "Ethereum",
      arb: "Arbitrum",
      base: "Base",
      op: "Optimism",
      usdt: "Ethereum",
    };
    return map[key ?? ""] ?? "Ethereum";
  })();

  const projectedMonthly =
    amount && !isNaN(Number(amount))
      ? `$${((Number(amount) * parseFloat(apy)) / 12 / 100).toFixed(2)}`
      : "$0.00";

  const projectedYearly =
    amount && !isNaN(Number(amount))
      ? `$${((Number(amount) * parseFloat(apy)) / 100).toFixed(2)}`
      : "$0.00";

  return (
    <section
      id="event"
      className="min-h-screen pt-28 pb-16 container mx-auto px-5 2xl:px-0"
    >
      {/* ── Outer flex: 2/3 info  |  1/3 modal ───────────────────────────── */}
      <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-8 items-start w-full">

        {/* ════════════════════════════════════════════════════════════════
            LEFT — vault info  (2/3)
        ════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-8 lg:flex-[2] w-full">

          {/* Title row */}
          <div className="flex flex-col gap-3">
            <h1
              className="text-4xl md:text-5xl font-schibsted-grotesk font-bold tracking-tight"
              style={{ background: "none", WebkitTextFillColor: "inherit", color: "white" }}
            >
              {name.split(" ").slice(0, 1).join(" ")}{" "}
              <span className="text-white/40 font-light">
                {name.split(" ").slice(1).join(" ")}
              </span>
            </h1>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
              {/* Address pill */}
              <button className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1 transition-colors">
                <span>{address}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </button>

              {/* Network */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                <img src={network} alt={networkName} className="w-4 h-4 rounded-full object-cover" />
                <span>{networkName}</span>
              </div>

              {/* Curator */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                {/* generic curator dot */}
                <span className="w-4 h-4 rounded-full bg-green-400/80 flex-center text-[8px] font-bold text-black">✓</span>
                <span>{curator}</span>
              </div>

              {/* Token */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                <img src={token} alt={tokenTicker} className="w-4 h-4 rounded-full object-cover" />
                <span>{tokenTicker}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/60 text-base leading-relaxed max-w-2xl">
            {description}
          </p>

          {/* ── Stats row ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-8">

            {/* Total Deposits */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/40 uppercase tracking-widest">
                Total Deposits
              </span>
              <span className="text-3xl md:text-4xl font-schibsted-grotesk font-semibold text-white">
                {totalDeposits}
              </span>
              <span className="text-xs text-white/40">{totalDepositsRaw}</span>
            </div>

            {/* Liquidity */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-1">
                Liquidity
                <span className="w-3.5 h-3.5 rounded-full border border-white/30 flex-center text-[9px] text-white/40">i</span>
              </span>
              <span className="text-3xl md:text-4xl font-schibsted-grotesk font-semibold text-white">
                {liquidity}
              </span>
              <span className="text-xs text-white/40">{liquidityRaw ?? `${liquidity} USDC`}</span>
            </div>

            {/* Exposure */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-white/40 uppercase tracking-widest">
                Exposure
              </span>
              <div className="flex items-center">
                {EXPOSURE_ICONS.map((icon, i) => (
                  <img
                    key={icon.alt}
                    src={icon.src}
                    alt={icon.alt}
                    className="w-8 h-8 rounded-full object-cover border-2 border-black"
                    style={{ marginLeft: i === 0 ? 0 : -10, zIndex: EXPOSURE_ICONS.length - i }}
                  />
                ))}
              </div>
            </div>

            {/* Net APY */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-1">
                Net APY
                <span className="w-3.5 h-3.5 rounded-full border border-white/30 flex-center text-[9px] text-white/40">i</span>
              </span>
              <span className="text-3xl md:text-4xl font-schibsted-grotesk font-bold text-green">
                {apy}
              </span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT — deposit modal  (1/3)
        ════════════════════════════════════════════════════════════════ */}
        <div className="lg:flex-1 w-full flex flex-col gap-3 lg:sticky lg:top-28">

          {/* ── Deposit input card ──────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5 flex flex-col gap-4">

            {/* Header */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Deposit {tokenTicker}</span>
              <img src={token} alt={tokenTicker} className="w-6 h-6 rounded-full object-cover" />
            </div>

            {/* Amount input */}
            <div className="flex flex-col gap-1">
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-4xl font-schibsted-grotesk font-semibold text-white/80 placeholder-white/20 outline-none w-full"
              />
              <div className="flex items-center justify-between text-sm text-white/40">
                <span>
                  {amount && !isNaN(Number(amount))
                    ? `$${Number(amount).toLocaleString()}`
                    : "$0"}
                </span>
                <div className="flex items-center gap-2">
                  <span>{balance} {tokenTicker}</span>
                  <button
                    onClick={() => setAmount(balance)}
                    className="bg-white/10 hover:bg-white/20 text-white/80 text-xs font-bold px-2 py-0.5 rounded transition-colors"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Details card ────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5 flex flex-col gap-3 text-sm">

            <DetailRow label="Network">
              <div className="flex items-center gap-1.5">
                <img src={network} alt={networkName} className="w-4 h-4 rounded-full object-cover" />
                <span className="text-white">{networkName}</span>
              </div>
            </DetailRow>

            <DetailRow label={`Deposit (${tokenTicker})`}>
              <span className="text-white">
                {amount || "0.00"}
              </span>
            </DetailRow>

            <DetailRow label="APY">
              <span className="text-green font-semibold">{apy}</span>
            </DetailRow>

            <div className="border-t border-white/10 my-1" />

            <DetailRow label="Projected monthly earnings">
              <span className="text-white">{projectedMonthly}</span>
            </DetailRow>

            <DetailRow label="Projected yearly earnings">
              <span className="text-white">{projectedYearly}</span>
            </DetailRow>
          </div>

          {/* ── CTA Button ──────────────────────────────────────────────── */}
          <button className="w-full rounded-xl bg-blue hover:bg-blue/80 active:scale-[0.98] transition-all text-white font-semibold text-lg py-4 cursor-pointer">
            Switch chain
          </button>
        </div>

      </div>
    </section>
  );
}

// ── Small helper ─────────────────────────────────────────────────────────────
function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/40">{label}</span>
      {children}
    </div>
  );
}

export default function VaultDetailsPage({ params }: VaultPageProps) {
  const { id } = use(params);
  const vault = vaultLists.find((item) => item.slug === id);

  if (!vault) {
    return (
      <section
        id="event"
        className="min-h-screen pt-28 pb-16 container mx-auto px-5 2xl:px-0"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/70">
          Vault not found.
        </div>
      </section>
    );
  }

  return <VaultDetails {...vault} />;
}

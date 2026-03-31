"use client"

import React, { use, useState } from "react";
import { notFound } from "next/navigation";
import { marketsList } from "@/constants";

const TABS = ["Overview", "Advanced", "Activity", "Your Position"];

interface MarketPageProps {
  params: Promise<{ id: string }>; 
}

export default function MarketDetail({ params }: MarketPageProps) {
  const { id } = use(params);                              // ← match folder name
  const market = marketsList.find((item) => item.slug === id);

  const [activeTab, setActiveTab] = useState("Overview");
  const [supplyAmount, setSupplyAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");

  if (!market) return notFound();

  const {
    network, networkName,
    collateral, collateralSymbol,
    loan, loanSymbol,
    lltv, sixHrRate, totalLiquidity,
  } = market;

  return (
    <section id="market-detail">

      {/* ── Header ── */}
      <div className="md-header">
        <div className="md-title-row">
          <div className="md-coin-stack">
            <img src={collateral} alt={collateralSymbol} className="md-coin md-coin-back" />
            <img src={loan}       alt={loanSymbol}       className="md-coin md-coin-front" />
          </div>
          <h1 className="md-pair-name">
            {collateralSymbol} / {loanSymbol}
          </h1>
          <span className="md-lltv-badge">{lltv}</span>
        </div>

        <div className="md-meta">
          <span className="md-address">0x9103...1836
            <svg className="md-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </span>
          <div className="md-network-pill">
            <img src={network} alt={networkName} className="md-network-icon" />
            <span>{networkName}</span>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="md-stats-bar">
        <div className="md-stat-block">
          <p className="md-stat-label">Total Market Size <span className="md-info-icon">ⓘ</span></p>
          <p className="md-stat-value">{totalLiquidity}</p>
          <p className="md-stat-sub">{totalLiquidity} {loanSymbol}</p>
        </div>
        <div className="md-stat-block">
          <p className="md-stat-label">Total Liquidity <span className="md-info-icon">ⓘ</span></p>
          <p className="md-stat-value">{totalLiquidity}</p>
          <p className="md-stat-sub">{totalLiquidity} {loanSymbol}</p>
        </div>
        <div className="md-stat-block">
          <p className="md-stat-label">Rate <span className="md-info-icon">ⓘ</span></p>
          <p className="md-stat-value md-stat-value--rate">{sixHrRate}</p>
        </div>
        <div className="md-stat-block">
          <p className="md-stat-label">Trusted By <span className="md-info-icon">ⓘ</span></p>
          <div className="md-trusted">
            {[collateral, loan, network, collateral, loan].map((src, i) => (
              <img key={i} src={src} alt="" className="md-avatar" style={{ zIndex: 5 - i }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="md-body">

        {/* ── Left: tabs + content ── */}
        <div className="md-content">
          <div className="md-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`md-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="md-divider" />

          {activeTab === "Overview" && (
            <div className="md-overview">
              <h2 className="md-section-title">Market Attributes</h2>
              <div className="md-attributes">
                <div className="md-attr-row">
                  <span className="md-attr-key">Collateral</span>
                  <span className="md-attr-val">
                    <img src={collateral} alt={collateralSymbol} className="md-attr-icon" />
                    {collateralSymbol}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" className="md-ext-icon">
                      <path d="M7 17L17 7M7 7h10v10"/>
                    </svg>
                  </span>
                  <span className="md-attr-key">Oracle price</span>
                  <span className="md-attr-val">{collateralSymbol} / {loanSymbol} = —</span>
                </div>
                <div className="md-attr-divider" />
                <div className="md-attr-row">
                  <span className="md-attr-key">Loan</span>
                  <span className="md-attr-val">
                    <img src={loan} alt={loanSymbol} className="md-attr-icon" />
                    {loanSymbol}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" className="md-ext-icon">
                      <path d="M7 17L17 7M7 7h10v10"/>
                    </svg>
                  </span>
                  <span className="md-attr-key">Created on</span>
                  <span className="md-attr-val">2024-09-04</span>
                </div>
                <div className="md-attr-divider" />
                <div className="md-attr-row">
                  <span className="md-attr-key">LLTV</span>
                  <span className="md-attr-val">{lltv}</span>
                  <span className="md-attr-key">Network</span>
                  <span className="md-attr-val">
                    <img src={network} alt={networkName} className="md-attr-icon" />
                    {networkName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "Overview" && (
            <div className="md-empty-tab">
              <p>No data available for {activeTab} yet.</p>
            </div>
          )}
        </div>

        {/* ── Right: sidebar ── */}
        <div className="md-sidebar">

          <button className="md-borrow-btn">Borrow</button>

          {/* Supply Collateral card */}
          <div className="md-action-card">
            <div className="md-action-header">
              <span>Supply Collateral {collateralSymbol}</span>
              <img src={collateral} alt={collateralSymbol} className="md-action-icon" />
            </div>
            <input
              type="number"
              placeholder="0.00"
              value={supplyAmount}
              onChange={(e) => setSupplyAmount(e.target.value)}
              className="md-action-input"
            />
            <p className="md-action-usd">$0</p>
            <div className="md-action-bar">
              <div className="md-action-bar-fill" />
            </div>
          </div>

          {/* Borrow card */}
          <div className="md-action-card">
            <div className="md-action-header">
              <span>Borrow {loanSymbol}</span>
              <img src={loan} alt={loanSymbol} className="md-action-icon" />
            </div>
            <input
              type="number"
              placeholder="0.00"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              className="md-action-input"
            />
            <p className="md-action-usd">$0</p>
            <div className="md-action-bar">
              <div className="md-action-bar-fill" />
            </div>
          </div>

          {/* Info card */}
          <div className="md-info-card">
            <div className="md-info-row">
              <span className="md-info-key">Network</span>
              <span className="md-info-val">
                <img src={network} alt={networkName} className="md-attr-icon" />
                {networkName}
              </span>
            </div>
            <div className="md-info-row">
              <span className="md-info-key">Collateral ({collateralSymbol})</span>
              <img src={collateral} alt={collateralSymbol} className="md-attr-icon" />
            </div>
            <div className="md-info-row">
              <span className="md-info-key">Loan ({loanSymbol})</span>
              <img src={loan} alt={loanSymbol} className="md-attr-icon" />
            </div>
            <div className="md-info-row">
              <span className="md-info-key">LTV</span>
              <div className="md-info-bar">
                <div className="md-info-bar-fill" style={{ width: lltv }} />
              </div>
            </div>
            <div className="md-info-row">
              <span className="md-info-key">Liquidation LTV</span>
              <span className="md-info-val md-info-highlight">{lltv}</span>
            </div>
            <div className="md-info-row">
              <span className="md-info-key">Rate</span>
              <span className="md-info-val">{sixHrRate}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
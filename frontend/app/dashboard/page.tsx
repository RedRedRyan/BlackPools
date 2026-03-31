"use client"

import React, { useState } from 'react'
import useGetEthSepoliaGetBalanceOfTUSDT from '@/lib/balance-checker'
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { formatUnits } from 'viem';
import { ethereumSepolia } from '@/config';

// ─── Network config ───────────────────────────────────────────────
const NETWORKS = [
  { id: 'ethereum', label: 'Ethereum', icon: '/images/networks/eth.png', color: '#627EEA' },
  { id: 'base',     label: 'Base',     icon: '/images/networks/base.png', color: '#0052FF' },
  { id: 'arbitrum', label: 'Arbitrum', icon: '/images/networks/arb.png',  color: '#12AAFF' },
]

// ─── Dummy recent transactions ─────────────────────────────────────
const RECENT_TXS = [
  { id: '0x1a2b…9f0e', type: 'Deposit',    asset: 'USDT',  network: 'Ethereum', amount: '+500.00',  usd: '$500.00',  status: 'confirmed', time: '2 min ago' },
  { id: '0x3c4d…8e1f', type: 'Borrow',     asset: 'ETH',   network: 'Base',     amount: '-0.25',    usd: '$612.50',  status: 'confirmed', time: '15 min ago' },
  { id: '0x5e6f…7d2a', type: 'Repay',      asset: 'USDC',  network: 'Arbitrum', amount: '+250.00',  usd: '$250.00',  status: 'pending',   time: '1 hr ago' },
  { id: '0x7g8h…6c3b', type: 'Withdraw',   asset: 'USDT',  network: 'Ethereum', amount: '-1,000.00',usd: '$1,000.00',status: 'confirmed', time: '3 hr ago' },
  { id: '0x9i0j…5b4c', type: 'Deposit',    asset: 'USDC',  network: 'Base',     amount: '+2,000.00',usd: '$2,000.00',status: 'confirmed', time: 'Yesterday' },
]

const TX_COLORS: Record<string, string> = {
  Deposit:  'var(--color-green)',
  Borrow:   '#f97316',
  Repay:    '#60a5fa',
  Withdraw: '#f87171',
}

// ─── Mini sparkline (SVG) ──────────────────────────────────────────
function Sparkline({ color, trend }: { color: string; trend: 'up' | 'down' }) {
  const up   = "M0,28 C10,22 20,18 30,14 C40,10 50,8 60,5 C70,2 80,4 90,2"
  const down = "M0,5  C10,8  20,12 30,16 C40,20 50,22 60,24 C70,27 80,25 90,28"
  const d = trend === 'up' ? up : down

  return (
    <svg width="90" height="30" viewBox="0 0 90 30" fill="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d={`${d} L90,30 L0,30 Z`} fill={`url(#grad-${color.replace('#','')})`}/>
    </svg>
  )
}

// ─── Network dropdown ──────────────────────────────────────────────
function NetworkSelect({ selected, onChange }: {
  selected: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false)
  const current = NETWORKS.find(n => n.id === selected)!

  return (
    <div className="network-select" style={{ position: 'relative' }}>
      <button className="network-trigger" onClick={() => setOpen(o => !o)}>
        <span className="net-dot" style={{ background: current.color }} />
        <span>{current.label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <ul className="network-dropdown">
          {NETWORKS.map(n => (
            <li key={n.id} onClick={() => { onChange(n.id); setOpen(false) }}
              className={n.id === selected ? 'active' : ''}>
              <span className="net-dot" style={{ background: n.color }} />
              {n.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────
function StatCard({
  label, value, sub, badge, badgeUp, sparkColor, sparkTrend, children
}: {
  label: string; value: string; sub?: string;
  badge?: string; badgeUp?: boolean;
  sparkColor?: string; sparkTrend?: 'up' | 'down';
  children?: React.ReactNode;
}) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-header">
        <span className="db-stat-label">{label}</span>
        {sparkColor && <Sparkline color={sparkColor} trend={sparkTrend ?? 'up'} />}
      </div>
      <div className="db-stat-value">{value}</div>
      <div className="db-stat-footer">
        {sub && <span className="db-stat-sub">{sub}</span>}
        {badge && (
          <span className={`db-badge ${badgeUp ? 'up' : 'down'}`}>
            {badgeUp ? '↑' : '↓'} {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────
const Page = () => {
  const { address, isConnected, status } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { balance: tokenBalance, isLoading, isError } = useGetEthSepoliaGetBalanceOfTUSDT(
    address as `0x${string}` | undefined
  )
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum')

  const formattedBalance = tokenBalance !== undefined
    ? Number(formatUnits(tokenBalance, 6)).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : null

  const walletDisplay = !isConnected
    ? '—'
    : isLoading
      ? 'Loading…'
      : isError
        ? 'Error'
        : `$${formattedBalance ?? '0.00'}`

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : 'Not connected'

  return (
    <section id="dashboard">

      {/* ── Page header ── */}
      <div className="db-header">
        <div>
          <p className="db-eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p className="db-address">
            <span className="db-dot" style={{ background: isConnected ? 'var(--color-green)' : '#6b7280' }} />
            {shortAddress}
          </p>
        </div>
        <div className="db-header-actions">
          <button className="db-pill-btn">↓ Export</button>
          <button className="db-pill-btn accent">+ Supply</button>
        </div>
      </div>

      {/* ── Top stats grid ── */}
      <div className="db-stats-grid">

        {/* Card 1 — Wallet balance */}
        <div className="db-stat-card featured">
          <div className="db-stat-header">
            <span className="db-stat-label">Wallet Balance</span>
            <NetworkSelect selected={selectedNetwork} onChange={setSelectedNetwork} />
          </div>
          <div className="db-stat-value green">{walletDisplay}</div>
          <div className="db-stat-footer">
            <span className="db-stat-sub">TUSDT · Sepolia</span>
            {chainId && chainId !== ethereumSepolia.id && (
              <span className="db-warn">⚠ Wrong network</span>
            )}
          </div>
          <div className="db-card-glow" />
        </div>

        {/* Card 2 — Vault balance */}
        <StatCard
          label="Total in Vaults"
          value="$24,810.00"
          sub="across 3 vaults"
          badge="12% APY"
          badgeUp
          sparkColor="var(--color-green)"
          sparkTrend="up"
        />

        {/* Card 3 — Loan balance */}
        <StatCard
          label="Loan Account"
          value="$8,400.00"
          sub="borrowed / outstanding"
          badge="4% interest"
          badgeUp={false}
          sparkColor="#f97316"
          sparkTrend="down"
        >
          {/* Health factor bar */}
          <div className="db-health">
            <div className="db-health-bar">
              <div className="db-health-fill" style={{ width: '68%' }} />
            </div>
            <span className="db-health-label">Health: <b>1.68</b></span>
          </div>
        </StatCard>

      </div>

      {/* ── Recent transactions ── */}
      <div className="db-section">
        <div className="db-section-head">
          <h3>Recent Transactions</h3>
          <button className="db-pill-btn small">View all →</button>
        </div>

        <div className="db-tx-table">
          {/* Table header */}
          <div className="db-tx-row header">
            <span>Type</span>
            <span>Asset</span>
            <span>Network</span>
            <span>Amount</span>
            <span>Value</span>
            <span>Status</span>
            <span>Time</span>
          </div>

          {RECENT_TXS.map(tx => (
            <div key={tx.id} className="db-tx-row">
              <span>
                <span className="db-tx-type" style={{ color: TX_COLORS[tx.type] }}>
                  {tx.type}
                </span>
              </span>
              <span className="db-tx-asset">{tx.asset}</span>
              <span className="db-tx-network">
                <span className="db-tx-net-dot"
                  style={{ background: NETWORKS.find(n => n.label === tx.network)?.color }} />
                {tx.network}
              </span>
              <span className="db-tx-amount" style={{
                color: tx.amount.startsWith('+') ? 'var(--color-green)' : '#f87171'
              }}>
                {tx.amount}
              </span>
              <span className="db-tx-usd">{tx.usd}</span>
              <span>
                <span className={`db-status ${tx.status}`}>{tx.status}</span>
              </span>
              <span className="db-tx-time">{tx.time}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}

export default Page
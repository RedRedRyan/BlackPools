"use client"

import React, { useMemo, useState } from 'react'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { getAddress, isAddress } from 'viem'
import ConnectButton from '@/components/ConnectButton'
import { createMarketConfig } from '@/lib/blackpools'
import { marketId, SEPOLIA_CHAIN_ID, type MarketParams } from '@/lib/contracts'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const ORACLE_ABI = [
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  },
  {
    type: 'function',
    name: 'latestRoundData',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' }
    ]
  }
] as const

const Page = () => {
  const { isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()

  const [loanToken, setLoanToken] = useState('')
  const [collateralToken, setCollateralToken] = useState('')
  const [oracle, setOracle] = useState('')
  const [lltv, setLltv] = useState('8000')

  const lltvNumber = Number(lltv || 0)
  const isValidLltv = Number.isFinite(lltvNumber) && lltvNumber >= 1 && lltvNumber <= 9999

  const isValidLoan = isAddress(loanToken) && loanToken !== ZERO_ADDRESS
  const isValidCollateral = isAddress(collateralToken) && collateralToken !== ZERO_ADDRESS
  const isDifferentTokens = isValidLoan && isValidCollateral && loanToken.toLowerCase() !== collateralToken.toLowerCase()
  const isValidOracle = isAddress(oracle) && oracle !== ZERO_ADDRESS

  const normalizedParams: MarketParams | null = useMemo(() => {
    if (!isValidLoan || !isValidCollateral || !isDifferentTokens || !isValidOracle || !isValidLltv) {
      return null
    }
    return {
      loanToken: getAddress(loanToken),
      collateralToken: getAddress(collateralToken),
      oracle: getAddress(oracle),
      lltv: BigInt(lltvNumber)
    }
  }, [collateralToken, isDifferentTokens, isValidCollateral, isValidLoan, isValidLltv, isValidOracle, loanToken, oracle, lltvNumber])

  const previewMarketId = useMemo(() => {
    if (!normalizedParams) return null
    return marketId(normalizedParams)
  }, [normalizedParams])

  const oracleAddress = isValidOracle ? (getAddress(oracle) as `0x${string}`) : undefined
  const { data: oracleDecimals, isLoading: oracleLoading, isError: oracleError } = useReadContract({
    address: oracleAddress,
    abi: ORACLE_ABI,
    functionName: 'decimals',
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: Boolean(oracleAddress)
    }
  })

  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash
  })

  const onSubmit = () => {
    if (!normalizedParams) return
    writeContract(createMarketConfig(normalizedParams, SEPOLIA_CHAIN_ID))
  }

  const wrongNetwork = Boolean(chainId && chainId !== SEPOLIA_CHAIN_ID)
  const canSubmit = Boolean(isConnected && !wrongNetwork && normalizedParams && !isPending && !isConfirming)

  return (
    <section id="market-create" className="noisy">
      <img src="/images/safe.png" alt="safe" className="mc-bg" />

      <div className="mc-header">
        <div>
          <p className="mc-eyebrow">Deploy</p>
          <h1>Create Market</h1>
          <p className="mc-subtitle">
            Define a new isolated pool with immutable parameters. All encrypted
            position state stays on-chain as ciphertext handles.
          </p>
        </div>
        <div className="mc-actions">
          <ConnectButton />
          <span className="mc-pill">Ethereum Sepolia</span>
        </div>
      </div>

      <div className="mc-grid">
        <div className="mc-col mc-form">
          <div className="mc-card">
            <div className="mc-field">
              <label className="mc-label">Loan Token</label>
              <input
                className="mc-input"
                placeholder="0x... loan token address"
                value={loanToken}
                onChange={(event) => setLoanToken(event.target.value.trim())}
              />
              {!isValidLoan && loanToken.length > 0 && (
                <p className="mc-error">Enter a valid non-zero ERC-20 address.</p>
              )}
            </div>

            <div className="mc-field">
              <label className="mc-label">Collateral Token</label>
              <input
                className="mc-input"
                placeholder="0x... collateral token address"
                value={collateralToken}
                onChange={(event) => setCollateralToken(event.target.value.trim())}
              />
              {!isValidCollateral && collateralToken.length > 0 && (
                <p className="mc-error">Enter a valid non-zero ERC-20 address.</p>
              )}
              {isValidCollateral && isValidLoan && !isDifferentTokens && (
                <p className="mc-error">Collateral must differ from loan token.</p>
              )}
            </div>

            <div className="mc-field">
              <label className="mc-label">Price Oracle</label>
              <input
                className="mc-input"
                placeholder="0x... oracle address"
                value={oracle}
                onChange={(event) => setOracle(event.target.value.trim())}
              />
              {!isValidOracle && oracle.length > 0 && (
                <p className="mc-error">Enter a valid oracle address.</p>
              )}
              {isValidOracle && (
                <p className="mc-help">
                  {oracleLoading && 'Checking oracle...'}
                  {!oracleLoading && oracleError && 'Oracle did not respond to decimals().' }
                  {!oracleLoading && !oracleError && oracleDecimals !== undefined && `Oracle decimals: ${oracleDecimals}`}
                </p>
              )}
            </div>

            <div className="mc-field">
              <label className="mc-label">LLTV (Basis Points)</label>
              <div className="mc-lltv-row">
                <input
                  className="mc-input"
                  type="number"
                  min={1}
                  max={9999}
                  value={lltv}
                  onChange={(event) => setLltv(event.target.value)}
                />
                <span className="mc-pill">{(lltvNumber / 100).toFixed(2)}%</span>
              </div>
              <input
                className="mc-slider"
                type="range"
                min={1}
                max={9999}
                value={isValidLltv ? lltvNumber : 1}
                onChange={(event) => setLltv(event.target.value)}
              />
              {!isValidLltv && (
                <p className="mc-error">LLTV must be between 1 and 9999.</p>
              )}
              <p className="mc-help">Higher LLTV increases borrowing power but raises liquidation risk.</p>
            </div>

            {wrongNetwork && (
              <p className="mc-error">Wrong network. Switch to Ethereum Sepolia to create a market.</p>
            )}

            <button className="mc-submit" onClick={onSubmit} disabled={!canSubmit}>
              {isPending ? 'Confirm in wallet...' : isConfirming ? 'Creating market...' : 'Create Market'}
            </button>
            {error && <p className="mc-error">{error.message}</p>}
          </div>
        </div>

        <div className="mc-col mc-preview">
          <div className="mc-card">
            <h3 className="mc-preview-title">Preview</h3>
            <div className="mc-preview-grid">
              <div>
                <p className="mc-label">Loan Token</p>
                <p className="mc-preview-value">{isValidLoan ? getAddress(loanToken) : '—'}</p>
              </div>
              <div>
                <p className="mc-label">Collateral Token</p>
                <p className="mc-preview-value">{isValidCollateral ? getAddress(collateralToken) : '—'}</p>
              </div>
              <div>
                <p className="mc-label">Oracle</p>
                <p className="mc-preview-value">{isValidOracle ? getAddress(oracle) : '—'}</p>
              </div>
              <div>
                <p className="mc-label">LLTV</p>
                <p className="mc-preview-value">{isValidLltv ? `${lltvNumber} bps` : '—'}</p>
              </div>
            </div>

            <div className="mc-preview-divider" />

            <div>
              <p className="mc-label">Computed Market ID</p>
              <p className="mc-preview-id">{previewMarketId ?? '—'}</p>
            </div>

            <div className="mc-preview-footer">
              <span className="mc-help">Market IDs are deterministic for identical params.</span>
              {isSuccess && previewMarketId && (
                <a className="mc-link" href={`/markets/${previewMarketId}`}>
                  Go to market →
                </a>
              )}
            </div>
          </div>

          <div className="mc-card">
            <h3 className="mc-preview-title">Next Steps</h3>
            <ul className="mc-steps">
              <li>Supply loan token liquidity to seed the pool.</li>
              <li>Deposit collateral and borrow against it.</li>
              <li>Share the market ID with lenders and borrowers.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Page

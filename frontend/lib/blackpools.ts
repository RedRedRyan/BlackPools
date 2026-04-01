import type { Address, Hex } from 'viem'
import { BlackPoolsAbi } from './abi'
import { getBlackPoolsAddress, SEPOLIA_CHAIN_ID, type InEuint128, type MarketParams } from './contracts'

type ReadConfig = {
  address: Address
  abi: typeof BlackPoolsAbi
  functionName: string
  args: readonly unknown[]
  chainId: number
}

type WriteConfig = ReadConfig

const requireBlackPoolsAddress = (chainId: number): Address => {
  const address = getBlackPoolsAddress(chainId)
  if (!address) {
    throw new Error(`Missing BlackPools address for chainId ${chainId}. Set NEXT_PUBLIC_BLACKPOOLS_ADDRESS.`)
  }
  return address
}

const baseConfig = (functionName: string, args: readonly unknown[], chainId: number): ReadConfig => ({
  address: requireBlackPoolsAddress(chainId),
  abi: BlackPoolsAbi,
  functionName,
  args,
  chainId
})

// ---- Read configs ----
export const marketConfig = (marketId: Hex, chainId: number = SEPOLIA_CHAIN_ID): ReadConfig =>
  baseConfig('market', [marketId], chainId)

export const positionConfig = (marketId: Hex, user: Address, chainId: number = SEPOLIA_CHAIN_ID): ReadConfig =>
  baseConfig('position', [marketId, user], chainId)

export const marketParamsConfig = (marketId: Hex, chainId: number = SEPOLIA_CHAIN_ID): ReadConfig =>
  baseConfig('idToMarketParams', [marketId], chainId)

export const isMarketCreatedConfig = (marketId: Hex, chainId: number = SEPOLIA_CHAIN_ID): ReadConfig =>
  baseConfig('isMarketCreated', [marketId], chainId)

// ---- Write configs ----
export const createMarketConfig = (params: MarketParams, chainId: number = SEPOLIA_CHAIN_ID): WriteConfig =>
  baseConfig('createMarket', [params], chainId)

export const supplyConfig = (
  params: MarketParams,
  encryptedAssets: InEuint128,
  plainAssets: bigint,
  onBehalfOf: Address,
  chainId: number = SEPOLIA_CHAIN_ID
): WriteConfig => baseConfig('supply', [params, encryptedAssets, plainAssets, onBehalfOf], chainId)

export const withdrawConfig = (
  params: MarketParams,
  encryptedShares: InEuint128,
  plainShares: bigint,
  user: Address,
  receiver: Address,
  chainId: number = SEPOLIA_CHAIN_ID
): WriteConfig => baseConfig('withdraw', [params, encryptedShares, plainShares, user, receiver], chainId)

export const supplyCollateralConfig = (
  params: MarketParams,
  encryptedCollateral: InEuint128,
  plainCollateral: bigint,
  user: Address,
  chainId: number = SEPOLIA_CHAIN_ID
): WriteConfig => baseConfig('supplyCollateral', [params, encryptedCollateral, plainCollateral, user], chainId)

export const withdrawCollateralConfig = (
  params: MarketParams,
  encryptedAssets: InEuint128,
  plainAssets: bigint,
  onBehalfOf: Address,
  receiver: Address,
  chainId: number = SEPOLIA_CHAIN_ID
): WriteConfig => baseConfig('withdrawCollateral', [params, encryptedAssets, plainAssets, onBehalfOf, receiver], chainId)

export const borrowConfig = (
  params: MarketParams,
  encryptedBorrowAmount: InEuint128,
  plainAmount: bigint,
  user: Address,
  receiver: Address,
  chainId: number = SEPOLIA_CHAIN_ID
): WriteConfig => baseConfig('borrow', [params, encryptedBorrowAmount, plainAmount, user, receiver], chainId)

export const repayConfig = (
  params: MarketParams,
  encryptedRepayAmount: InEuint128,
  plainAmount: bigint,
  user: Address,
  chainId: number = SEPOLIA_CHAIN_ID
): WriteConfig => baseConfig('repay', [params, encryptedRepayAmount, plainAmount, user], chainId)

export const accrueInterestConfig = (
  params: MarketParams,
  encryptedRate: InEuint128,
  plainRate: bigint,
  chainId: number = SEPOLIA_CHAIN_ID
): WriteConfig => baseConfig('accrueInterest', [params, encryptedRate, plainRate], chainId)

export const liquidateConfig = (
  params: MarketParams,
  borrower: Address,
  encryptedSeizedAssets: InEuint128,
  plainSeizedAssets: bigint,
  chainId: number = SEPOLIA_CHAIN_ID
): WriteConfig => baseConfig('liquidate', [params, borrower, encryptedSeizedAssets, plainSeizedAssets], chainId)

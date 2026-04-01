import type { Address, Hex } from 'viem'
import { encodeAbiParameters, isAddress, keccak256 } from 'viem'
import {
  BlackPoolsAbi,
  BlackPoolsTaskManagerAbi,
  MockPoolAbi,
  TestERC20Abi,
  TestPriceOracleAbi
} from './abi'

export const SEPOLIA_CHAIN_ID = 11155111

export type MarketParams = {
  loanToken: Address
  collateralToken: Address
  oracle: Address
  lltv: bigint
}

export type InEuint128 = {
  ctHash: bigint
  securityZone: number
  utype: number
  signature: Hex
}

export type ContractsForChain = {
  chainId: number
  blackPools?: Address
  mockPool?: Address
  taskManager?: Address
  testUSDC?: Address
  testWETH?: Address
  testOracle?: Address
}

const envAddress = (key: string): Address | undefined => {
  const value = process.env[key]
  if (!value) return undefined
  return isAddress(value) ? (value as Address) : undefined
}

const SEPOLIA_CONTRACTS: ContractsForChain = {
  chainId: SEPOLIA_CHAIN_ID,
  blackPools: envAddress('NEXT_PUBLIC_BLACKPOOLS_ADDRESS'),
  mockPool: envAddress('NEXT_PUBLIC_MOCKPOOL_ADDRESS'),
  taskManager: envAddress('NEXT_PUBLIC_TASKMANAGER_ADDRESS'),
  testUSDC: envAddress('NEXT_PUBLIC_TEST_USDC_ADDRESS'),
  testWETH: envAddress('NEXT_PUBLIC_TEST_WETH_ADDRESS'),
  testOracle: envAddress('NEXT_PUBLIC_TEST_ORACLE_ADDRESS')
}

export const CONTRACTS = {
  sepolia: SEPOLIA_CONTRACTS
} as const

export const CONTRACT_ABIS = {
  blackPools: BlackPoolsAbi,
  taskManager: BlackPoolsTaskManagerAbi,
  mockPool: MockPoolAbi,
  testERC20: TestERC20Abi,
  testPriceOracle: TestPriceOracleAbi
} as const

const MARKET_PARAMS_ABI = [
  { name: 'loanToken', type: 'address' },
  { name: 'collateralToken', type: 'address' },
  { name: 'oracle', type: 'address' },
  { name: 'lltv', type: 'uint128' }
] as const

export const marketId = (params: MarketParams): Hex => {
  return keccak256(
    encodeAbiParameters(MARKET_PARAMS_ABI, [
      params.loanToken,
      params.collateralToken,
      params.oracle,
      params.lltv
    ])
  )
}

export const getContractsForChain = (chainId: number = SEPOLIA_CHAIN_ID): ContractsForChain | undefined => {
  if (chainId === SEPOLIA_CHAIN_ID) return SEPOLIA_CONTRACTS
  return undefined
}

export const getBlackPoolsAddress = (chainId: number = SEPOLIA_CHAIN_ID): Address | undefined =>
  getContractsForChain(chainId)?.blackPools

export const getMockPoolAddress = (chainId: number = SEPOLIA_CHAIN_ID): Address | undefined =>
  getContractsForChain(chainId)?.mockPool

export const getTaskManagerAddress = (chainId: number = SEPOLIA_CHAIN_ID): Address | undefined =>
  getContractsForChain(chainId)?.taskManager

export const getTestUSDCAddress = (chainId: number = SEPOLIA_CHAIN_ID): Address | undefined =>
  getContractsForChain(chainId)?.testUSDC

export const getTestWETHAddress = (chainId: number = SEPOLIA_CHAIN_ID): Address | undefined =>
  getContractsForChain(chainId)?.testWETH

export const getTestOracleAddress = (chainId: number = SEPOLIA_CHAIN_ID): Address | undefined =>
  getContractsForChain(chainId)?.testOracle

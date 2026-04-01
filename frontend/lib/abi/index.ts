import type { Abi } from 'viem'
import BlackPoolsAbiJson from './BlackPools.json'
import BlackPoolsTaskManagerAbiJson from './BlackPoolsTaskManager.json'
import MockPoolAbiJson from './MockPool.json'
import TestERC20AbiJson from './TestERC20.json'
import TestPriceOracleAbiJson from './TestPriceOracle.json'
import TUSDTAbiJson from './TUSDT.json'

const normalizeAbi = (value: unknown): Abi => {
  if (Array.isArray(value)) {
    return value as Abi
  }
  const maybeArtifact = value as { abi?: Abi }
  if (!maybeArtifact?.abi) {
    return [] as Abi
  }
  return maybeArtifact.abi
}

export const BlackPoolsAbi = normalizeAbi(BlackPoolsAbiJson)
export const BlackPoolsTaskManagerAbi = normalizeAbi(BlackPoolsTaskManagerAbiJson)
export const MockPoolAbi = normalizeAbi(MockPoolAbiJson)
export const TestERC20Abi = normalizeAbi(TestERC20AbiJson)
export const TestPriceOracleAbi = normalizeAbi(TestPriceOracleAbiJson)
export const TUSDTAbi = normalizeAbi(TUSDTAbiJson)

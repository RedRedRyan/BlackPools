import type { Address } from 'viem'
import { TestERC20Abi } from './abi'
import { SEPOLIA_CHAIN_ID } from './contracts'

type Config = {
  address: Address
  abi: typeof TestERC20Abi
  functionName: string
  args: readonly unknown[]
  chainId: number
}

const baseConfig = (address: Address, functionName: string, args: readonly unknown[], chainId: number): Config => ({
  address,
  abi: TestERC20Abi,
  functionName,
  args,
  chainId
})

export const erc20BalanceOfConfig = (
  token: Address,
  owner: Address,
  chainId: number = SEPOLIA_CHAIN_ID
): Config => baseConfig(token, 'balanceOf', [owner], chainId)

export const erc20AllowanceConfig = (
  token: Address,
  owner: Address,
  spender: Address,
  chainId: number = SEPOLIA_CHAIN_ID
): Config => baseConfig(token, 'allowance', [owner, spender], chainId)

export const erc20ApproveConfig = (
  token: Address,
  spender: Address,
  amount: bigint,
  chainId: number = SEPOLIA_CHAIN_ID
): Config => baseConfig(token, 'approve', [spender, amount], chainId)

export const erc20TransferConfig = (
  token: Address,
  to: Address,
  amount: bigint,
  chainId: number = SEPOLIA_CHAIN_ID
): Config => baseConfig(token, 'transfer', [to, amount], chainId)

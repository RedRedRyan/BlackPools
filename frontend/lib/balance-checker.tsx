"use client"
import { useReadContract } from 'wagmi'
import { TUSDTAbi } from './abi'
import { ethereumSepolia } from '@/config'

const tusdtAddress = process.env.NEXT_PUBLIC_SEPOLIA_PUBLIC_USDT_ADDRESS
const tusdtContractAddress = tusdtAddress ? (tusdtAddress as `0x${string}`) : undefined
const tusdcAddress = process.env.NEXT_PUBLIC_SEPOLIA_PUBLIC_USDC_ADDRESS
const tusdcContractAddress = tusdcAddress ? (tusdcAddress as `0x${string}`) : undefined

interface token{
  name: string
  network: string
  symbol: string
  decimals: number
  address: `0x${string}`
  blockExplorerUrl: string

}
interface BalanceResult {
  balance: bigint | undefined
  isError: boolean
  isLoading: boolean
  tokenContractAddress: `0x${string}` | undefined
}
const TUSDT_TOKEN: token = {
  name: 'Tether USD',
  network: 'Sepolia',
  symbol: 'TUSDT',
  decimals: 6,
  address: tusdtContractAddress as `0x${string}`,
  blockExplorerUrl: `https://sepolia.etherscan.io/address/${tusdtContractAddress}`

}

const TUSDC_TOKEN: token = {
  name: 'USDC',
  network: 'Sepolia',
  symbol: 'TUSDC',
  decimals: 6,
  address: tusdcContractAddress as `0x${string}`,
  blockExplorerUrl: `https://sepolia.etherscan.io/address/${tusdcContractAddress}`

}

export function useGetEthSepoliaGetBalanceOfTUSDT(address?: `0x${string}`): BalanceResult {
  const { data, isError, isLoading } = useReadContract({
    address: tusdtContractAddress,
    abi: TUSDTAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ethereumSepolia.id,
    query: {
      enabled: Boolean(address && tusdtContractAddress),
    }
  })

  return {
    balance: data as bigint | undefined,
    isError,
    isLoading,
    tokenContractAddress: tusdtContractAddress,
  }
}


export function useGetEthSepoliaGetBalanceOfTUSDC(address?: `0x${string}`): BalanceResult {
  const { data, isError, isLoading } = useReadContract({
    address: tusdcContractAddress,
    abi: TUSDTAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ethereumSepolia.id,
    query: {
      enabled: Boolean(address && tusdcContractAddress),
    }
  })
  return {
    balance: data as bigint | undefined,
    isError,
    isLoading,
    tokenContractAddress: tusdcContractAddress,
  }
}
//Usage example:
// const { balance :TUSDTBalance, isLoading: isTUSDTBalanceLoading, isError: isTUSDTBalanceError } = useGetEthSepoliaGetBalanceOfTUSDT(address as `0x${string}` | undefined)
// const { balance :TUSDCBalance, isLoading: isTUSDCBalanceLoading, isError: isTUSDCBalanceError } = useGetEthSepoliaGetBalanceOfTUSDC(address as `0x${string}` | undefined)
//const formattedTUSDTBalance = typeof TUSDTBalance === 'bigint'
//  ? Number(formatUnits(TUSDTBalance, 6)).toLocaleString('en-US', { minimumFractionDigits: 2 })
//  : null
//const formattedTUSDCBalance = typeof TUSDCBalance === 'bigint'
//  ? Number(formatUnits(TUSDCBalance, 6)).toLocaleString('en-US', { minimumFractionDigits: 2 })
//console.log(`TUSDT Balance: ${formattedTUSDTBalance !== null ? formattedTUSDTBalance : 'N/A'}`)
//console.log(`TUSDC Balance: ${formattedTUSDCBalance !== null ? formattedTUSDCBalance : 'N/A'}`)
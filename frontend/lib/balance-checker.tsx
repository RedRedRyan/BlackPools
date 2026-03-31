"use client"
import { useReadContract } from 'wagmi'
import { TUSDTAbi } from './abi'
import { ethereumSepolia } from '@/config'

const tusdtAddress = process.env.NEXT_PUBLIC_SEPOLIA_PUBLIC_USDT_ADDRESS
const contractAddress = tusdtAddress ? (tusdtAddress as `0x${string}`) : undefined

function useGetEthSepoliaGetBalanceOfTUSDT(address?: `0x${string}`) {
  const { data, isError, isLoading } = useReadContract({
    address: contractAddress,
    abi: TUSDTAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ethereumSepolia.id,
    query: {
      enabled: Boolean(address && contractAddress),
    }
  })

  return {
    balance: data,
    isError,
    isLoading,
    contractAddress,
  }
}
 
export default useGetEthSepoliaGetBalanceOfTUSDT

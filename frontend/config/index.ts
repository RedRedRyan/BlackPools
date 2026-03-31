import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, baseSepolia, arbitrumSepolia } from '@reown/appkit/networks'
import { defineChain } from '@reown/appkit/networks'
// Get projectId from https://dashboard.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID
export const ethereumSepolia = defineChain({
  id: 11155111,
  name: 'Ethereum Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH'
  },
  rpcUrls: {
    default: {
      http: ['https://ethereum-sepolia-public.nodies.app']
    },
    public: {
      http: ['https://ethereum-sepolia-public.nodies.app']
    }
  },
  blockExplorers: {
    default: {
      name: 'etherscan-sepolia',
      url: 'https://sepolia.etherscan.io'
    }
  },
  testnet: true,
  chainNamespace: 'eip155',
  caipNetworkId: `eip155:${11155111}`,
})

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [baseSepolia, arbitrumSepolia,ethereumSepolia]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig


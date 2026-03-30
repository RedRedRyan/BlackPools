interface MarketCardProps {
    network: string;
    networkName: string;
    collateral: string;
    collateralSymbol: string;
    loan: string;
    loanSymbol: string;
    lltv: string;
    sixHrRate: string;
    totalLiquidity: string;
    slug: string;
}

interface CoinPairProps {
  collateral: string;
  collateralSymbol: string;
  loan: string;
  loanSymbol: string;
}
interface VaultCardProps {
  network: string;
  token: string;
  name: string;
  curator: string;
  liquidity: string;
  apy: string;
  slug: string;

}

export type {
    MarketCardProps,
    CoinPairProps,
    VaultCardProps
}
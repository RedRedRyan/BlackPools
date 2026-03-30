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

export type {
    MarketCardProps,
    CoinPairProps
}
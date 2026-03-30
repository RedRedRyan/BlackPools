import Link from 'next/link';
import React from 'react'
import { MarketCardProps, CoinPairProps } from '@/type';

const CoinPair: React.FC<CoinPairProps> = ({ collateral, collateralSymbol, loan, loanSymbol }) => (
  <div className="coin-pair">
    <div className="coin-icons">
    <img src={collateral} alt={collateralSymbol} className="coin-icon" />
    <img src={loan} alt={loanSymbol} className="coin-icon overlap" />
    </div>
    <span>{collateralSymbol} / {loanSymbol}</span>
  </div>
);

const MarketCard = ({network, networkName, collateral, collateralSymbol, loan, loanSymbol, lltv, sixHrRate, totalLiquidity, slug}: MarketCardProps) => {

  return (
    <Link href={`/markets/${slug}`}>
      <img src={network} alt={networkName} className='size-10' />
      <CoinPair
        collateral={collateral}
        collateralSymbol={collateralSymbol}
        loan={loan}
        loanSymbol={loanSymbol}
      />
      <div className="market-stats">
        <div className="stat">
          <span className="label">LLTV</span>
          <span className="value">{lltv}</span>
        </div>
        <div className="stat">
          <span className="label">6h Rate</span>
          <span className="value">{sixHrRate}</span>
        </div>
        <div className="stat">
          <span className="label">Liquidity</span>
          <span className="value">{totalLiquidity}</span>
        </div>
      </div>
    </Link>
  )
}

export default MarketCard
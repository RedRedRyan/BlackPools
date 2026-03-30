import Link from 'next/link';
import React from 'react'
import Image from 'next/image';
import { Props } from 'next/script';

interface VaultCardProps {
    network: string;
    networkName: string;
    name: string;
    curator: string;
    liquidity: string;
    apy: string;
    slug: string;

}


const VaultCard = ({network , networkName, name, curator, liquidity, apy, slug}: VaultCardProps) => {
  return (
    <Link href={`/vaults/${slug}`} id="vault-card">
        <img src={network} alt={name} className='size-10'/>
        <div className="vault-info">
                  <h3>{name}</h3>
                  <p className="curator">by {curator}</p>
                </div>
                <div className="vault-stats">
                  <div className="stat">
                    <span className="label">Liquidity</span>
                    <span className="value">{liquidity}</span>
                  </div>
                  <div className="stat highlight">
                    <span className="label">APY</span>
                    <span className="value apy">{apy}</span>
                  </div>
                </div>
    </Link>
  )
}

export default VaultCard
import React from 'react'
import { VaultCardProps } from '@/type'
import { notFound } from 'next/navigation'

const VaultDetails = async ({network , token, name, curator, liquidity, apy, slug}: VaultCardProps) => {
    
  return (
    <section id='events' className='min-h-screen'>
      <div className='header'>
    <h1>Vault Details for  {name}</h1>
    <p className='details'>Stake {token} and earn </p>
  </div>


    </section>
    
  )
}

export default VaultDetails
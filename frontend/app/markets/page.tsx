"use client"
import React from 'react'
import MarketCard from '@/components/MarketCard';
import { marketsList } from '@/constants';
import Particles from '@/components/Particles';

const page = () => {
  return (
    <section id="markets">
      <div className="absolute inset-0 w-full h-full ">
          
          <Particles
          particleColors={["#a4f4a1"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
        </div>
      
      <div className="list">
        <div className="loved">
		 <h2>Most popular markets</h2>
		 
		 <ul>
            {marketsList.map((vault) => (
              <li key={vault.collateralSymbol + vault.loanSymbol}>
				<MarketCard {... vault}
				/>
			  </li>
            ))}
          </ul>
		</div>
    </div>
    </section>
  )
}

export default page
import React from 'react'
import MarketCard from '@/components/MarketCard';
import { marketsList } from '@/constants';

const page = () => {
  return (
    <section id="markets">
      
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
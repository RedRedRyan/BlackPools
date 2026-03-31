"use client"
import { useGSAP } from '@gsap/react'
import gsap from 'gsap';
import { marketsList } from '@/constants';
import MarketCard from '@/components/MarketCard';


const Page = () => {

  useGSAP(() => {
    gsap.from('#left-safe', {
      x: -400,
      duration: 1,
      ease: 'power1.inOut'
    })
  })

  return (
    <section id="markets" className="noisy">


      <img src="/images/rates.png" alt="l-safe" id="left-safe" className='size-100 xl:size-150' />

      <div className="list">
        <div className="loved">
          <div className='flex-col text-right'>
            <h2 className='text-4xl text-green'>Borrow</h2>
            <h2>Lowest Rates</h2>
            
          </div>

          <ul className='market-grid'>
            <div className='md:col-span-1'></div>
            {marketsList.map((market) => (
              <li key={market.slug}>
                <MarketCard {...market} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Page
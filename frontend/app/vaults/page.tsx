"use client"
import { useGSAP } from '@gsap/react'
import gsap from 'gsap';
import { vaultLists, marketsList } from '@/constants';
import { Item } from 'three/examples/jsm/inspector/ui/Item.js';
import VaultCard from '@/components/VaultCard';
import MarketCard from '@/components/MarketCard';
import { use } from 'react';


const Page = () => {

 useGSAP(() => {

	gsap.from('#right-safe', {
		x: 100, y: 600
	})
	
 })
 
 return (
	
	<section id="vaults" className="noisy">

	 <img src="/images/safe.png" alt="r-safe" id="right-safe" className='size-160  xl:size-240'/>
	 
	 <div className="list">
		<div className="popular">
			<div className='flex-col'>
		 <h2 className='text-4xl text-green'>InvisiVaults </h2>
		 <h2>Lock and Earn </h2>
		 </div>



		 <ul className='vault-grid'>{vaultLists.map((vault)=> (
			<li key={vault.name}>
			<VaultCard {...vault}/>
			</li>
		 ))}  </ul>
		 
		</div>
		

		
	 </div>
	</section>
 )
}

export default Page
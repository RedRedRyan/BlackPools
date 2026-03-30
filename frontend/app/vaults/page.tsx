"use client"
import { useGSAP } from '@gsap/react'
import gsap from 'gsap';
import { vaultLists, marketsList } from '@/constants';
import { Item } from 'three/examples/jsm/inspector/ui/Item.js';
import VaultCard from '@/components/VaultCard';
import MarketCard from '@/components/MarketCard';
import { use } from 'react';
import Particles from '@/components/Particles';

const Page = () => {

 useGSAP(() => {

	gsap.from('#c-right-leaf', {
		x: 100, y: 600
	})
	const parallaxTimeline = gsap.timeline({
	 scrollTrigger: {
		trigger: '#about',
		start: 'top 30%',
		end: 'bottom 80%',
		scrub: true,
	 }
	})
	
	parallaxTimeline
	 .from('#c-left-leaf', {
		x: -100, y: 100
	})
	
 })
 
 return (
	
	<section id="vaults" className="noisy">
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
	 <img src="/images/sawww.png" alt="l-leaf" id="c-left-leaf" />
	 <img src="/images/safe.png" alt="r-leaf" id="c-right-leaf" className='size-160  xl:size-240'/>
	 
	 <div className="list">
		<div className="popular">
			<div className='flex-col'>
		 <h2 className='text-4xl text-green'>Vaults</h2>
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
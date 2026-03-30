"use client"

import gsap from 'gsap';
import { useGSAP } from '@gsap/react'

import { navLinks } from '@/constants';
import Link from 'next/link';
import ConnectButton from './ConnectButton';

const Navbar = () => {
 useGSAP(() => {
	const navTween = gsap.timeline({
	 scrollTrigger: {
		trigger: 'nav',
		start: 'bottom top'
	 }
	});
	
	navTween.fromTo('nav', { backgroundColor: 'transparent' }, {
	 backgroundColor: '#00000050',
	 backgroundFilter: '#355a7a',
	 duration: 1,
	 ease: 'power1.inOut'
	});
 })
 
 return (
	<nav>
	 <div>
		<a href="./" className="flex items-center gap-2">
		 <img src="/images/logo.png" alt="logo" className='size-12'/>
		 <p>Blackpools</p>
		</a>
		
		<ul>
		 {navLinks.map((link) => (
			<li key={link.id}>
			 <Link href={`${link.id}`}>{link.title}</Link>

			 
			</li>
		 ))}
		 <ConnectButton />
		</ul>
	 </div>
	</nav>
 )
}
export default Navbar
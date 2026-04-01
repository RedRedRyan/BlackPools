"use client"

import gsap from 'gsap';
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/all';

import { navLinks } from '@/constants';
import Link from 'next/link';
import ConnectButton from './ConnectButton';

gsap.registerPlugin(ScrollTrigger);

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
		<Link href="/" className="flex items-center gap-2">
		 <img src="/images/navbarlogo.png" alt="logo" className='h-16'/>
		</Link>
		
		<ul className="list-none">
		 {navLinks.map((link) => (
			<li key={link.id}>
			 <Link href={`/${link.id}`} className='hover:text-green'>{link.title}</Link>

			 
			</li>
		 ))}
		 <ConnectButton />
		</ul>
	 </div>
	</nav>
 )
}
export default Navbar
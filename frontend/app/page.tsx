"use client"
import About from "@/components/About";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { useMediaQuery } from "react-responsive";
import Particles from "@/components/Particles";
import ConnectButton from "@/components/ConnectButton";


const Hero = () => {
 const isMobile = useMediaQuery({ maxWidth: 767 });
 
 useGSAP(() => {
	const heroSplit = new SplitText(".title", {
	 type: "chars, words",
	});
	
	const paragraphSplit = new SplitText(".subtitle", {
	 type: "lines",
	});
	
	// Apply text-gradient class once before animating
	heroSplit.chars.forEach((char) => char.classList.add("text-gradient"));
	
	gsap.from(heroSplit.chars, {
	 yPercent: 100,
	 duration: 1.8,
	 ease: "expo.out",
	 stagger: 0.06,
	});
	
	gsap.from(paragraphSplit.lines, {
	 opacity: 0,
	 yPercent: 100,
	 duration: 1.8,
	 ease: "expo.out",
	 stagger: 0.06,
	 delay: 1,
	});
	
	gsap
	.timeline({
	 scrollTrigger: {
		trigger: "#hero",
		start: "top top",
		end: "bottom top",
		scrub: true,
	 },
	})
	.to(".hero-walet", { y: 200 }, 0)
	.to(".arrow", { y: 100 }, 0);
	
	
	
	
 }, []);
 
 return (
	<>

	 <section id="hero" className="noisy">
		<h1 className="title">Blackpools</h1>
		
		<img
		 src="/images/wallet.png"
		 alt="right-leaf"
		 className="hero-wallet"
		/>
		
		<div className="body">
		 {/* <img src="/images/arrow.png" alt="arrow" className="arrow" /> */}
		 
		 <div className="content">
			<div className="space-y-5 hidden md:block">
			 <p>Earn. Lend. Borrow.</p>
			 
			 <p className="subtitle">
				Hidden<br />Liquidity 
			 </p>
			 </div>
			 
			
			
			<div className="hero-buttons">
			 
			<ConnectButton  />
						 <a href="#about" className="alt-badge">Learn More</a>
			</div>
		 </div>
		</div>
	 </section>
	 
	 
   <About />
	</>
 );
};

export default Hero;
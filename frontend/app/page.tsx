"use client"
import About from "@/components/About";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import Particles from "@/components/Particles";
import ConnectButton from "@/components/ConnectButton";


const Hero = () => {
 const videoRef = useRef();
 
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
	.to(".left-leaf", { y: -200 }, 0)
	.to(".arrow", { y: 100 }, 0);
	
	const startValue = isMobile ? "top 50%" : "center 60%";
	const endValue = isMobile ? "120% top" : "bottom top";
	
	let tl = gsap.timeline({
	 scrollTrigger: {
		trigger: "video",
		start: startValue,
		end: endValue,
		scrub: true,
		pin: true,
	 },
	});
	
	
 }, []);
 
 return (
	<>
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
	 <section id="hero" className="noisy">
		<h1 className="title">Blackpools</h1>
		
		<img
		 src="/images/wallet2'.png"
		 alt="left-leaf"
		 className="left-leaf"
		/>
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
				Confidential <br /> Lending
			 </p>
			</div>
			
			<div className="view-cocktails">
			 
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
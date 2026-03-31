import gsap from 'gsap';
import { SplitText} from 'gsap/all'
import { useGSAP } from '@gsap/react'
import { features } from '@/constants';

const About = () => {
 useGSAP(() => {
	const titleSplit = SplitText.create('#about h2', {
	 type: 'words'
	})
	
	const scrollTimeline = gsap.timeline({
	 scrollTrigger: {
		trigger: '#about',
		start: 'top center'
	 }
	})
	
	scrollTimeline
	 .from(titleSplit.words, {
		opacity: 0, duration: 1, yPercent: 100, ease: 'expo.out', stagger: 0.02
	})
	 .from('.top-grid div, .bottom-grid div', {
		opacity: 0, duration: 1, ease: 'power1.inOut', stagger: 0.04,
	}, '-=0.5')
 })
 
 return (
	<div id="about">
	 <div className="mb-16 md:px-0 px-5">
		<div className="content">
		 <div className="md:col-span-8">
			<p className="badge">Best Rates</p>
			<h2>
			 Encrypted <span className="text-white">-</span>
				by design
			</h2>
		 </div>
		 
		 <div className="sub-content">
			<p>
			Black Pools is a confidential lending
and borrowing protocol powered by
Fully Homomorphic Encryption
(FHE)
			</p>
			
			<div>
			 <p className="md:text-3xl text-xl font-bold">
				<span>5,000</span> $
			 </p>
			 <p className="text-sm text-white-100">
				TVL
			 </p>
			</div>
		 </div>
		</div>
	 </div>
	 
	 <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="col-span-4">
            <div className="feature-card p-6 rounded-lg h-full">
              <div className="feature-icon">
                <img
                  src={feature.icon || "/placeholder.svg"}
                  alt={feature.title}
                  className="w-32 h-32"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
		<div className='col-span-4 bg-green flex items-center justify-center'>
			<h1 className='text-center text-black'>Blackpools</h1>
		</div>
      </div>
	 
	</div>
 )
}
export default About
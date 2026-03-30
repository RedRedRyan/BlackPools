import { navLinks } from '@/constants';

const Footer = () => {
  return (
    <section id="footer">
    <div className='footer-grid'>
		<div className="md:col-span-2">
		 <div  className="info1" />
         {/* <h1>Socials</h1>
		 
		 <div className="flex-center gap-5">
			{socials.map((social) => (
			 <a
			 	key={social.name}
				href={social.url}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={social.name}
			 >
				<img src={social.icon} className='size-10' />
			 </a>
			))}
		 </div> */}
		 
		 
		</div>
		
		<div className="md:col-span-2">
		 <div  className="info2" />
            <ul className='font-arvo text-xl text-white'>
		 {navLinks.map((link) => (
			<li key={link.id}>
			 <a href={link.id}>{link.title}</a>
			</li>
		 ))}
		</ul>
		</div>

        <div className="md:col-span-2">
		<p className='text-purple mb-3 text-xl'>ystudioske@gmail.com</p>
        <p className='text-[white]'>&copy; {new Date().getFullYear()} YStudios. All Rights Reserved.</p>
            </div>
        
		
		
     </div>
    </section>
  )
}

export default Footer

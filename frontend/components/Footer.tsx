import { navLinks,socials } from '@/constants';
import Link from 'next/link';

const Footer = () => {
  return (
    <section id="footer">
    <div className='footer-grid'>
		<div className="md:col-span-2">
		 <div  className="info1" />
         <h1>Powered by</h1>
		 
		 <div className="flex-center gap-5">
			{socials.map((social) => (
			 <a
			 	key={social.name}
				href={social.url}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={social.name}
			 >
				<img src={social.icon} className='w-64' />
			 </a>
			))}
		 </div>
		 
		 
		</div>
		
		<div className="md:col-span-2 ">
		 <div  className="info2" />
            <ul className='font-arvo text-xl text-white list-none font-schibsted-grotesk'>
		 {navLinks.map((link) => (
			<li key={link.id}>
			 <Link href={`/${link.id}`}  className='hover:text-green'>{link.title}</Link>
			</li>
		 ))}
		</ul>
		</div>

        <div className="md:col-span-2 ">
		<a className='text-green mb-3 text-lg' href='https://ystudios.vercel.app/'>ystudios</a>
        <p className='text-white font-bold'>&copy; {new Date().getFullYear()} YStudios. All Rights Reserved.</p>
            </div>
        
		
		
     </div>
    </section>
  )
}

export default Footer

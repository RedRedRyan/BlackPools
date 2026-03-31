"use-client"
import React from 'react'
import Particles from '@/components/Particles'

const page = () => {
  return (
    <section id='dashboard'>
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
        <h1>Dashboard</h1>
    </section>
  )
}

export default page
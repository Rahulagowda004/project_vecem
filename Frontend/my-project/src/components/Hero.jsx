import React from 'react';
import Profile from '../assets/profile.png';
import "../Css/Hero.css";

const Hero = () => {
  return (
    <section className='h-max md:h-screen bg-gradient-to-l bg-gray-950 text-white flex flex-col justify-center items-center relative z-10 pb-10'>
     
      <div className='max-w-7xl mt-24 mx-auto items-center flex flex-col md:flex-row gap-16 md:gap-40 justify-between'>
        <div className='md:space-y-6 px-4'>
          <h1 className='md:text-6xl text-4xl font-bold mb-4'>
            THE AI COMMUNITY BUILDING THE FUTURE. <p className='text-blue-400'></p>
          </h1>
          <p className='md:text-2xl text-lg mb-3'>
            The platform where the machine learning community collaborates on models, datasets, and applications.
          </p>
        </div>
        <div className='relative'>
          <img
            src={Profile}
            alt="Profile"
            className='border-blue-600 md:w-[1000px] w-[1000px] shadow-[0px_0px_20px_10px_rgba(0,0,0,0.3)] shadow-blue-500'
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;

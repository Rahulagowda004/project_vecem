import React from 'react';

const Hero = () => {
  return (
    <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen">
      <div className="absolute top-0 w-full h-full bg-center bg-cover"
           style={{
             backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')"
           }}>
        <span className="w-full h-full absolute opacity-50 bg-black"></span>
      </div>
      
      <div className="container relative mx-auto">
        <div className="items-center flex flex-wrap">
          <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
            <div className="pr-12">
              <h1 className="text-5xl font-bold text-white">
                Your Journey Begins with Vecem
              </h1>
              <p className="mt-4 text-lg text-gray-300">
                Experience the future of digital innovation. Vecem provides cutting-edge solutions
                that transform the way you interact with technology.
              </p>
              <button className="mt-8 bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
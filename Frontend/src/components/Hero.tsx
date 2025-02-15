import React from 'react';

const Hero = () => {
  return (
    <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen h-screen">
      <div className="absolute top-0 w-full h-full bg-center bg-cover"
           style={{
             backgroundImage: "url('https://images.pexels.com/photos/1210276/pexels-photo-1210276.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')"
           }}>
        <span className="w-full h-full absolute opacity-50 bg-black"></span>
      </div>
      
      <div className="container relative mx-auto h-full flex justify-center items-center">
        <div className="w-full lg:w-8/12 px-4 text-center absolute"
             style={{
               top: "50%",  // Adjust this to move text down/up
               left: "50%", // Adjust this to move text left/right
               transform: "translate(-50%, -50%)" // Center the text
             }}>
          <h1 className="text-6xl font-bold text-white mb-10">
            Your Journey Begins with Vecem
          </h1>
          <p className="text-xl text-gray-300 w-2/3 mx-auto items-center justify-normal">
          Vecem enables effortless sharing and access to vectorized and raw datasets across diverse domains. Connect globally, collaborate, contribute, and exchange insights in an open community, making data more accessible, innovative, and impactful.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;

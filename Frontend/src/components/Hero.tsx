import React from 'react';

const Hero = () => {
  return (
    <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen h-screen">
      <div className="absolute top-0 w-full h-full bg-center bg-cover"
           style={{
             backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')"
           }}>
        <span className="w-full h-full absolute opacity-50 bg-black"></span>
      </div>
      
      <div className="container relative mx-auto h-full">
        <div className="items-center flex flex-wrap h-full">
          <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center h-full">
            <div className="pr-12 h-full">
              <h1 className="text-5xl font-bold text-white">
                Your Journey Begins with Vecem
              </h1>
              <p className="mt-4 text-lg text-gray-300 text-justify w-full">
                Vecem is an all-in-one platform designed to facilitate the seamless sharing and access of vectorized and raw data. Whether you’re a researcher, data scientist, or enthusiast, Vecem allows users to easily upload and download datasets in various formats, including vectorized for enhanced usability and raw data for more in-depth analysis. The site offers a comprehensive library where users can explore and access a vast collection of datasets across a wide array of domains, from scientific research to machine learning.

                Beyond the data, Vecem fosters a vibrant community where users can connect, collaborate, and share insights through built-in chat features. Whether you need help with a dataset, want to discuss data science techniques, or simply engage in interesting conversations about data, the community is here to support you.

                Whether you're looking for high-quality datasets or want to contribute your own, Vecem provides the perfect ecosystem to share, download, and collaborate with like-minded individuals. Join the community and start exploring the world of data today!
              </p>
              {/* <button className="mt-8 bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors">
                Get Started
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
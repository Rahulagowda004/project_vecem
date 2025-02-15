import React from 'react';
import {  Database, Users,PersonStanding} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Database className="w-12 h-12 text-indigo-500" />,
      title: "Hassle-Free Vector Data",
      description: "Easily access and utilize vectorized datasets without the need for high computational power."


    },
    {
      icon: <Users className="w-12 h-12 text-indigo-500" />,
      title: "Open-Source & Community-Driven",
      description: "Contribute, enhance, and innovate—our platform thrives on global collaboration."
    },
    {
      icon: <PersonStanding className="w-12 h-12 text-indigo-500" />,
      title: "Optimized for Accessibility",
      description: "Find and utilize vectorized data easily for research, AI, and other applications."
    }
  ];

  return (
    <section className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap">
          <div className="w-full mb-12 text-center">
            <h2 className="text-4xl font-semibold text-white">
              Why Choose Vecem?
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Empowering users with vectorized data
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap">
          {features.map((feature, index) => (
            <div key={index} className="w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-gray-700 w-full mb-8 rounded-lg p-8">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-gray-800">
                    {feature.icon}
                  </div>
                  <h6 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h6>
                  <p className="mt-2 mb-4 text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
import React from 'react';
import { Database, Users, PersonStanding } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Database className="w-10 h-10 text-cyan-400" />,
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
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap">
          <div className="w-full mb-16 text-center">
            <h2 className="text-4xl font-semibold text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">
              Why Choose Vecem?
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Empowering users with vectorized data
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap -mx-4">
          {features.map((feature, index) => (
            <div key={index} className="w-full md:w-4/12 px-4 mb-8">
              <div className="h-full relative flex flex-col min-w-0 break-words bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-cyan-500/10 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10">
                <div className="flex-auto">
                  <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-slate-900/50 border border-cyan-500/20">
                    {feature.icon}
                  </div>
                  <h6 className="text-xl font-semibold text-white mb-4">
                    {feature.title}
                  </h6>
                  <p className="text-gray-400 leading-relaxed">
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
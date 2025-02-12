import React from 'react';
import AboutImg from '../assets/About.png';
import { FaChevronRight } from 'react-icons/fa';

const About = () => {
  return (
    <div id='about' className='py-20 bg-gray-900 z-50 text-gray-300'>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-4xl md:text-5xl font-bold mb-11 text-center'>About Us</h2>
            
            {/* Paragraph Section */}
            <div className='p-10 md:p-500 bg-gray-950 rounded-md shadow-[0px_0px_20px_10px_rgba(0,0,0,0.3)] shadow-blue-500'>
                <p className='text-lg leading-7 mb-6'>
                The project "Aura of Intelligence" aims to create a centralized, open-source platform for sharing and reusing embeddings across diverse media types, including text, audio, images, and videos. It addresses inefficiencies and redundancy in AI/ML workflows by enabling seamless access to pre-trained embeddings through a web app or integration library.
                </p>
                <p className='text-lg leading-7 mb-6'>
                Key features include multi-media embedding support, embedding generation for multimedia documents, and efficient reuse of pre-trained embeddings to save time and resources. Built with a robust tech stack—React.js, Django, PostgreSQL, and Google Cloud tools—the platform integrates advanced embedding management systems like FAISS and Chroma. 
                </p>
                <p className='text-lg leading-7'>
                Additionally, it leverages Google Gen AI tools, including Vertex AI for text, audio, and video embeddings and Google Vision AI for image embeddings, fostering collaboration and accelerating AI/ML development. 
                </p>

            </div>
        </div>
      </div>
  
  );
};

export default About;
import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-bold mb-2">Quick Links</h3>
            <ul>
              <li><a href="/" className="hover:underline">Home</a></li>
              <li><a href="/about" className="hover:underline">About Us</a></li>
              <li><a href="/services" className="hover:underline">Models</a></li>
              <li><a href="/contact" className="hover:underline">Datasets</a></li>
            </ul>
          </div>

          {/* Mention About Us */}
          <div>
            <h3 className="text-lg font-bold mb-2">About Us</h3>
            <p className="text-sm text-gray-400">
              The platform built to share and collaborate on machine learning models, datasets, and more. Learn more about how we aim to empower the AI community.
            </p>
          </div>

          {/* Follow Us */}
          <div className="md:col-span-1 flex justify-end">
            <div>
              <h3 className="text-lg font-bold mb-2">Follow Us</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center space-x-2 hover:underline"
                >
                  <FaGithub className="text-xl" /> 
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p>&copy; {new Date().getFullYear()} VECTOR EMBEDDINGS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

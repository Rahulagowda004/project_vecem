import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const NeuralNetwork = () => {
  const numPoints = 15;
  const [points, setPoints] = useState<{ x: number; y: number}[]>([]);

  useEffect(() => {
    const generatePoints = () =>
      Array.from({ length: numPoints }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        
      }));

    setPoints(generatePoints());
  }, []);

  return (
    <div className="relative">
      {/* Background animation */}
      <div className="absolute inset-0 pointer-events-none">
        {points.map((point, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-500 rounded-full"
            initial={{ x: point.x, y: point.y }}
            animate={{
              x: [
                point.x,
                point.x + Math.random() * 40 - 20,
                point.x + Math.random() * 40 - 20,
              ],
              y: [
                point.y,
                point.y + Math.random() * 40 - 20,
                point.y + Math.random() * 40 - 20,
              ],
            }}
            transition={{
              duration: 2+ Math.random() * 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NeuralNetwork;

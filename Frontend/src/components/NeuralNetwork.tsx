import React, { useEffect, useRef } from 'react';

// Types
interface NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Constants
const NETWORK_CONFIG = {
  NODE_COUNT: 50,
  CONNECTION_DISTANCE: 150,
  NODE_RADIUS: 3,
  NODE_COLOR: 'rgba(6, 182, 212, 0.8)',
  INITIAL_VELOCITY_RANGE: 2,
} as const;

const NeuralNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const networkNodes: NetworkNode[] = Array.from({ length: NETWORK_CONFIG.NODE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * NETWORK_CONFIG.INITIAL_VELOCITY_RANGE,
      vy: (Math.random() - 0.5) * NETWORK_CONFIG.INITIAL_VELOCITY_RANGE,
    }));

    const updateAndRenderFrame = () => {
      if (!canvas || !context) return;

      // Update canvas dimensions
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Update and render nodes
      networkNodes.forEach(node => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Handle boundary collisions
        if (node.x < 0 || node.x > window.innerWidth) node.vx *= -1;
        if (node.y < 0 || node.y > window.innerHeight) node.vy *= -1;

        // Render node
        context.beginPath();
        context.arc(node.x, node.y, NETWORK_CONFIG.NODE_RADIUS, 0, Math.PI * 2);
        context.fillStyle = NETWORK_CONFIG.NODE_COLOR;
        context.fill();
      });

      // Render connections between nodes
      networkNodes.forEach((sourceNode, index) => {
        networkNodes.slice(index + 1).forEach(targetNode => {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < NETWORK_CONFIG.CONNECTION_DISTANCE) {
            const opacity = 1 - distance / NETWORK_CONFIG.CONNECTION_DISTANCE;
            context.beginPath();
            context.moveTo(sourceNode.x, sourceNode.y);
            context.lineTo(targetNode.x, targetNode.y);
            context.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
            context.stroke();
          }
        });
      });

      requestAnimationFrame(updateAndRenderFrame);
    };

    updateAndRenderFrame();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none -z-50"
      aria-label="Neural Network Background Animation"
    />
  );
};

export default NeuralNetwork;

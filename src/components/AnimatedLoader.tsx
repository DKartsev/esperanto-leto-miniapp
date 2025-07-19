// src/components/AnimatedLoader.tsx
import { motion } from 'framer-motion';
import robotImg from '../assets/robot.png';

const AnimatedLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#e6fae6] z-50">
      <div className="relative w-44 h-44 animate-spin-slow">
        {/* Планета */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-inner" />

        {/* Робот с анимацией "шагающих" ног */}
        <motion.div
          className="absolute bottom-[35%] left-1/2 -translate-x-1/2 w-24 h-24 z-10"
          animate={{
            y: [0, -4, 0],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.img
            src={robotImg}
            alt="Esperanto Robot"
            className="w-full h-full"
            animate={{
              scaleY: [1, 0.95, 1],
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedLoader;

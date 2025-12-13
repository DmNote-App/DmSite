'use client';

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionWrapperProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  yOffset?: number;
}

export default function MotionWrapper({ 
  children, 
  delay = 0, 
  className = "",
  yOffset = 40 
}: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.8, 
        delay: delay, 
        ease: [0.22, 1, 0.36, 1] // Apple-style ease-out
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

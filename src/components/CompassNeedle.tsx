"use client";

import { motion } from "framer-motion";

type CompassNeedleProps = {
  angle: number;
};

export function CompassNeedle({ angle }: CompassNeedleProps) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{ rotate: angle }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-[55%] w-[55%] drop-shadow-lg"
        aria-hidden
      >
        <polygon
          points="50,8 54,50 50,44 46,50"
          fill="#c0392b"
          stroke="#8b2020"
          strokeWidth="0.5"
        />
        <polygon
          points="50,92 54,50 50,56 46,50"
          fill="#bdc3c7"
          stroke="#7f8c8d"
          strokeWidth="0.5"
        />
        <circle cx="50" cy="50" r="4" fill="#d4af37" stroke="#8b7355" strokeWidth="1" />
      </svg>
    </motion.div>
  );
}

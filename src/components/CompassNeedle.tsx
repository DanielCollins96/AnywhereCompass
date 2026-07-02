"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

type CompassNeedleProps = {
  angle: number;
};

export function CompassNeedle({ angle }: CompassNeedleProps) {
  // Animate a cumulative angle so the needle always takes the shortest arc.
  // Animating the raw 0-360 value makes a 359°→0° change spin the needle
  // almost a full turn the wrong way.
  const prevAngleRef = useRef(angle);
  const cumulativeRef = useRef(angle);

  const delta = ((angle - prevAngleRef.current + 540) % 360) - 180;
  cumulativeRef.current += delta;
  prevAngleRef.current = angle;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{ rotate: cumulativeRef.current }}
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

export function ArrivedMarker() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 14 }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="h-[45%] w-[45%] drop-shadow-lg"
        aria-hidden
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <line
          x1="28"
          y1="28"
          x2="72"
          y2="72"
          stroke="#c0392b"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <line
          x1="72"
          y1="28"
          x2="28"
          y2="72"
          stroke="#c0392b"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <line
          x1="28"
          y1="28"
          x2="72"
          y2="72"
          stroke="#d4af37"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1="72"
          y1="28"
          x2="28"
          y2="72"
          stroke="#d4af37"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.div>
  );
}

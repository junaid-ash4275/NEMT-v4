import React, { useEffect, useState } from "react";

// AnimatedCounter – counts up from 0 to a target value with a smooth animation.
// The component uses a glassmorphism style to blend with the existing app aesthetic.

const AnimatedCounter = ({ target = 1000, duration = 2000, label = "Counter" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16); // roughly 60fps
    const step = () => {
      start += increment;
      if (start >= target) {
        setCount(target);
        return;
      }
      setCount(Math.floor(start));
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // Cleanup on unmount
    return () => {
      // No explicit cleanup needed for requestAnimationFrame loop.
    };
  }, [target, duration]);

  return (
    <div className="flex flex-col items-center p-6 m-4 rounded-xl bg-white/20 backdrop-blur-lg shadow-lg border border-white/30 max-w-xs">
      <span className="text-4xl font-extrabold text-gray-800">{count}</span>
      <span className="mt-2 text-lg text-gray-700">{label}</span>
    </div>
  );
};

export default AnimatedCounter;

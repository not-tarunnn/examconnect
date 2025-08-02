'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TypingTitle = () => {
  const fullText = 'GET SH*T\nDONE';
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const typingSpeed = 120;
    const delayAfterFinish = 1500;

    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[index]);
        setIndex((prev) => prev + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      const resetTimeout = setTimeout(() => {
        setDisplayedText('');
        setIndex(0);
      }, delayAfterFinish);
      return () => clearTimeout(resetTimeout);
    }
  }, [index, fullText]);

  return (
    <motion.h2
      className="relative text-7xl text-slate-800 font-extrabold uppercase leading-tight tracking-tight break-words text-left whitespace-pre-line"
    >
      {displayedText}
      <span className="inline-block w-[0.2em] h-[0.8em] bg-slate-800 ml-1 animate-pulse translate-x-1 " />
    </motion.h2>
  );
};

export default TypingTitle;

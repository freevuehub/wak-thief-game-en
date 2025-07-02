import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed: number = 50): [string, boolean] => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayText('');
    if (text) {
      let i = 0;
      setIsTyping(true);
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, speed);

      return () => {
        clearInterval(typingInterval);
        setIsTyping(false); // Cleanup on unmount or text change
      };
    } else {
      setIsTyping(false);
    }
  }, [text, speed]);

  return [displayText, isTyping];
};

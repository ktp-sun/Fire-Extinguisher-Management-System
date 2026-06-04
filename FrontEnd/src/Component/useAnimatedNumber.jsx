import { useState, useEffect, useRef } from 'react';

const useAnimatedNumber = (targetValue, duration = 1000) => {
  const [displayValue, setDisplayValue] = useState(0);
  const requestRef = useRef();
  const startTimeRef = useRef();
  const startValueRef = useRef(0);

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = performance.now();
    
    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTimeRef.current;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const currentValue = Math.floor(
        startValueRef.current + (targetValue - startValueRef.current) * progress
      );
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(requestRef.current);
  }, [targetValue, duration]);

  return displayValue;
};

export default useAnimatedNumber;

import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  formatter?: (n: number) => string;
  duration?: number;
  style?: StyleProp<TextStyle>;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, formatter, duration = 700, style }) => {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (value - from) * eased);
      setDisplay(current);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const text = formatter ? formatter(display) : String(display);
  return <Text style={style}>{text}</Text>;
};

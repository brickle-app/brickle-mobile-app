import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';

interface CountdownTimerProps {
  expirationDate: Date;
  onExpire: () => void;
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expirationDate,
  onExpire,
  className
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiration = new Date(expirationDate).getTime();
      const difference = expiration - now;

      if (difference > 0) {
        return difference;
      } else {
        return 0;
      }
    };

    // Calculate initial time left
    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);

    // If already expired, call onExpire immediately
    if (initialTimeLeft <= 0) {
      onExpire();
      return;
    }

    // Set up interval to update every second
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [expirationDate, onExpire]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Text className={className}>
      {formatTime(timeLeft)}
    </Text>
  );
};

export default CountdownTimer; 
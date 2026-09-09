import { useState, useEffect, useRef } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  eventDate?: string | null;
  eventTime?: string | null;
}

function parseEventTime(eventTime: string | null | undefined): string {
  if (!eventTime) return '00:00';
  const match = eventTime.match(/(\d{1,2})h(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, '0')}:${match[2]}`;
  }
  if (/^\d{2}:\d{2}$/.test(eventTime)) return eventTime;
  return '00:00';
}

function calculateTimeLeft(eventDate?: string | null, eventTime?: string | null): TimeLeft {
  if (!eventDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const time = parseEventTime(eventTime);
  const targetDate = new Date(`${eventDate}T${time}:00-03:00`);
  const difference = targetDate.getTime() - Date.now();

  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

function Digit({ value, label }: { value: number; label: string }) {
  const prevRef = useRef(value);
  const [animKey, setAnimKey] = useState(0);

  if (prevRef.current !== value) {
    prevRef.current = value;
    setAnimKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="cd-box">
        <div className="cd-glow" />
        <div className="cd-shine" />
        <span key={animKey} className="cd-digit">
          {padZero(value)}
        </span>
      </div>
      <span className="cd-label">{label}</span>
    </div>
  );
}

export default function CountdownTimer({ eventDate, eventTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(eventDate, eventTime));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft(eventDate, eventTime));

    let timeoutId: number;
    const tick = () => {
      setTimeLeft(calculateTimeLeft(eventDate, eventTime));
      timeoutId = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timeoutId = window.setTimeout(tick, 1000 - (Date.now() % 1000));

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setTimeLeft(calculateTimeLeft(eventDate, eventTime));
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [eventDate, eventTime]);

  const units = [
    { value: timeLeft.days, label: 'Dias' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' },
  ];

  if (!eventDate) return null;

  if (!mounted) {
    return (
      <div className="flex justify-center gap-2 sm:gap-3">
        {units.map((u) => (
          <div key={u.label} className="w-16 h-16 sm:w-20 sm:h-20 bg-dark-900/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const isComplete = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isComplete) {
    return (
      <div className="text-center py-4">
        <span className="cd-live">Esta rolando!</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-3">
        <span className="cd-title">Contagem regressiva</span>
      </div>
      <div className="flex justify-center gap-2 sm:gap-3">
        {units.map((unit) => (
          <Digit key={unit.label} value={unit.value} label={unit.label} />
        ))}
      </div>
    </div>
  );
}

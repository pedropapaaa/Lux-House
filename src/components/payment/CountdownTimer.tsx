import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export default function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(diff);
      if (diff === 0) onExpire?.();
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining < 120;

  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isUrgent ? 'bg-red-500/15' : 'bg-purple-500/15'}`}>
        <Clock size={16} className={isUrgent ? 'text-red-400' : 'text-purple-400'} />
      </div>
      <div className="flex items-center gap-2">
        <motion.span
          key={mins}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-xl font-mono font-bold ${isUrgent ? 'text-red-400' : 'text-white'}`}
        >
          {String(mins).padStart(2, '0')}
        </motion.span>
        <span className={`${isUrgent ? 'text-red-400/50' : 'text-white/30'}`}>:</span>
        <motion.span
          key={secs}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-xl font-mono font-bold ${isUrgent ? 'text-red-400' : 'text-white'}`}
        >
          {String(secs).padStart(2, '0')}
        </motion.span>
      </div>
      <span className={`text-xs font-medium ${isUrgent ? 'text-red-400/70' : 'text-white/40'}`}>restantes</span>
    </div>
  );
}

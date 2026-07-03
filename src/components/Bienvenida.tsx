import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';

interface BienvenidaProps {
  onComplete: () => void;
  isDark?: boolean;
}

export function Bienvenida({ onComplete, isDark = true }: BienvenidaProps) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('hold'), 800);
    const timer2 = setTimeout(() => setPhase('exit'), 2200);
    const timer3 = setTimeout(() => onComplete(), 3000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-500"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #0a0a0f 0%, #000000 50%, #0a0a1a 100%)'
          : 'linear-gradient(180deg, #f7f4ee 0%, #f2efe8 50%, #ebe7de 100%)',
      }}
    >
      {/* Animated background glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(10, 132, 255, 0.08) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0, 113, 227, 0.06) 0%, transparent 70%)',
          opacity: isDark ? 1 : 0.8,
        }}
      />

      <div
        className={`flex flex-col items-center gap-8 transition-all duration-700 ${
          phase === 'enter' ? 'opacity-0 scale-90 translate-y-8' :
          phase === 'hold' ? 'opacity-100 scale-100 translate-y-0' :
          'opacity-0 scale-105 -translate-y-4'
        }`}
      >
        {/* Icon container with liquid glass */}
        <div className="liquid-glass-strong rounded-3xl p-8 animate-fadeInUp">
          <Package
            size={64}
            strokeWidth={1.5}
            style={{ color: 'var(--ios-blue)' }}
          />
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h1
            className="text-3xl font-semibold tracking-tight text-gradient"
            style={{ fontFamily: "'SF Pro Display', system-ui" }}
          >
            Bienvenida a tu almacén
          </h1>
          <p
            className="text-base tracking-wide"
            style={{ color: 'var(--ios-text-secondary)' }}
          >
            Farmasi Inventory Manager
          </p>
        </div>

        {/* Decorative line */}
        <div
          className="w-24 h-px rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--ios-blue), transparent)',
            opacity: 0.5,
          }}
        />
      </div>

      {/* Version */}
      <div
        className="absolute bottom-12 text-xs tracking-wider"
        style={{ color: 'var(--ios-text-tertiary)' }}
      >
        v1.0
      </div>
    </div>
  );
}

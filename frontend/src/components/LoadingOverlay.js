import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import './LoadingOverlay.css';

const STEPS = [
  { label: 'Parsing resume content…',       pct: 15 },
  { label: 'Extracting skills & experience…', pct: 30 },
  { label: 'Running AI deep analysis…',     pct: 55 },
  { label: 'Scoring sections…',             pct: 72 },
  { label: 'Generating recommendations…',   pct: 88 },
  { label: 'Finalizing your report…',       pct: 97 },
];

const LoadingOverlay = () => {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIdx(prev => {
        const next = Math.min(prev + 1, STEPS.length - 1);
        setProgress(STEPS[next].pct);
        return next;
      });
    }, 3200);
    setProgress(STEPS[0].pct);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-overlay">
      <div className="loading-card">
        {/* Animated logo */}
        <div className="loading-logo">
          <Zap size={28} />
        </div>

        {/* Step label */}
        <p className="loading-step" key={stepIdx}>
          {STEPS[stepIdx].label}
        </p>

        {/* Progress bar */}
        <div className="loading-progress-track">
          <div className="loading-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="loading-pct">{progress}%</span>

        {/* Dots */}
        <div className="loading-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`loading-dot ${i <= stepIdx ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;

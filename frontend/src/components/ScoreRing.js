import React, { useEffect, useState } from 'react';

const getColor = (score) => {
  if (score >= 85) return 'var(--success)';
  if (score >= 70) return 'var(--accent)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--danger)';
};

const ScoreRing = ({ score = 0, size = 140, strokeWidth = 10, label = 'Score' }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = getColor(score);

  useEffect(() => {
    let start = 0;
    const step = score / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= score) { start = score; clearInterval(timer); }
      setAnimatedScore(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}
          fill={color}
          fontSize={size * 0.22}
          fontFamily="'Syne', sans-serif"
          fontWeight="800"
        >
          {animatedScore}
        </text>
        <text
          x={size / 2}
          y={size / 2 + size * 0.17}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}
          fill="var(--text-muted)"
          fontSize={size * 0.1}
          fontFamily="'DM Sans', sans-serif"
        >
          /100
        </text>
      </svg>
      {label && (
        <span style={{
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreRing;

import React from 'react';

export const SkeletonLoader = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`bg-slate-800/60 animate-pulse rounded-xl ${className}`}
        />
      ))}
    </>
  );
};

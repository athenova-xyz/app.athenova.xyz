import React from 'react';
export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border p-8 flex flex-col items-center shadow transition ${className}`}>
      {children}
    </div>
  );
}

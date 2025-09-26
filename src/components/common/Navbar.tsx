'use client';

import React from 'react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className='flex items-center px-6 py-4 border-b border-b-[var(--auth-border)]'>
      <div className='flex items-center gap-3'>
        <Image src='/Logo.png' alt='Athenova' width={36} height={36} priority />
        <span className='text-xl font-semibold text-foreground ml-1'>Athenova</span>
      </div>

      <div className='ml-auto flex items-center gap-3'>
        <button
          aria-label='Toggle theme'
          className='w-10 h-10 rounded-full bg-white border border-[var(--ui-border)] flex items-center justify-center hover:bg-[var(--ui-hover-bg)]'
        >
          {/* moon / crescent icon */}
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'
              stroke='var(--nav-stroke)'
              strokeWidth='1.2'
              strokeLinecap='round'
              strokeLinejoin='round'
              fill='none'
            />
          </svg>
        </button>

        <button
          aria-label='Account'
          className='w-10 h-10 rounded-full bg-white border border-[var(--ui-border)] flex items-center justify-center'
        >
          {/* user icon */}
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2'
              stroke='var(--nav-stroke)'
              strokeWidth='1.2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M12 11a4 4 0 100-8 4 4 0 000 8z'
              stroke='var(--nav-stroke)'
              strokeWidth='1.2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}

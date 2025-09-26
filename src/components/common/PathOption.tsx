'use client';

import React from 'react';
import Card from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PathOption({
  icon,
  title,
  description,
  buttonText,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <Card className='w-full max-w-[360px] border border-[var(--path-border)] rounded-xl p-8 bg-white'>
      <div className='mb-4'>
        <div className='w-20 h-20 bg-[var(--path-bg)] rounded-full flex items-center justify-center border border-[var(--path-inner-border)] shadow-sm'>
          {icon}
        </div>
      </div>
      <h2 className='text-xl font-semibold mb-2'>{title}</h2>
      <p className='text-gray-600 mb-6 text-center'>{description}</p>
      <Button
        onClick={onClick}
        className='w-full bg-[var(--cta-blue)] text-white hover:bg-[var(--cta-blue-hover)]'
        size='lg'
      >
        {buttonText}
      </Button>
    </Card>
  );
}

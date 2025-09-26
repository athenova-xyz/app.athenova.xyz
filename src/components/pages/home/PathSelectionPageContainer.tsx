'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import Image from 'next/image';
import { PathOption } from '@/components/common/PathOption';

export function PathSelectionPageContainer() {
  const router = useRouter();

  const handleStudent = React.useCallback(() => {
    router.push('/signup');
  }, [router]);

  const handleInstructor = React.useCallback(() => {
    router.push('/signup?role=instructor');
  }, [router]);

  return (
    <div>
      <Navbar />
      <main className='flex flex-col items-center flex-1'>
        <h1 className='text-4xl font-bold mb-3 mt-6 text-center'>Choose Your Path</h1>
        <p className='mb-12 text-lg text-gray-700 text-center'>
          Welcome to Athenova! How would you like to get started?
        </p>
        <div className='flex flex-col items-center gap-8 lg:flex-row lg:gap-12'>
          <PathOption
            icon={
              <svg width='40' height='40' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M12 3L2 8l10 5 10-5-10-5z'
                  stroke='var(--stroke-blue)'
                  strokeWidth='1.8'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M8 13v3a4 4 0 008 0v-3'
                  stroke='var(--stroke-blue)'
                  strokeWidth='1.8'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            }
            title='Continue as Student'
            description='Explore the courses, learn new skills and connect with a community of learners'
            buttonText='Select Student'
            onClick={handleStudent}
          />
          <div className='hidden lg:block lg:mx-2' />
          <div className='my-6 lg:my-0 lg:relative lg:-mt-6'>
            <div
              className='w-16 h-16 rounded-full bg-[var(--dark-badge-bg)] flex items-center justify-center shadow-2xl transform rotate-0'
              style={{ opacity: 1 }}
            >
              <div className='w-10 h-10 rounded-full overflow-hidden flex items-center justify-center'>
                <Image src='/Logo.png' alt='brand' width={34} height={34} className='object-contain' />
              </div>
            </div>
          </div>
          <PathOption
            icon={
              <svg width='40' height='40' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <circle
                  cx='12'
                  cy='8'
                  r='3'
                  stroke='var(--stroke-blue)'
                  strokeWidth='1.8'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M4 20c1.333-4 6.667-4 8-4s6.667 0 8 4'
                  stroke='var(--stroke-blue)'
                  strokeWidth='1.8'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            }
            title='Continue as Instructor'
            description='Create engaging courses, share your expertise and create your own community'
            buttonText='Select Instructor'
            onClick={handleInstructor}
          />
        </div>
      </main>
    </div>
  );
}

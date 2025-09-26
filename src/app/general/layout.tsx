import type { ReactNode } from 'react';

export default function GeneralLayout({ children }: { children: ReactNode }) {
  return <div className='bg-[var(--page-bg)] min-h-screen'>{children}</div>;
}

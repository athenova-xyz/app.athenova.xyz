import { LoginForm } from '@/components/models/auth/LoginForm';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function LoginPageContainer() {
  return (
    <main className={cn('min-h-[100dvh] flex items-center justify-center bg-background px-2 py-10')}>
      <div className='w-full max-w-md'>
        <div className='relative'>
          <div className='rounded-2xl border border-auth bg-white p-10 max-w-md mx-auto shadow-sm'>
            <div className='flex flex-col items-center text-center'>
              <div className='flex items-center gap-3'>
                <Image src='/Logo.png' alt='Athenova' width={56} height={56} />
                <h2 className='text-xl font-semibold text-foreground'>Athenova</h2>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

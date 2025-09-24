import { SignupForm } from '@/components/models/auth/SignupForm';
import { cn } from '@/lib/utils';

export function SignupPageContainer() {
  return (
    <main className={cn('min-h-[100dvh] flex items-center justify-center bg-background px-2 py-10')}>
      <div className='w-full max-w-md'>
        <SignupForm />
      </div>
    </main>
  );
}

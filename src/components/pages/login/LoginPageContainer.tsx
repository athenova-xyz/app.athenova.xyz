import { LoginForm } from '@/components/models/auth/LoginForm';
import { cn } from '@/lib/utils';

export function LoginPageContainer() {
  return (
    <main className={cn('min-h-[100dvh] flex items-center justify-center bg-background px-2 py-10')}>
      <div className='w-full max-w-md mx-auto'>
        <div className='w-full'>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

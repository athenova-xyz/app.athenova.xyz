'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/common/Form/FormInput';
import { useAction } from 'next-safe-action/hooks';
import { signinAction } from '@/actions/auth/signin/action';
import { SigninInput, signinSchema } from '@/actions/auth/signin/schema';
import Link from 'next/link';
import { toast } from 'sonner';

export function SignupForm() {
  const router = useRouter();
  const form = useForm<SigninInput>({
    resolver: zodResolver(signinSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' }
  });

  const { execute, isExecuting } = useAction(signinAction, {
    onSuccess: () => {
      toast.success('Signed in successfully');
      form.reset();
      router.push('/courses/create');
    },
    onError: (error) => {
      const fieldErrors = error.error?.validationErrors?.fieldErrors;
      const errorMessage =
        error.error?.thrownError?.message ??
        error.error?.serverError ??
        (fieldErrors
          ? Object.entries(fieldErrors)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')
          : 'Sign in failed');

      toast.error(errorMessage);
    }
  });
  return (
    <div className='rounded-2xl border border-auth bg-white p-10 max-w-md mx-auto shadow-sm'>
      <div className='flex flex-col items-center text-center'>
        <div className='flex items-center gap-3'>
          <Image src='/Logo.png' alt='Athenova' width={56} height={56} />
          <h2 className='text-xl font-semibold text-foreground'>Athenova</h2>
        </div>

        <p className='mt-6 text-sm text-muted-foreground'>Sign in With Email</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(execute)} className='mt-8 w-full space-y-4 max-w-sm text-left'>
            <div className='space-y-2'>
              <FormInput
                control={form.control}
                name='email'
                label='Enter Your Email'
                placeholder='email@example.com'
                required
              />
              <FormInput
                control={form.control}
                name='password'
                label='Enter Your Password'
                type='password'
                placeholder=''
                required
              />
            </div>

            <Button
              className='w-full py-3 bg-blue-600 hover:bg-blue-700 text-white'
              type='submit'
              disabled={isExecuting || !form.formState.isValid || !form.formState.isDirty}
            >
              {isExecuting ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className='mt-8 w-full space-y-4 max-w-sm'>
              <p className='mt-6 text-center text-xs text-muted-foreground'>
                Don&apos;t have an account?{' '}
                <Link href='/signup' className='athena-link'>
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

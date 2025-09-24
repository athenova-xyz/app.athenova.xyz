'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/common/Form/FormInput';
import { FormTextarea } from '@/components/common/Form/FormTextarea';
import { createCourseAction } from '@/actions/courses/createCourse/action';
import { createCourseSchema, type CreateCourseInput } from '@/actions/courses/createCourse/schema';
import { useRouter } from 'next/navigation';

// Simple toast fallback - you can replace this with your preferred toast library
const toast = {
  success: (message: string) => {
    console.log('Success:', message);
    // You can replace this with actual toast implementation
  },
  error: (message: string) => {
    console.error('Error:', message);
    // You can replace this with actual toast implementation
  }
};

export function CourseCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: ''
    }
  });

  const onSubmit = async (values: CreateCourseInput) => {
    setIsSubmitting(true);

    try {
      const result = await createCourseAction(values);

      if (result.data) {
        toast.success('Course created successfully');
        form.reset();
        router.push('/courses?created=1');
        return;
      }

      // Handle field validation errors
      const fieldErrors = result.validationErrors?.fieldErrors;
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([key, val]) => {
          const message = Array.isArray(val) ? val[0] : String(val ?? '');
          form.setError(key as keyof CreateCourseInput, {
            type: 'server',
            message: message
          });
        });
        return;
      }

      // Handle server errors
      if (result.serverError) {
        toast.error(result.serverError);
        return;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-xl mx-auto p-8'>
      <h1 className='text-2xl font-bold mb-6'>Create Course</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormInput control={form.control} name='title' label='Title' placeholder='Course title' required />

          <FormTextarea
            control={form.control}
            name='description'
            label='Description'
            placeholder='Course description'
            rows={4}
            required
          />

          <Button
            className='mt-4'
            type='submit'
            disabled={isSubmitting || !form.formState.isValid || !form.formState.isDirty}
          >
            {isSubmitting ? 'Creating...' : 'Create Course'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, type Control } from '@/components/ui/form';
import type { FieldPath, FieldValues } from 'react-hook-form';

export interface FormTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  rows?: number;
  className?: string;
  maxLength?: number;
}

export function FormTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder,
  required = false,
  helperText,
  rows = 4,
  className,
  maxLength
}: FormTextareaProps<TFieldValues, TName>) {
  const inputId = React.useId();
  const helpId = helperText ? `${inputId}-help` : undefined;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const errorId = fieldState.error ? `${inputId}-error` : undefined;
        const counterId = maxLength ? `${inputId}-counter` : undefined;
        const describedBy = [helpId, errorId, counterId].filter(Boolean).join(' ') || undefined;
        return (
          <FormItem className={className}>
            <FormLabel htmlFor={inputId}>
              {label}
              {required && <span className='text-red-500 ml-1'>*</span>}
            </FormLabel>
            <FormControl>
              <Textarea
                id={inputId}
                placeholder={placeholder}
                rows={rows}
                required={required}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                aria-required={required}
                aria-invalid={!!fieldState.error}
                aria-describedby={describedBy}
                ref={field.ref as React.Ref<HTMLTextAreaElement>}
                maxLength={maxLength}
              />
            </FormControl>
            {helperText && (
              <div id={helpId} className='text-sm text-gray-500 dark:text-gray-400 my-1'>
                {helperText}
              </div>
            )}
            {maxLength && (
              <div
                id={`${inputId}-counter`}
                className='text-sm text-gray-500 dark:text-gray-400 my-1 text-right'
                aria-live='polite'
              >
                {field.value?.toString().length ?? 0} / {maxLength}
              </div>
            )}
            <FormMessage id={`${inputId}-error`}>{fieldState.error?.message}</FormMessage>
          </FormItem>
        );
      }}
    />
  );
}

'use client';

import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, type Control } from '@/components/ui/form';
import type { FieldPath, FieldValues } from 'react-hook-form';

export interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  required?: boolean;
  helperText?: string;
  endComponent?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  helperText,
  endComponent,
  min,
  max,
  step,
  className
}: FormInputProps<TFieldValues, TName>) {
  const helperTextId = useId();
  const errorId = useId();

  const describedBy = [
    helperText ? helperTextId : undefined,
    // Only add errorId to describedBy if there's an actual error message
    // This prevents screen readers from announcing "undefined" or empty error states
    // when there's no validation error.
    // The FormMessage component itself will handle its visibility based on fieldState.error.
    // We are linking the input to the potential error message container.
    errorId
  ].filter(Boolean).join(' ');

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <FormLabel htmlFor={field.name}>
            {label}
            {required && <span className='text-red-500 ml-1'>*</span>}
          </FormLabel>
          <div className='flex flex-row gap-2'>
            <FormControl>
              <Input
                id={field.name}
                placeholder={placeholder}
                type={type}
                min={min}
                max={max}
                step={step}
                required={required}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value =
                    type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
                  field.onChange(value as TFieldValues[TName]);
                }}
                onBlur={field.onBlur}
                name={field.name}
                value={field.value ?? ''}
                disabled={field.disabled}
                ref={field.ref as React.Ref<HTMLInputElement>}
                aria-describedby={describedBy}
              />
            </FormControl>
            {endComponent}
          </div>
          {helperText && <div id={helperTextId} className='text-sm text-gray-500 dark:text-gray-400 my-1'>{helperText}</div>}
          <FormMessage id={errorId}>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
}

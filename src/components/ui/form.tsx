'use client';

import * as React from 'react';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type FormState,
  type UseFormReturn
} from 'react-hook-form';

const FormContext = React.createContext<UseFormReturn<FieldValues> | null>(null);

export function Form<TFieldValues extends FieldValues = FieldValues>({
  children,
  ...form
}: React.PropsWithChildren<UseFormReturn<TFieldValues>>) {
  return <FormContext.Provider value={form as UseFormReturn<FieldValues>}>{children}</FormContext.Provider>;
}

export function useFormField() {
  const form = React.useContext(FormContext);
  if (!form) {
    throw new Error('useFormField must be used within a Form component');
  }
  return form;
}

export function FormItem({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={`space-y-2 ${className || ''}`}>{children}</div>;
}

export interface FormLabelProps {
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FormLabel({ children, className, htmlFor }: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium ${className || ''}`}>
      {children}
    </label>
  );
}

export interface FormControlProps {
  children?: React.ReactNode;
  className?: string;
}

export function FormControl({ children, className }: FormControlProps) {
  return <div className={className}>{children}</div>;
}

export interface FormMessageProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormMessage({ children, className, id }: FormMessageProps) {
  return (
    <div id={id} className={`text-sm text-red-500 ${className || ''}`}>
      {children}
    </div>
  );
}

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  render: ({
    field,
    fieldState,
    formState
  }: {
    field: {
      value: TFieldValues[TName];
      onChange: (value: TFieldValues[TName]) => void;
      onBlur: () => void;
      name: TName;
      ref: React.Ref<unknown>;
      disabled?: boolean;
    };
    fieldState: {
      invalid: boolean;
      isTouched: boolean;
      isDirty: boolean;
      error?: { message?: string };
    };
    formState: FormState<TFieldValues>;
  }) => React.ReactElement;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ control, name, render }: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState, formState }) => render({ field, fieldState, formState })}
    />
  );
}

export type { Control };

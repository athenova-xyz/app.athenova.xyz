"use client";
import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCourse } from "./actions";

interface FormErrors {
  title?: string;
  description?: string;
  general?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Course"}
    </Button>
  );
}

export function CourseForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const validateForm = (formData: FormData): FormErrors => {
    const errors: FormErrors = {};
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    // Validate title length (DB column limit: 256 chars)
    if (!title || title.trim().length === 0) {
      errors.title = "Title is required";
    } else if (title.length > 256) {
      errors.title = "Title must be 256 characters or less";
    }

    // Validate description length (DB column limit: 10000 chars)
    if (!description || description.trim().length === 0) {
      errors.description = "Description is required";
    } else if (description.length > 10000) {
      errors.description = "Description must be 10,000 characters or less";
    }

    return errors;
  };

  const handleSubmit = async (formData: FormData) => {
    setErrors({});

    // Client-side validation
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await createCourse({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
      });

      if (result.success) {
        router.push("/courses");
      } else {
        setErrors({ general: result.error || "Failed to create course" });
      }
    } catch {
      setErrors({ general: "An unexpected error occurred" });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create Course</h1>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            name="title"
            placeholder="Course title"
            maxLength={256}
            required
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            placeholder="Course description"
            rows={4}
            maxLength={10000}
            required
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {errors.general && (
          <p className="text-sm text-red-500">{errors.general}</p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}

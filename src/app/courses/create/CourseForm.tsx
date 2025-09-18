"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCourseAction } from "@/actions/courses/createCourse/action";

interface FormErrors {
  title?: string;
  description?: string;
  general?: string;
}

export function CourseForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const validateForm = (formData: FormData): FormErrors => {
    const errors: FormErrors = {};
    const title = (formData.get("title") as string)?.trim() || "";
    const description = (formData.get("description") as string)?.trim() || "";

    // Validate title length (DB column limit: 256 chars)
    if (!title) {
      errors.title = "Title is required";
    } else if (title.length > 256) {
      errors.title = "Title must be 256 characters or less";
    }

    // Validate description length (DB column limit: 10000 chars)
    if (!description) {
      errors.description = "Description is required";
    } else if (description.length > 10000) {
      errors.description = "Description must be 10,000 characters or less";
    }

    return errors;
  };
  // NOTE: Prefer using the shared server Zod schema (`CourseSchema`) for
  // validation to keep client and server in sync. Example (client-side):
  //
  // import { CourseSchema } from '@/lib/schemas/course'
  // const parsed = CourseSchema.safeParse({ title, description })
  // if (!parsed.success) { map parsed.error.issues into FormErrors }
  //
  // This ensures trimming and length rules are identical on both sides.

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    setPending(true);

    try {
      // Client-side validation
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Submit to server action (server-side Zod validation)
      const payload = {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
      };

      const result = await createCourseAction(payload);

      if (result.data) {
        router.push("/courses?created=1");
        return;
      }

      // Handle validation errors from safe action (flattened/fieldErrors shape)
      if (result.validationErrors) {
        setErrors({
          title: (result.validationErrors.fieldErrors?.title ?? [])[0],
          description: (result.validationErrors.fieldErrors?.description ??
            [])[0],
        });
        return;
      }

      // Handle server errors
      if (result.serverError) {
        setErrors({ general: result.serverError });
        return;
      }
    } catch {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setPending(false);
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

        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create Course"}
        </Button>
      </form>
    </div>
  );
}

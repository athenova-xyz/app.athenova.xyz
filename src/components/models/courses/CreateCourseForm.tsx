"use client";

import { FormInput } from "@/components/common/Form/FormInput";
import { FormTextarea } from "@/components/common/Form/FormTextarea";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourseSchema } from "@/actions/courses/createCourse/schema";
import { useAction } from "next-safe-action/hooks";
import { createCourseAction } from "@/actions/courses/createCourse/action";
import { toast } from "../../ui/sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CreateCourseForm() {
  const router = useRouter();

  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(createCourseSchema),
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const { execute, isExecuting } = useAction(createCourseAction, {
    onSuccess: ({ data }) => {
      toast.success(`Course ${data.title} created successfully`);
      form.reset();
      router.push("/courses?created=1");
    },
    onError: (error) => {
      const fieldErrors = error.error.validationErrors?.fieldErrors;
      const errorMessage =
        error.error.thrownError?.message ??
        error.error.serverError ??
        (fieldErrors
          ? Object.entries(fieldErrors)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")
          : "An unknown error occurred");
      toast.error(errorMessage);
    },
  });

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create Course</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(execute)} className="space-y-4">
          <FormInput
            control={form.control}
            required
            label="Title"
            name="title"
            placeholder="Course title"
          />

          <FormTextarea
            control={form.control}
            name="description"
            label="Description"
            placeholder="Course description"
            rows={4}
            required
          />

          <Button
            className="mt-4"
            type="submit"
            disabled={
              isExecuting || !form.formState.isValid || !form.formState.isDirty
            }
          >
            {isExecuting ? "Creating..." : "Create Course"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/common/Form/FormInput";
import { signInWithEmailAction } from "@/actions/auth/email/signin/action";

// Schema for email and password only
const emailSignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().nonempty("Password is required"),
});

type EmailSignInInput = z.infer<typeof emailSignInSchema>;

// Simple toast fallback - you can replace this with your preferred toast library
const toast = {
  success: (message: string) => {
    console.log("Success:", message);
  },
  error: (message: string) => {
    console.error("Error:", message);
  },
};

export function EmailLoginCard() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<EmailSignInInput>({
    resolver: zodResolver(emailSignInSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: EmailSignInInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await signInWithEmailAction(values);

      // Check for serverError at both levels due to action client wrapping
      const serverError = result?.serverError || result?.data?.serverError;
      const userData =
        result?.data && !result.data.serverError ? result.data : null;

      if (serverError || !userData) {
        throw new Error(serverError ?? "Sign in failed");
      }

      // Email sign-in successful - redirect to course creation
      toast.success("Signed in successfully");
      form.reset();
      router.push("/courses/create");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="rounded-2xl border border-auth bg-white p-10 max-w-md mx-auto shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <Image src="/Logo.png" alt="Athenova" width={56} height={56} />
          <h2 className="text-xl font-semibold text-foreground">Athenova</h2>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">Sign in With Email</p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 w-full space-y-4 max-w-sm text-left"
          >
            <div className="space-y-2">
              <FormInput
                control={form.control}
                name="email"
                label="Enter Your Email"
                placeholder="email@example.com"
                required
              />
              <FormInput
                control={form.control}
                name="password"
                label="Enter Your Password"
                type="password"
                placeholder=""
                required
              />
            </div>

            <Button
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white"
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            {serverError && (
              <div className="text-sm text-red-600 text-center mt-2">
                {serverError}
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}

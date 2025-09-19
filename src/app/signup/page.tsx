"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signupAction } from "@/actions/auth/signup/action";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signupAction({ name, email, password });
      console.log("signupAction result:", result);

      // If action returned serverError shape from next-safe-action
      if (result && "serverError" in result && result.serverError) {
        // serverError can be string or object; try to get readable message
        const se = result.serverError as unknown;
        if (typeof se === "string") {
          setError(se);
        } else if (typeof se === "object" && se !== null) {
          try {
            setError(JSON.stringify(se));
          } catch {
            setError("Signup failed with unknown server error");
          }
        } else {
          setError("Signup failed with unknown server error");
        }
        return;
      }

      // If result contains data (created user)
      if (result && "data" in result && result.data) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1200);
        return;
      }

      // If the result is an Error thrown or unexpected
      if (result == null) {
        setError("Signup failed. No response from server.");
      } else if (
        result &&
        typeof result === "object" &&
        ("error" in result || "message" in result)
      ) {
        const r = result as unknown as Record<string, unknown>;
        const errMsg =
          typeof r.error === "string"
            ? r.error
            : typeof r.message === "string"
            ? r.message
            : "Signup failed.";
        setError(errMsg);
      } else {
        setError("Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error caught in UI:", error);
      const e = error as unknown as Record<string, unknown>;
      setError(
        typeof e.message === "string"
          ? String(e.message)
          : "Network error. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="p-8 bg-white rounded-lg border border-auth shadow-sm">
          <h1 className="text-2xl font-semibold mb-2 text-foreground">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Signup placeholder. You can wire this form to your API.
          </p>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-md bg-destructive/10 border border-destructive/20 mb-4"
            >
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="p-3 rounded-md bg-green-50 border border-green-200 mb-4"
            >
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full p-3 border border-gray-200 rounded"
            />
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 border border-gray-200 rounded"
              required
            />
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border border-gray-200 rounded"
              required
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="athena-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

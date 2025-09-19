"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signupAction } from "@/actions/auth/signup/action";

type SignupResult = {
  serverError?: string;
  data?: { id: string; email?: string | null; role?: string };
};

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const result = (await signupAction({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })) as SignupResult;

      if (result && "serverError" in result && result.serverError) {
        setError(result.serverError);
      } else if (result && "data" in result && result.data) {
        router.push("/login");
      } else {
        setError("Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Full name"
              className="w-full p-3 border border-gray-200 rounded"
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Email"
              className="w-full p-3 border border-gray-200 rounded"
              required
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Password"
              className="w-full p-3 border border-gray-200 rounded"
              required
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
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

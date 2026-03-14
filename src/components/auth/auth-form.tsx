"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import {
  signInSchema,
  signUpSchema,
  type SignInValues,
  type SignUpValues,
} from "@/types/schemas";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  redirectTo?: string;
  error?: string;
  message?: string;
  showHeader?: boolean;
};

export function AuthForm({
  mode,
  redirectTo: _redirectTo,
  error: initialError,
  message,
  showHeader = true,
}: AuthFormProps) {
  const { signIn, signUp } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(initialError ?? null);
  const [debugDetails, setDebugDetails] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      toast.info(message);
    }
  }, [message]);

  const isSignIn = mode === "sign-in";

  const form = useForm<SignInValues | SignUpValues>({
    resolver: zodResolver(isSignIn ? signInSchema : signUpSchema),
    defaultValues: isSignIn
      ? { email: "", password: "" }
      : { email: "", password: "", fullName: "" },
  });

  const onSubmit = async (values: SignInValues | SignUpValues) => {
    setSubmitError(null);
    setDebugDetails(null);
    try {
      if (isSignIn) {
        const { email, password } = values as SignInValues;
        await signIn(email, password);
      } else {
        const { email, password, fullName } = values as SignUpValues;
        await signUp(email, password, fullName ?? null);
        toast.success("Check your email to confirm your account.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      const cause =
        error instanceof Error && "cause" in error
          ? (error as Error & { cause?: unknown }).cause
          : null;
      const causeInfo =
        cause && typeof cause === "object"
          ? {
              code: (cause as { code?: string }).code ?? null,
              status: (cause as { status?: number }).status ?? null,
              name: (cause as { name?: string }).name ?? null,
            }
          : null;

      if (causeInfo && (causeInfo.code || causeInfo.status || causeInfo.name)) {
        const parts = [
          causeInfo.code ? `code=${causeInfo.code}` : null,
          causeInfo.status ? `status=${causeInfo.status}` : null,
          causeInfo.name ? `name=${causeInfo.name}` : null,
        ].filter(Boolean);
        setDebugDetails(parts.join(" | "));
      }

      setSubmitError(message);
      toast.error(message);
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const showDebug =
    process.env.NEXT_PUBLIC_AUTH_DEBUG === "true" || process.env.NODE_ENV !== "production";

  return (
    <Card className="w-full border-border/60 bg-card/80 shadow-lg">
      {showHeader && (
        <CardHeader className="space-y-2 pb-2">
          <CardTitle className="text-xl tracking-tight">
            {isSignIn ? "Sign in" : "Create account"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {isSignIn
              ? "Enter your email and password to continue."
              : "Enter your details below to get started."}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={`space-y-6 ${showHeader ? "pt-2" : "pt-6"}`}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {mode === "sign-up" && (
              <FormField
                control={form.control}
                name={"fullName" as keyof SignUpValues}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="fullName"
                        type="text"
                        placeholder="Jane Doe"
                        className="h-11 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name={"email" as keyof SignInValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="h-11 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={"password" as keyof SignInValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="********"
                      className="h-11 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && (
              <div className="space-y-2" role="status">
                <p className="text-sm text-destructive">{submitError}</p>
                {showDebug && debugDetails && (
                  <p className="text-xs text-muted-foreground">
                    Debug: {debugDetails}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full rounded-lg"
              loading={isSubmitting}
              loadingText={isSignIn ? "Signing in..." : "Signing up..."}
            >
              {isSignIn ? "Sign in" : "Sign up"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { ROUTES } from "@/constants/routes";

export function useAuth() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("[auth] signInWithPassword failed", {
          message: error.message,
          status: error.status,
          code: error.code,
          name: error.name,
        });
        const err = new Error(error.message);
        (err as Error & { cause?: unknown }).cause = error;
        throw err;
      }
      router.push(ROUTES.DASHBOARD);
    },
    [router, supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string | null): Promise<void> => {
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "";

      const emailRedirectTo = origin
        ? `${origin}/auth/callback?redirectTo=${encodeURIComponent(ROUTES.EMAIL_VERIFIED)}`
        : undefined;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: fullName ? { full_name: fullName } : undefined,
          emailRedirectTo,
        },
      });

      if (error) {
        console.error("[auth] signUp failed", {
          message: error.message,
          status: error.status,
          code: error.code,
          name: error.name,
        });
        const err = new Error(error.message);
        (err as Error & { cause?: unknown }).cause = error;
        throw err;
      }

      const identities = data.user?.identities ?? [];
      if (identities.length === 0) {
        // Supabase intentionally returns no error when the email already exists.
        // Surface a generic, privacy-safe message instead of silent success.
        throw new Error(
          "If this email is already registered, please sign in to your account."
        );
      }
    },
    [supabase]
  );

  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    router.push(ROUTES.HOME);
  }, [router, supabase]);

  return { signIn, signUp, signOut };
}


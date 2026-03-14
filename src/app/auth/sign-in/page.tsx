import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue managing your population health programs."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      }
    >
      <AuthForm
        mode="sign-in"
        redirectTo={params.redirectTo}
        error={params.error}
        message={params.message}
        showHeader={false}
      />
    </AuthShell>
  );
}

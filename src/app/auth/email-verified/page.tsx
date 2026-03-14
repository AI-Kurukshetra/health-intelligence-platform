import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function EmailVerifiedPage() {
  return (
    <AuthShell
      title="Email verified"
      subtitle="Your account is confirmed. You can now sign in and start using HealthIQ."
    >
      <Card className="border-border/60 bg-card/80 shadow-lg">
        <CardContent className="space-y-4 p-6 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="h-14 w-14 text-primary" aria-hidden />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your email has been successfully verified.
            </p>
          </div>
          <Button
            className="w-full"
            size="lg"
            render={<Link href="/auth/sign-in">Sign in to proceed</Link>}
            nativeButton={false}
          />
        </CardContent>
      </Card>
    </AuthShell>
  );
}

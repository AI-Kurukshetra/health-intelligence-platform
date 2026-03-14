type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  void title;
  void subtitle;
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
        <div className="w-full space-y-4">
          {children}
          {footer}
        </div>
      </div>
    </div>
  );
}

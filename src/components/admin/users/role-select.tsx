"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES, type Role } from "@/constants/roles";
import { useUpdateUserRole } from "@/hooks/use-users";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

type RoleSelectProps = {
  userId: string;
  currentRole: Role;
};

const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: "Super Admin", value: ROLES.SUPER_ADMIN },
  { label: "Org Admin", value: ROLES.ORG_ADMIN },
  { label: "Care Manager", value: ROLES.CARE_MANAGER },
  { label: "Physician", value: ROLES.PHYSICIAN },
  { label: "Analyst", value: ROLES.ANALYST },
];

export function RoleSelect({ userId, currentRole }: RoleSelectProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useUpdateUserRole();

  const handleChange = async (role: Role) => {
    try {
      await mutateAsync({ id: userId, role });
      toast.success("Role updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update role."));
    } finally {
      setOpen(false);
    }
  };

  const currentLabel =
    ROLE_OPTIONS.find((option) => option.value === currentRole)?.label ?? currentRole;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={isPending}
            loadingText="Updating..."
            className="inline-flex items-center gap-1"
          >
            <span>{currentLabel}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {ROLE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => void handleChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

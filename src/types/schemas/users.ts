import { z } from "zod";
import { ROLES } from "@/constants/roles";

export const updateUserRoleSchema = z.object({
  role: z.enum([
    ROLES.SUPER_ADMIN,
    ROLES.ORG_ADMIN,
    ROLES.CARE_MANAGER,
    ROLES.PHYSICIAN,
    ROLES.ANALYST,
  ]),
});

export type UpdateUserRoleValues = z.infer<typeof updateUserRoleSchema>;


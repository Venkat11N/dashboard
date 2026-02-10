import type { Role } from "../rbac/permissions";

export const CURRENT_USER = {
  id: "user-123",
  role: "USER" as Role,
  name: "User",
};

export const CURRENT_USER_ID = CURRENT_USER.id;
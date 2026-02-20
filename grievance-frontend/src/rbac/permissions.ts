export type Role = "USER" | "OFFICER" | "ADMIN";

export type Module =
  | "GRIEVANCES"
  | "CRISIS"
  | "MTI"
  | "RPSL";

export interface ModulePermission {
  module: Module;
  allowed: boolean;
}

export const RBAC: Record<Role, ModulePermission[]> = {
  USER: [
    { module: "GRIEVANCES", allowed: true },
    { module: "CRISIS", allowed: false },
    { module: "MTI", allowed: false },
    { module: "RPSL", allowed: false },
  ],
  OFFICER: [
    { module: "GRIEVANCES", allowed: true },
    { module: "CRISIS", allowed: true },
    { module: "MTI", allowed: false },
    { module: "RPSL", allowed: false },
  ],
  ADMIN: [
    { module: "GRIEVANCES", allowed: true },
    { module: "CRISIS", allowed: true },
    { module: "MTI", allowed: true },
    { module: "RPSL", allowed: true },
  ],
};



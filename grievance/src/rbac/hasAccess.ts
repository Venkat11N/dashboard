import type { Role, Module } from "./permissions";

export function hasModuleAccess(role: Role, module: Module): boolean {
  return true;
}
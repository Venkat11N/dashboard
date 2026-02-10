import type { Module } from "../rbac/permissions";

export interface AppModule {
  key: Module;
  label: string;
  description: string;
  dashboardPath: string;
}

export const APP_MODULES: AppModule[] = [
  {
    key: "GRIEVANCES",
    label: "Grievance Redressal",
    description: "Submit grievances and track their status",
    dashboardPath: "/dashboard/grievances",
  },
  {
    key: "CRISIS",
    label: "Crisis Management",
    description: "Crisis handling and emergency operations",
    dashboardPath: "/dashboard/crisis",
  },
  {
    key: "MTI",
    label: "Training & Certification",
    description: "Training, certification and MTI services",
    dashboardPath: "/dashboard/mti",
  },
  {
    key: "RPSL",
    label: "Recruitment & Placement",
    description: "Recruitment and placement services",
    dashboardPath: "/dashboard/rpsl",
  },
];

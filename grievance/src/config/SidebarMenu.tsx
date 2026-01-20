import {
  FileText,
  ShieldAlert,
  BookOpen,
  GraduationCap,
} from "lucide-react";

import { UserRole } from "../types/role";
import Sidebar from '../components/layout/Sidebar';

export interface SidebarItem {
  label: string;
  path: string;
  icon: any;
  roles: UserRole[];
}

export const sidebarMenu: SidebarItem[] = [
  {
    label: "Grievacne Redressal",
    path: "/dashbaord/grievance",
    icon: FileText,
    roles: ["SEAFARER", "ORGANIZATION_USER", "ADMIN"],
  },
  {
    label: "MTI",
    path: "/dashbaord/mti",
    icon: GraduationCap,
    roles: ["ORGANIZATION_USER", "ADMIN"],
  },
  {
    label: "Crisis Reponse",
    path: "/dashbaord/crisis",
    icon: ShieldAlert,
    roles: ["ADMIN"],
  },
  {
    label: "RPSL",
    path: "/dashboard/rpsl",
    icon: BookOpen,
    roles: ["ADMIN"]
  },
];
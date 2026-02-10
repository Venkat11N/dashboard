import { 
  LayoutDashboard, 
  ClipboardList, 
  MessageCircle, 
  HelpCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Module } from "../rbac/permissions";

export interface SidebarItem {
  label: string;
  path: string;
  module: Module;
  icon?: LucideIcon; 
  children?: SidebarItem[];
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Main Dashboard",
    path: "/dashboard",
    module: "GRIEVANCES", 
    icon: LayoutDashboard,
  },
  {
    label: "Application Status",
    path: "/dashboard/application-status", 
    module: "GRIEVANCES",
    icon: ClipboardList,
  },
  {
    label: "Replies",
    path: "/dashboard/replies",
    module: "GRIEVANCES",
    icon: MessageCircle,
  },
  {
    label: "FAQ",
    path: "/dashboard/faq",
    module: "GRIEVANCES",
    icon: HelpCircle,
  }
];
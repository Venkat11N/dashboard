import type { Module } from "../rbac/permissions";

export interface SidebarItem {
  label: string;
  path: string;
  module: Module;
  children?: SidebarItem[];
}

export const SIDEBAR_ITEMS: SidebarItem[] = [

{
  label: "Application Status",
  path: "/dashbaord/application-status",
  module: "GRIEVANCES",
},
{
  label: "Replies",
  path: "/dashbaord/replies",
  module: "GRIEVANCES"
},
{
  label: "FAQ",
  path: "/dashbaord/faq",
  module: "GRIEVANCES",
}
];

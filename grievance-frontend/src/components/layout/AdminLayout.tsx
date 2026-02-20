import { useState } from "react";
import Sidebar from "./Sidebar"; 
import Navbar from "./Navbar";
import { SidebarProvider } from "../../context/SidebarContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar isAdmin={true} /> 
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
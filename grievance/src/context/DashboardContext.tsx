import { createContext, useContext, ReactNode } from "react";


export type DashboardRole = "CIPHERED_USER" | "ADMIN";

interface DashboardContextType {
  role: DashboardRole;
  subscriptions: {
    preventive: boolean;
    grievance: boolean;
    crisis: boolean;
  };
  stats: {
    grievancesCount: number;
  };
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {

  const value: DashboardContextType = {
    role: "User",
    subscriptions: {
      preventive: false,
      grievance: true,
      crisis: false,
    },
    stats: {
      grievancesCount: 3,
    },
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }
  return context;
}

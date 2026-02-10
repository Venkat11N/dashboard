import { SidebarProvider } from "../context/SidebarContext";
import { DashboardProvider } from "../context/DashboardContext";
import { GovernanceProvider } from "../core/GovernanceContext";
import AppRoutes from "./routes";


export default function App() {
  return (
    <GovernanceProvider>
     <SidebarProvider>
      <DashboardProvider>
        <AppRoutes />
      </DashboardProvider>
     </SidebarProvider>
    </GovernanceProvider>
  );
}

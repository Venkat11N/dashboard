import { SidebarProvider } from "../context/SidebarContext";
import { DashboardProvider } from "../context/DashboardContext";
import AppRoutes from "./routes";

export default function App() {
  return (
    <SidebarProvider>
      <DashboardProvider>
        <AppRoutes />
      </DashboardProvider>
    </SidebarProvider>
  );
}

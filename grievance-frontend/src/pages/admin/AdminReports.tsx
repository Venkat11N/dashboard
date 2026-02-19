import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { SidebarProvider } from "../../context/SidebarContext";


export default function AdminReports() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar isAdmin={true} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-8 text-center text-slate-500">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Reports</h1>
            <p>Reports module...</p>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
import { useEffect, useState } from "react";
import DashboardCard from "../ui/DashboardCard";
import { getGrievanceCounts } from "../../api/grievance";



export default function MetricsRow() {
  const [data, setData] =useState({
    total: 0,
    pending: 0,
    resolved: 0,
    escalated: 0,
  });

  useEffect(() => {
    async function load(){
      const counts = await getGrievanceCounts();
      setData(counts);    
 }
 load();  
}, []);

return (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <DashboardCard title="Total" value={data.total} />
    <DashboardCard title="Pending" value={data.pending} />
    <DashboardCard title="Resoolved" value={data.resolved} />
    <DashboardCard title="Escalated" value={data.escalated} />

  </div>
)
}
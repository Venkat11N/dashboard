import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api"; 

interface Row {
  category: string;
  total: number;
}

export default function GrievanceCategoryChart() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {

        const token = localStorage.getItem('accessToken'); 

        const response = await fetch(`${API_BASE_URL}/grievance-stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();


        if (result.status === 'ok') {
          setRows(result.data);
        }
      } catch (error) {
        console.error("Failed to load category distribution:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading stats...</div>;

  return (
    <div className="bg-white p-6 mt-6 rounded shadow">
      <h2 className="font-semibold mb-4 text-gray-800">
        Grievance Category Distribution
      </h2>

      <table className="w-full text-sm">
        <thead className="text-left text-gray-500">
          <tr className="border-b">
            <th className="pb-2">Category</th>
            <th className="pb-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((r, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="py-2 text-gray-700">{r.category}</td>
                <td className="font-medium">{r.total}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="py-4 text-center text-gray-400">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
interface Props {
  title: string;
  value?: number;
}

export default function DashboardCard({ title, value }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm text-gray-500">{title}</h3>
      {value !== undefined && (
        <p className="text-2xl font-bold mt-2">{value}</p>
      )}
    </div>
  );
}

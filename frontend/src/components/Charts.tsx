import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Week 1', processed: 30, failed: 2 },
  { name: 'Week 2', processed: 45, failed: 5 },
  { name: 'Week 3', processed: 28, failed: 1 },
  { name: 'Week 4', processed: 52, failed: 3 },
];

export default function SubmissionsChart() {
  return (
    <div className="w-full h-80 p-4 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-lg font-semibold">Weekly Submissions</h3>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="processed" fill="#0B63D6" />
          <Bar dataKey="failed" fill="#e5484d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
import { Users, UserCheck, Trophy, Activity } from 'lucide-react';

export default function DashboardStats({ stats, loading, error }) {
  const statItems = [
    {
      name: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      name: 'Present Today',
      value: stats.presentToday,
      icon: UserCheck,
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      name: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: Activity,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50'
    },
    {
      name: 'Active Matches',
      value: stats.activeMatches,
      icon: Trophy,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <div
          key={item.name}
          className="rounded-lg border bg-white p-6 shadow-sm"
        >
          <div className="flex items-center space-x-4">
            <div className={`${item.bg} p-3 rounded-full`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{item.name}</p>
              <h3 className="text-2xl font-semibold text-gray-900">
                {item.value}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
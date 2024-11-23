import React from 'react';

export function StatsCard({ icon: Icon, title, value, color }) {
  // Map color names to Tailwind color classes
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-900'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-900'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      text: 'text-yellow-900'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`rounded-lg shadow-sm border border-gray-200 ${colors.bg} transition-all duration-200 hover:shadow-md`}>
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colors.icon}`} />
          <h3 className="text-sm font-medium text-gray-800">{title}</h3>
        </div>
        <p className={`mt-4 text-3xl font-bold ${colors.text}`}>{value}</p>
      </div>
    </div>
  );
}

export default StatsCard;
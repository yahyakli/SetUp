import React from 'react';

const StatCard = ({ title, value, icon: Icon, change, changeType }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-primary-50 dark:bg-primary-900">
          <Icon className="h-6 w-6 text-primary-500" aria-hidden="true" />
        </div>
      </div>
      {change && (
        <div className="mt-4">
          <span className={`text-sm font-medium ${
            changeType === 'increase' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {changeType === 'increase' ? '↑' : '↓'} {change}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">from last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard; 
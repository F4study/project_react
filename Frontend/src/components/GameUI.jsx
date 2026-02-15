import React from 'react';
import { Zap, Award, Flame } from 'lucide-react';

export const StatCard = ({ icon: Icon, label, value, subtext }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</h3>
      <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
        <Icon className="text-cyan-600 dark:text-cyan-400" size={20} />
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
    {subtext && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtext}</p>}
  </div>
);

export const ProgressBar = ({ current, max, label, showPercentage = true }) => {
  const percentage = (current / max) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        {showPercentage && (
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{Math.round(percentage)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const Badge = ({ children, variant = 'primary', size = 'md' }) => {
  const variants = {
    primary: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
    success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    danger: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`rounded-full font-medium inline-block ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

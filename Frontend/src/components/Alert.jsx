import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export const Alert = ({ type = 'info', title, message, onClose }) => {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200',
  };

  const icons = {
    info: <Info size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertCircle size={20} />,
    error: <AlertCircle size={20} />,
  };

  return (
    <div className={`border rounded-lg p-4 flex gap-4 items-start ${styles[type]}`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1">
        {title && <h3 className="font-semibold">{title}</h3>}
        {message && <p className="text-sm mt-1">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-75 transition"
        >
          ✕
        </button>
      )}
    </div>
  );
};

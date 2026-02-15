import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  icon: Icon,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3 text-gray-400" size={20} />}
        <input
          ref={ref}
          className={`w-full px-4 py-2 rounded-lg border transition outline-none
            ${Icon ? 'pl-10' : ''}
            ${error
              ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 bg-white dark:bg-gray-800'
            }
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = React.forwardRef(({
  label,
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full px-4 py-2 rounded-lg border transition outline-none resize-none
          ${error
            ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
            : 'border-gray-300 dark:border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 bg-white dark:bg-gray-800'
          }
          text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export const Select = React.forwardRef(({
  label,
  error,
  options = [],
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-4 py-2 rounded-lg border transition outline-none
          ${error
            ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
          }
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

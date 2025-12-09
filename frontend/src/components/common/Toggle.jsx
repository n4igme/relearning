export default function Toggle({ 
  label, 
  name, 
  checked, 
  onChange, 
  disabled = false, 
  className = '',
  ...props 
}) {
  return (
    <div className={`flex items-center ${className}`}>
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div className={`block w-14 h-8 rounded-full ${disabled ? 'bg-gray-300' : 'bg-gray-300'}`}></div>
          <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${checked ? 'transform translate-x-6' : ''} ${disabled ? 'bg-gray-400' : ''}`}></div>
        </div>
        {label && (
          <span className={`ml-3 text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-700'}`}>
            {label}
          </span>
        )}
      </label>
    </div>
  );
}
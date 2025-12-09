import { useState } from 'react';

export default function FileUpload({
  label,
  name,
  onChange,
  accept = '*/*',
  multiple = false,
  error = '',
  required = false,
  disabled = false,
  className = '',
  placeholder = 'Choose file(s)...',
  ...props
}) {
  const [fileNames, setFileNames] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFileNames(files.map(file => file.name));
    onChange && onChange(e);
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          required={required}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          {...props}
        />
        <div className={`w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer ${error ? 'border-red-500' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}>
          <span className="text-gray-500">
            {fileNames.length > 0 ? fileNames.join(', ') : placeholder}
          </span>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
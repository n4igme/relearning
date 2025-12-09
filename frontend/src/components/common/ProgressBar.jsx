export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  className = '',
  ...props
}) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700">{percentage}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
          {...props}
        ></div>
      </div>
    </div>
  );
}
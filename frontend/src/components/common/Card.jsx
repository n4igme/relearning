export default function Card({
  children,
  title,
  subtitle,
  className = '',
  padding = true,
  ...props
}) {
  return (
    <div
      className={`card ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

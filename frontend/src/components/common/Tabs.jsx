import { useState } from 'react';

export default function Tabs({ tabs, defaultIndex = 0, className = '' }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <div className={className}>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              onClick={() => setActiveIndex(index)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeIndex === index
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count !== undefined && (
                <span
                  className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeIndex === index
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
}
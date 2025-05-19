import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4 my-4">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xl font-bold">T</span>
        </div>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Tailwind Test</div>
        <p className="text-gray-500">This component tests if Tailwind CSS is working properly</p>
      </div>
    </div>
  );
};

export default TestComponent;

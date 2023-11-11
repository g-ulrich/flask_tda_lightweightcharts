import React, { useState } from 'react';

const TailwindTable = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`flex items-center justify-center mt-8 ${isDarkMode ? 'dark' : ''}`}>
      <button onClick={toggleDarkMode} className="mb-4 p-2 bg-blue-500 text-white">
        Toggle Dark Mode
      </button>
      <table className={`min-w-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} border border-gray-300`}>
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Age</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 px-4 border-b">1</td>
            <td className="py-2 px-4 border-b">John Doe</td>
            <td className="py-2 px-4 border-b">25</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border-b">2</td>
            <td className="py-2 px-4 border-b">Jane Doe</td>
            <td className="py-2 px-4 border-b">30</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border-b">3</td>
            <td className="py-2 px-4 border-b">Bob Smith</td>
            <td className="py-2 px-4 border-b">22</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TailwindTable;

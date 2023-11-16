import React from 'react';
import URLRouting from '../components/URLRouting';
import HeaderMenu from '../components/headerMenu';
import 'bootstrap-icons/font/bootstrap-icons.css';
// https://icons.getbootstrap.com/
// https://tailwindcss.com/docs/

function App() {
  return (
    <div className=" mx-auto justify-between items-center">
      <div className="flex flex-row gap-2 p-2">
        <div className="basis-1/8 rounded "><HeaderMenu /></div>
        <div className="basis-7/8 rounded p-2 text-gray-300 w-full"><URLRouting /></div>
      </div>
    </div>
  );
}

export default App;

import React from 'react';
import '../css/main.css';
import Home from '../pages/Home'
import Charts from '../pages/Charts'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import TailwindTable from './components/TailwindTable';

function URLRouting() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/charts" element={<Charts/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default URLRouting;

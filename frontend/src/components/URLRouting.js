import React from 'react';
import '../css/main.css';
import Home from '../pages/Home'
import Charts from '../pages/Charts'
import TradingViewWidget from '../pages/tradingViewWidget';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function URLRouting() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/charts" element={<Charts/>} />
        <Route path="/tradingView" element={<TradingViewWidget/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default URLRouting;

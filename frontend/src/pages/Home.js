import React from 'react';
import FinanceChart from '../components/charts/financeChartWidget';
import PageHeader from '../components/pageHeader';
import Quotes from '../components/quotes';

const Home = () => {
  const pageTitle = "Dashboard";
 
  const chartProps = {
    height: "500px",
    symbol: 'QQQ',
    dailyCandles: false 
  };

  return (
    <div>
      <PageHeader props={pageTitle} />
      <div className="grid grid-cols-12 gap-2 mb-2">
        <div className="col-span-8">
          <FinanceChart props={chartProps} />
        </div>
        <div className="col-span-4">
          <Quotes props={chartProps} />
        </div>
      </div>
    </div>
  )
};

export default Home;

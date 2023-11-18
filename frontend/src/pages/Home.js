import React from 'react';
import FinanceChart from '../components/chart';
import PageHeader from '../components/pageHeader';
import Quotes from '../components/quotes';

const Home = () => {
  const pageTitle = "Dashboard";
 
  const data = {
    height: "500px",
    daily: null,
    intraday: {
        symbol: 'QQQ',
        minute: 5,
        days: 5,
        ext: false,
        current: false,
        max: false,
        from_last_close: false
    }
  };

  return (
    <div>
      <PageHeader props={pageTitle} />
      <div className="grid grid-cols-12 gap-2 mb-2">
        <div className="col-span-8">
          <FinanceChart props={data} />
        </div>
        <div className="col-span-4">
          <Quotes props={data} />
        </div>
      </div>
    </div>
  )
};

export default Home;

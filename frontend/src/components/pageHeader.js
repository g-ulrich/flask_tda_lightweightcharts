import React, { useState, useEffect } from 'react';
import { getCurrentDateTime, getDayOfWeek } from '../components/tools';
import { MarketHoursProgress } from '../components/trackMarketHours';

const PageHeader = (props) => {
  const [dateTime, setDateTime] = useState(`${getDayOfWeek()} ${getCurrentDateTime()}`);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDateTime(`${getDayOfWeek()} ${getCurrentDateTime()}`);
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []); // Empty dependency array to run effect only once on mount

  return (
    <div className="grid grid-rows-1 grid-cols-3 grid-flow-col gap-2">
      <div className="text-[30px]">{props.props}</div>
      <div>
        <MarketHoursProgress />
      </div>
      <div className=" text-right text-[30px] text-discordDarkGray">{dateTime}</div>
    </div>
  );
};

export default PageHeader;

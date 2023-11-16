import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import PageHeader from '../components/pageHeader';

const Charts = () => {
  const pageTitle = "Charts";
  const chartContainerRef = useRef(null);

  useEffect(() => {
    // Initialize chart within the useEffect hook
    const chart = createChart(chartContainerRef.current, { 
      width: chartContainerRef.current.clientWidth, 
      height: 300 
    });
    const lineSeries = chart.addLineSeries();

    // Sample data
    const data = [
      { time: '2019-04-11', value: 80.01 },
      { time: '2019-04-12', value: 96.63 },
      { time: '2019-04-13', value: 76.64 },
      { time: '2019-04-14', value: 81.89 },
      { time: '2019-04-15', value: 74.43 },
      { time: '2019-04-16', value: 80.01 },
      { time: '2019-04-17', value: 96.63 },
      { time: '2019-04-18', value: 76.64 },
      { time: '2019-04-19', value: 81.89 },
      { time: '2019-04-20', value: 74.43 },
    ];

    lineSeries.setData(data);

    // Cleanup function to destroy the chart when the component unmounts
    return () => chart.remove();
  }, []); // Empty dependency array ensures the effect runs only once on mount

  return (
    <div>
      <PageHeader props={pageTitle} />
      <div ref={chartContainerRef}></div>
    </div>
  );
};

export default Charts;

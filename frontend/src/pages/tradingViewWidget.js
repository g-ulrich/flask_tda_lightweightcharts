import React, { useEffect, useRef } from 'react';
import PageHeader from '../components/pageHeader';

let tvScriptLoadingPromise;

export default function TradingViewWidget() {
    const pageTitle = "Trading View Widget (15min Delay)";
  const onLoadScriptRef = useRef();

  useEffect(
    () => {
      onLoadScriptRef.current = createWidget;

      if (!tvScriptLoadingPromise) {
        tvScriptLoadingPromise = new Promise((resolve) => {
          const script = document.createElement('script');
          script.id = 'tradingview-widget-loading-script';
          script.src = 'https://s3.tradingview.com/tv.js';
          script.type = 'text/javascript';
          script.onload = resolve;

          document.head.appendChild(script);
        });
      }

      tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

      return () => onLoadScriptRef.current = null;

      function createWidget() {
        if (document.getElementById('tradingview_4960d') && 'TradingView' in window) {
          new window.TradingView.widget({
            autosize: true,
            symbol: "NASDAQ:AAPL",
            interval: "5",
            timezone: "America/New_York",
            theme: "dark",
            style: "2",
            locale: "en",
            enable_publishing: false,
            hide_side_toolbar: false,
            allow_symbol_change: true,
            save_image: false,
            container_id: "tradingview_4960d"
          });
        }
      }
    },
    []
  );

  return (
    <div className='tradingview-widget-container' style={{ height: "100%", width: "100%" }}>
      <PageHeader props={pageTitle} />
      <div id='tradingview_4960d' style={{ height: "calc(100% - 32px)", width: "100%" }} />
    </div>
  );
}

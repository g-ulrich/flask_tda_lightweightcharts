import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { skeletonGraph } from '../skeletons';
import { getCurrentTime, generateAlphaNumString } from '../tools';
import axios from 'axios';

const FinanceChart = ({ props }) => {
    const chartHeight = props.height || '400px';
    const chartContainerRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const chartLegendsRef = useRef(null);
    const [requestDaily, setRequestDaily] = useState(props.dailyCandles);
    const [refresh, setRefresh] = useState(generateAlphaNumString(5));
    const [timeseries, setTimeseries] = useState(null);
    // 1 5 10 15 30
    const timeFrames = { '1D': 1, '5D': 5, '1M': 10, '3M': 15, '6M': 30, 'YTD': 365, '1Y': 365, '5Y': 365 * 5, 'All': 365 * 20 };

    const getTimeseriesData = async () => {
        try {
            // const daily = requestDaily >= 365;
            // var payLoad = {};
            // if (daily) {
            //     payLoad = {
            //         symbol: props.symbol,
            //         years: requestDaily / 365,
            //         ext: false,
            //         current: false,
            //         max: false
            //     }
            // }else {
            //     var n_days = 1;
            //     if (requestDaily == 10) {
            //         n_days = 31;
            //     } else if (requestDaily == 15) {
            //         n_days = 31*3;
            //     } else if (requestDaily == 30) {
            //         n_days = 31*6;
            //     } else {
            //         n_days = requestDaily;
            //     }
            //     payLoad = {
            //         symbol: props.symbol,
            //         minute: requestDaily,
            //         days: n_days,
            //         ext: false,
            //         current: false,
            //         max: false,
            //         from_last_close: false
            //     }
            // }
            const isDaily = requestDaily >= 365;
            const n_days =
                requestDaily === 10
                    ? 31
                    : requestDaily === 15
                        ? 31 * 3
                        : requestDaily === 30
                            ? 31 * 6
                            : requestDaily;

            const payLoad = {
                symbol: props.symbol,
                ...(isDaily
                    ? {
                        years: requestDaily / 365,
                    }
                    : {
                        minute: requestDaily,
                        days: n_days,
                        from_last_close: false,
                    }),
                ext: false,
                current: false,
                max: false,
            };
            const response = await axios.post(isDaily ? 'daily_history' : 'intraday_history', { data: payLoad });
            setTimeseries(response.data.df);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getTimeseriesData();
        };

        const resizeHandler = () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.resize(chartContainerRef.current.clientWidth, 500);
            }
        };

        window.addEventListener('resize', resizeHandler);
        setTimeseries(null);
        fetchData();

        return () => {
            window.removeEventListener('resize', resizeHandler);
        };
    }, [refresh]);

    useEffect(() => {
        const loadChartData = () => {
            if (!timeseries) return;
            const colors = {
                up: 'rgba(39, 157, 130, 100)',
                down: 'rgba(200, 97, 100, 100)',
            };
            const chartData = JSON.parse(timeseries);
            const GMTtoEST = (timestamp) => (timestamp - 5 * 60 * 60 * 1000) / 1000;
            const revisedChartData = chartData.map(({ datetime, close, open, low, high }) => ({
                time: GMTtoEST(datetime),
                close,
                open,
                low,
                high,
            }));

            const candlesSeries = chartInstanceRef.current.addCandlestickSeries({
                color: 'rgb(0, 120, 255)',
                upColor: colors.up,
                borderUpColor: colors.up,
                wickUpColor: colors.up,
                downColor: colors.down,
                borderDownColor: colors.down,
                wickDownColor: colors.down,
                lineWidth: 2,
            });

            candlesSeries.setData(revisedChartData);
            candlesSeries.priceScale().applyOptions({
                scaleMargins: { top: 0.2, bottom: 0.2 },
            });

            const volumeSeries = chartInstanceRef.current.addHistogramSeries({
                color: '#26a69a',
                priceFormat: { type: 'volume' },
                overlay: true,
                priceScaleId: 'volume_scale',
                scaleMargins: {
                    top: 0.8,
                    bottom: 0,
                },
            });

            volumeSeries.setData(
                chartData.map((candle) => ({
                    time: GMTtoEST(candle.datetime),
                    value: candle.volume,
                    color: candle.open > candle.close ? 'rgba(200, 97, 100, .5)' : 'rgba(39, 157, 130, .5)',
                }))
            );

            volumeSeries.priceScale().applyOptions({
                scaleMargins: { top: 0.8, bottom: 0 },
            });
        };

        const pane = {
            backgroundColor: '#36393e',
            hoverBackgroundColor: '#3c434c',
            clickBackgroundColor: '#50565E',
            activeBackgroundColor: 'rgba(0, 122, 255, 0.7)',
            mutedBackgroundColor: 'rgba(0, 122, 255, 0.3)',
            borderColor: '#3C434C',
            color: '#d8d9db',
            activeColor: '#ececed',
        };

        chartInstanceRef.current = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth || 500,
            height: 500,
            layout: {
                textColor: pane.color,
                background: {
                    color: pane.backgroundColor,
                    type: ColorType.Solid,
                },
                fontSize: 12,
            },
            rightPriceScale: {
                scaleMargins: { top: 0.3, bottom: 0.25 },
            },
            timeScale: { timeVisible: true, secondsVisible: false },
            crosshair: {
                mode: CrosshairMode.FinanceChart,
                vertLine: {
                    labelBackgroundColor: 'rgb(46, 46, 46)',
                },
                horzLine: {
                    labelBackgroundColor: 'rgb(55, 55, 55)',
                },
            },
            grid: {
                vertLines: { color: '#424549' },
                horzLines: { color: '#424549' },
            },
            handleScroll: { vertTouchDrag: true },
        });

        if (timeseries) {
            loadChartData();
        }

        const shorthandFormat = (num) => {
            const absNum = Math.abs(num);
            if (absNum >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (absNum >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString().padStart(8, ' ');
        };

        chartInstanceRef.current.subscribeCrosshairMove((param) => {
            if (param.time) {
                const firstChartData = JSON.parse(timeseries)[0];
                const mapIterator = param.seriesData.entries();
                const chartData = Array.from(mapIterator);
                const candle = chartData[0][1];
                const volumeData = chartData[1][1];
                const color = volumeData.color.replace(', .5', '');
                const arrow = candle.open < candle.close ? '▲' : '▼';
                const pl = `${(candle.close - candle.open).toFixed(2)} (${(((candle.close - candle.open) / candle.close) * 100).toFixed(2)}%)`;
                const dataArr = ['open', 'high', 'low', 'close'];
                const main_legend = dataArr
                    .map((item) => `${item.charAt(0).toUpperCase()}<span style='color: ${color}'>${candle[item].toFixed(2)}</span> `)
                    .join('') + ` ${arrow} <span style="color: ${color}">${pl}</span>`;

                chartLegendsRef.current.innerHTML = `<b>${firstChartData.symbol}</b> <span style='font-size: 12px;'>${main_legend} Vol <span style='color: ${color}'>${shorthandFormat(volumeData.value)}</span></span>`;
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.remove();
            }
        };
    }, [timeseries]);

    const frequencyCallback = () => {
        setRefresh(generateAlphaNumString(5));
    };



    return (<div>
        <div className="rounded bg-discordGray p-2">
            <div className="z-[999] absolute " ref={chartLegendsRef}></div>
            <div ref={chartContainerRef} style={{ height: chartHeight }}></div>

            <div className=" border-t border-discordDarkGray pt-[3px]">

                <div className="grid grid-cols-12 gap-2 w-full">
                    <div className="col-span-6">
                        <ul className="flex items-center -space-x-px h-8 text-sm">
                            {Object.keys(timeFrames).map((key) => (
                                <li>
                                    <a href="#" onClick={() => (setRequestDaily(timeFrames[key]), frequencyCallback())} className="flex items-center justify-center px-3 h-8 leading-tight hover:bg-discordDarkGray focus:border-b focus:border-discordPurple focus:text-discordPurple focus:animate-pulse">{key}</a>
                                </li>
                            ))}

                        </ul>
                    </div>
                    <div className="col-span-6 text-right my-auto text-sm px-3">
                        <span className={`${timeseries === null ? 'hidden' : ''}`}>{getCurrentTime()} (EST)</span>
                        <div role="status" className={`${timeseries === null ? '' : 'hidden'}`}>
                            <svg aria-hidden="true" class="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>);
};

export default FinanceChart;

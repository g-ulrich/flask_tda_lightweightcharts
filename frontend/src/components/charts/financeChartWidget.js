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
    const [dailyPropData, setDailyPropData] = useState({
        symbol: props.symbol,
        years: 1,
        ext: false,
        current: false,
        max: false
    });
    const [intradayPropData, setIntradayPropData] = useState({
        symbol: props.symbol,
        minute: 5,
        days: 5,
        ext: false,
        current: false,
        max: false,
        from_last_close: false
    });
    const [requestDaily, setRequestDaily] = useState(props.dailyCandles);
    const [refresh, setRefresh] = useState(generateAlphaNumString(5));
    const [timeseries, setTimeseries] = useState(null);
    // 1 5 10 15 30
    const timeFrames = { '1D': 1, '5D': 5, '1M': 10, '3M': 15, '6M': 30, 'YTD': 0, '1Y': 0, '5Y': 0, 'All': 0 };

    const getTimeseriesData = async () => {
        console.log(requestDaily);
        // try {
            
        //     const response = await axios.post(requestDaily ? 'daily_history' : 'intraday_history', { data: requestDaily ? dailyPropData : intradayPropData });
        //     setTimeseries(response.data.df);
        // } catch (error) {
        //     console.log(error);
        // }
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

    const frequencyCallback = (freq) => {
        // setTimeseries(null);
        // const fetchData = async () => {
        //     await getTimeseriesData();
        // };
        const val = timeFrames[freq];
        const key = freq.toString();
        if (freq != 0) {
            setRequestDaily(requestDaily => false);
            setIntradayPropData({
                ...intradayPropData,
                minute: val,
                days: key == '1D' || key == '5D' ? parseInt(key) * 2 : parseInt(key) * 31
            })
        } else {
            setRequestDaily(requestDaily => true);
            setDailyPropData({
                ...dailyPropData,
                years: key == 'YTD' || key == '1Y' ? 1 : 5
            })
        }
        setRefresh(generateAlphaNumString(5));
        // fetchData();
    }

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
                                    <a href="#" onClick={() => (frequencyCallback(key))} className="flex items-center justify-center px-3 h-8 leading-tight hover:bg-discordDarkGray focus:border-b focus:border-discordPurple focus:text-discordPurple focus:animate-pulse">{key}</a>
                                </li>
                            ))}

                        </ul>
                    </div>
                    <div className="col-span-6 text-right my-auto text-sm px-3">
                        <span className={`${timeseries === null ? 'hidden' : ''}`}>{getCurrentTime()} (EST)</span>
                        <i className={`${timeseries === null ? 'animate-ping bi bi-emoji-smile' : 'hidden' }`}></i>
                    </div>
                </div>
            </div>
        </div>
    </div>);
};

export default FinanceChart;

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { skeletonGraph } from './skeletons';
import {formatCurrency} from './tools';
import axios from 'axios';

const FinanceChart = ({ props }) => {
    const chartHeight = props.height != null ? props.height : '400px';
    const chartContainerRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const chartLegendsRef = useRef(null)
    const chartProps = props;
    const [timeseries, setTimeseries] = useState(null);

    useEffect(() => {
        const resizeHandler = () => {
            if (chartInstanceRef.current) {
                // Resize the chart whenever the container size changes
                chartInstanceRef.current.resize(chartContainerRef.current.clientWidth, 500);
            }
        };

        window.addEventListener('resize', resizeHandler);

        return () => {
            window.removeEventListener('resize', resizeHandler);
        };
    }, []);

    const intraday_historicals = () => {
        const data = chartProps.intraday;
        axios.post('intraday_history', { data })
            .then(response => {
                setTimeseries(response.data.df);
            })
            .catch(error => {
                console.log(error);
                // Handle any errors that occur during the request
            });
    }

    useEffect(() => {
        const fetchData = async () => {
            await intraday_historicals();
        };

        fetchData();
        return () => {
            // Clean up logic here
        };
    }, []);


    // useEffect(() => {
    //     const textShape = textShapeRef.current;

    //     const updateTextOnHover = (param) => {
    //         if (param.time && param.price) {
    //             // Update the text content based on the candlestick hover event
    //             textShape.setText(`Hovered: Time ${param.time}, Price ${param.price}`);
    //         }
    //     };

    //     // Subscribe to candlestick hover events
    //     chartInstanceRef.current.subscribeCrosshairMove(updateTextOnHover);

    //     return () => {
    //         // Unsubscribe from events to prevent memory leaks
    //         chartInstanceRef.current.unsubscribeCrosshairMove(updateTextOnHover);
    //     };
    // }, []);


    useEffect(() => {
        const loadChartData = () => {
            const chartData = JSON.parse(timeseries);
            const GMTtoEST = (timestamp) => (timestamp - 5 * 60 * 60 * 1000) / 1000;
            const revisedChartData = chartData.map(candle => {
                return {
                    time: GMTtoEST(candle.datetime),
                    close: candle.close,
                    open: candle.open,
                    low: candle.low,
                    high: candle.high
                };
            });
            let up = 'rgba(39, 157, 130, 100)';
            let down = 'rgba(200, 97, 100, 100)';
            const candlesSeries = chartInstanceRef.current.addCandlestickSeries({
                color: 'rgb(0, 120, 255)', upColor: up, borderUpColor: up, wickUpColor: up,
                downColor: down, borderDownColor: down, wickDownColor: down, lineWidth: 2,
              });
            candlesSeries.setData(revisedChartData);
            candlesSeries.priceScale().applyOptions({
                scaleMargins: {top: 0.2, bottom: 0.2},
            });
            const volumeSeries = chartInstanceRef.current.addHistogramSeries({
                color: '#26a69a',
                priceFormat: { type: 'volume' },
                overlay: true,
                priceScaleId: 'volume_scale',
                scaleMargins: {
                    top: 0.8, // Adjust top margin as needed
                    bottom: 0, // Set bottom margin to 0 to place the histogram at the lowest point
                },
            })
            volumeSeries.setData(chartData.map(candle => ({
                time: GMTtoEST(candle.datetime),
                value: candle.volume,
                color: candle.open > candle.close ? "rgba(200, 97, 100, .5)" : "rgba(39, 157, 130, .5)", // red : green
            })));
            volumeSeries.priceScale().applyOptions({
                scaleMargins: {top: 0.8, bottom: 0},
            });
        }

        const pane = {
            backgroundColor: '#36393e',
            hoverBackgroundColor: '#3c434c',
            clickBackgroundColor: '#50565E',
            activeBackgroundColor: 'rgba(0, 122, 255, 0.7)',
            mutedBackgroundColor: 'rgba(0, 122, 255, 0.3)',
            borderColor: '#3C434C',
            color: '#d8d9db',
            activeColor: '#ececed',
        }

        chartInstanceRef.current = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth || 500,
            height: 500,
            layout: {
                textColor: pane.color,
                background: {
                    color: pane.backgroundColor,
                    type: ColorType.Solid,
                },
                fontSize: 12
            },
            rightPriceScale: {
                scaleMargins: { top: 0.3, bottom: 0.25 },
            },
            timeScale: { timeVisible: true, secondsVisible: false },
            crosshair: {
                mode: CrosshairMode.FinanceChart,
                vertLine: {
                    labelBackgroundColor: 'rgb(46, 46, 46)'
                },
                horzLine: {
                    labelBackgroundColor: 'rgb(55, 55, 55)'
                }
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

        // let legendItemFormat = (num, decimal) => num.toFixed(decimal).toString().padStart(8, ' ')

        let shorthandFormat = (num) => {
            const absNum = Math.abs(num)
            if (absNum >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (absNum >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString().padStart(8, ' ');
        }
        
        chartInstanceRef.current.subscribeCrosshairMove((param) => {
            if (param.time) {
                const firstChartData = JSON.parse(timeseries)[0];
                const mapIterator = param.seriesData.entries();
                const chartData = Array.from(mapIterator);
                const candle = chartData[0][1];
                const volumeData = chartData[1][1];
                const color = volumeData.color.replace(', .5', '');
                const arrow = candle.open < candle.close ? '▲' : '▼';
                const pl = `${(candle.close - candle.open).toFixed(2)} (${(((candle.close - candle.open)/candle.close)*100).toFixed(2)}%)`;
                var main_legend = "";
                const dataArr = ['open', 'high', 'low', 'close'];
                dataArr.forEach((item) => {
                    main_legend += `${item.charAt(0).toUpperCase()}<span style='color: ${color}'>${candle[item].toFixed(2)}</span>`;
                });
                main_legend += ` ${arrow} <span style="color: ${color}">${pl}</span>`;
                main_legend = `<b>${firstChartData.symbol}</b> <span style='font-size: 12px'>${main_legend} Vol <span style='color: ${color}'>${shorthandFormat(volumeData.value)}</span></span>`;
                chartLegendsRef.current.innerHTML = main_legend;
            }
            
        });
        


        return () => {
            // Cleanup chartInstanceRef.current here
            if (chartInstanceRef.current) {
                chartInstanceRef.current.remove();

            }
        };
    }, [timeseries]);

    return (
        <>
            <div className="rounded bg-discordGray p-2">
                <div className="z-[999] absolute " ref={chartLegendsRef}></div>
                <div ref={chartContainerRef} style={{ height: chartHeight }}>
                    <div className={`${timeseries === null ? '' : 'hidden'}`}>{skeletonGraph(chartHeight)}</div>
                </div>
            </div>
        </>
    );
};

export default FinanceChart;

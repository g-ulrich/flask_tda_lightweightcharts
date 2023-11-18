import React, { useState, useEffect } from 'react';
import ProgressBar from '../components/progress';
import { getCurrentTime, calcTimeP, isMarketOpen, extractHHMM } from '../components/tools';


export const MarketHoursProgress = () => {
    const [hours, setHours] = useState(null);

    const fetchData = async () => {
        try {
            const response = await fetch('market_hours');
            const data = await response.json();
            if (data.obj === null) {
                setHours({
                    obj: data.obj
                });
            } else {
                setHours({
                    obj: data.obj,
                    pre: data.obj.preMarket[0],
                    reg: data.obj.regularMarket[0],
                    post: data.obj.postMarket[0],
                    open: { market: data.open, pre: data.pre, reg: data.reg, post: data.post }
                });
            }
        } catch (error) {
            console.error('Error fetching market hours data:', error);
        }
    };

    useEffect(() => {
        // setLoading(true);
        fetchData();
        const intervalId = setInterval(() => {
            fetchData();
        }, 60000);

        // Clear the interval when the component is unmounted
        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            {hours === null ? (
                <div role="status" className="animate-pulse">
                    <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 max-w-[640px] mb-2.5 mx-auto"></div>
                    <div className="h-2.5 mx-auto bg-gray-300 rounded-full dark:bg-gray-700 max-w-[540px]"></div>
                    <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 max-w-[640px] mt-2.5 mx-auto"></div>
                    <span className="sr-only">Loading...</span>
                </div>

            ) : hours.obj === null ? (
                <div className="text-center my-auto text-discordGray text-[30px]"><i className="bi bi-bank"></i> Market closed</div>
            ) : (

                <div>

                    <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-4">

                            <span>
                                <h3 className={`font-medium leading-tight text-left ${isMarketOpen(hours.pre.start, hours.pre.end) ? 'text-discordPurple' : ''}`}>
                                    <i className="bi bi-cup-hot-fill"></i> Pre-Market</h3>
                                <p className={`text-sm text-left ${isMarketOpen(hours.pre.start, hours.pre.end) ? 'text-discordPurple' : ''}`}>
                                    {isMarketOpen(hours.pre.start, hours.pre.end) ? getCurrentTime() : extractHHMM(hours.pre.start)} - {extractHHMM(hours.pre.end)}</p>
                            </span>
                        </div>
                        <div className="col-span-4">
                            <span>
                                <h3 className={`font-medium leading-tight text-center ${isMarketOpen(hours.reg.start, hours.reg.end) ? 'text-discordPurple' : ''}`}>
                                    <i className="bi bi-bank"></i> Regular-Market</h3>
                                <p className={`text-sm text-center ${isMarketOpen(hours.reg.start, hours.reg.end) ? 'text-discordPurple' : ''}`}>
                                    {isMarketOpen(hours.reg.start, hours.reg.end) ? getCurrentTime() : extractHHMM(hours.reg.start)} - {extractHHMM(hours.reg.end)}</p>
                            </span>
                        </div>
                        <div className="col-span-4">
                            <span >
                                <h3 className={`font-medium leading-tight text-right ${isMarketOpen(hours.post.start, hours.post.end) ? 'text-discordPurple' : ''}`}>
                                    <i className="bi bi-sunset-fill"></i> After-Market</h3>
                                <p className={`text-sm text-right ${isMarketOpen(hours.post.start, hours.post.end) ? 'text-discordPurple' : ''}`}>
                                    {isMarketOpen(hours.post.start, hours.post.end) ? getCurrentTime() : extractHHMM(hours.post.start)} - {extractHHMM(hours.post.end)}</p>
                            </span>
                        </div>
                    </div>
                    <ProgressBar percentage={100 - calcTimeP(hours.pre.start, hours.post.end)}
                        tooltiptext={`Market ${isMarketOpen(hours.pre.start, hours.post.end) && hours.open ? 'Open' : 'Closed'} ${getCurrentTime()}`}
                        classes={'bg-discordPurple'} />
                </div>
            )
            }

        </>
    );
};

import React from 'react';
import { Tooltip } from 'react-tooltip';
import {generateAlphaNumString} from './tools';

const ProgressBar = ({percentage, tooltiptext, classes}) => {
    const id = `tooltip_${generateAlphaNumString(20)}`;

  return (
    <>
    <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-discordGray relative">
        <div data-tooltip-id={id} data-tooltip-content={tooltiptext} className={`${classes} h-2 rounded-full`} style={{'width': `${percentage}%`}}>
            {percentage < 100 && percentage > 4 ?  <i class="-mt-[2px] -mr-[1px] text-[8px] float-right bi bi-circle-fill animate-pulse"></i> : ""}
        </div>
    </div>
    <Tooltip className="z-[999] shadow" key={`${id}`} id={`${id}`} />
    </>
  );
};

export default ProgressBar;

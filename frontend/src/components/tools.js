
export const getCurrentDateTime = () => {
    const now = new Date();
  
    // Get date components
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
  
    // Get time components
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return  `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  }

  export const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
  
    return `${hours}:${minutes}:${seconds}`;
  }

  export const generateAlphaNumString = (n) => {
    const alphanumericChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
  
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * alphanumericChars.length);
      randomString += alphanumericChars[randomIndex];
    }
  
    return randomString;
  }

  export const formatCurrency = (number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  
    return formatter.format(number);
  }

export const capitalizeString = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  export const generateRandomNumber = (max) => {
    return Math.floor(Math.random() * max);
  };
  
  export const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString(undefined, options);
  };


  export const calcTimeP = (start, end) => {
    //jsonObj = { end: "2023-11-14T20:00:00-05:00", start: "2023-11-14T16:00:00-05:00" }
    // const { start, end } = jsonObj;

    // Parse the start and end times
    const startTime = new Date(start);
    const endTime = new Date(end);

    // Calculate the total duration in seconds
    const totalDurationInSeconds = (endTime - startTime) / 1000;

    // Calculate the remaining duration in seconds from the current time to the end time
    const currentTime = new Date();
    const remainingDurationInSeconds = (endTime - currentTime) / 1000;

    // Calculate the percentage of time left
    const percentageTimeLeft = (remainingDurationInSeconds / totalDurationInSeconds) * 100;

    // Return the calculated percentage (rounded to two decimal places)
    return Math.round(percentageTimeLeft * 100) / 100;
}


export const extractHHMM = (dtStr) => {
  //  "2023-11-14T20:00:00-05:00"
  const spl = dtStr.split("T");
  return spl[spl.length -1].split("-")[0];
}

export const isMarketOpen = (start, end) => {
  // variables format = "2023-11-14T20:00:00-05:00"
  const currentTime = new Date();
  const startTime = new Date(start);
  const endTime = new Date(end);

  return currentTime >= startTime && currentTime <= endTime;
};

export const isMarketOpenGivenStartStr = (start) => {
  // "2023-11-14T20:00:00-05:00"
  const currentTime = new Date();
  const startTime = new Date(start);

  return currentTime >= startTime;
};

export const getDayOfWeek = () => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date();
  const dayOfWeek = daysOfWeek[date.getDay()];

  return dayOfWeek;
};

export const getValueByKey = (jsonArray, key) => {
  const result = jsonArray.map(item => item[key]);
  return result;
};
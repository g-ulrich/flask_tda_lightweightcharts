import React, { useState, useEffect } from 'react';
import { Icon, Table, Loader, Pagination } from 'semantic-ui-react';
import _ from 'lodash';
import 'semantic-ui-css/semantic.min.css';

function getCurrentDatetime() {
  const currentDatetime = new Date();

  const year = currentDatetime.getFullYear().toString();
  const month = (currentDatetime.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDatetime.getDate().toString().padStart(2, '0');
  const hour = currentDatetime.getHours().toString().padStart(2, '0');
  const minute = currentDatetime.getMinutes().toString().padStart(2, '0');
  const second = currentDatetime.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

const Package = () => {
  const [quotes, setQuotes] = useState([{}]);
  const [tableUpdateDate, setTableUpdateDate] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'netPercentChangeInDouble', direction: 'descending'});
  useEffect(() => {
    fetchQuotes(); // Initial fetch
    const interval = setInterval(fetchQuotes, 60000); // Fetch every 30 seconds

    return () => {
      clearInterval(interval); // Cleanup when the component unmounts
    };
  }, []);
  
  const fetchQuotes = () => {
    fetch('/quotes')
      .then((res) => res.json())
      .then((data) => {
        setQuotes(data);
        setTableUpdateDate(getCurrentDatetime());
      });
  };

 const handleSort = (key) => {
  setSortConfig({ 'key': key, 'direction': sortConfig.direction === 'ascending' ? 'descending' :  'ascending'});
};

  const sortedQuotes = () => {
    return sortConfig.direction === 'descending' ? (
      quotes.quote.sort((a, b) => b[sortConfig.key] - a[sortConfig.key]) 
    ) : (
      quotes.quote.sort((a, b) => (a[sortConfig.key] > b[sortConfig.key] ? 1 : -1))
    );
  }


var tableHeaders = [
  { name: 'Symbol', type: '', key: 'symbol' },
  { name: 'Percent Change', type: '%', key: 'netPercentChangeInDouble' },
  { name: 'Change', type: '$', key: 'netChange' },
  { name: 'Price', type: '$', key: 'mark' },
  { name: 'Volume', type: 'int', key: 'totalVolume' },
  { name: 'Low', type: '$', key: 'lowPrice' },
  { name: 'High', type: '$', key: 'highPrice' },
  { name: 'Volatility', type: '', key: 'volatility' },
//      { name: '52WkHigh', type: '$', key: '52WkHigh' },
//      { name: '52WkLow', type: '$', key: '52WkLow' },
//      { name: 'Div. Yield', type: '%', key: 'divYield' },
//      { name: 'Div. Date', type: 'date', key: 'divDate' },
//      { name: 'Real Time', type: 'bool', key: 'realtimeEntitled' },
];


  return (
    <div>
      {typeof quotes.quote === 'undefined' ? (
        <Loader active inline />
      ) : (
          
          <Table compact>
            <Table.Header>
              <Table.Row> 
                {tableHeaders.map((header) => (
                  <Table.HeaderCell
                    
                    onClick={() => handleSort(header.key)}>
                    {header.name}
                    {sortConfig && sortConfig.key === header.key && (
                      <Icon name={`sort ${sortConfig.direction}`} />
                    )}
                  </Table.HeaderCell>
                ))}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {sortedQuotes().map((quote, i) => (
                <Table.Row key={quote.symbol +'_'+ i.toString()} className={
                    quote.netPercentChangeInDouble > 0 ? 'positive' : 'negative'}>
                  {tableHeaders.map((header) => (
                    header.type === 'bool' ? (
                      <Table.Cell key={header.key+'_'+ i.toString()} className="center aligned" >
                        {quote[header.key] ? <Icon name='check square' /> : <Icon name='square' />}
                      </Table.Cell>
                    ) : header.type === 'date' ? (
                      <Table.Cell key={header.key+'_'+ i.toString()}>
                        {quote[header.key].split(' ')[0]}
                      </Table.Cell>
                    ) : header.type === 'int' ? (
                      <Table.Cell key={header.key+'_'+ i.toString()}>
                        {quote[header.key].toLocaleString()}
                      </Table.Cell>
                    ) : header.type === '$' || header.type === '%' ? (
                      <Table.Cell key={header.key+'_'+ i.toString()}>
                        {header.type}{quote[header.key].toFixed(3)}
                      </Table.Cell>
                    ) : header.key === 'symbol' ? (
                      <Table.Cell key={header.key+'_'+ i.toString()} className="center aligned" >
                        {quote[header.key]}
                      </Table.Cell>
                    ) : (
                      <Table.Cell key={header.key+'_'+ i.toString()}>
                        {header.type}{quote[header.key]}
                      </Table.Cell>
                    )
                  ))}
                </Table.Row>
              ))}
            </Table.Body>

              <Table.Footer fullWidth>
              <Table.Row>
                <Table.HeaderCell colSpan={tableHeaders.length}>
                    <div style={{ color: '#888888' }}>Updated: {tableUpdateDate}</div>
                    <Pagination
                      boundaryRange={0}
                      defaultActivePage={1}
                      ellipsisItem={null}
                      firstItem={null}
                      lastItem={null}
                      siblingRange={1}
                      totalPages={10}
                    />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>

          </Table>

      )}
    </div>
  );
};

export default Package;
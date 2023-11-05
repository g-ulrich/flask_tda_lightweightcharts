import React, { useState, useEffect } from 'react';
import { Icon, Table, Button } from 'semantic-ui-react';
import _ from 'lodash';
import 'semantic-ui-css/semantic.min.css';

const Package = () => {
  const [quotes, setQuotes] = useState([{}]);
  const [sortConfig, setSortConfig] = useState(null);

  useEffect(() => {
    fetch('/quotes')
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setQuotes(data);
      });
  }, []);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedQuotes = _.orderBy(
    quotes.quote,
    sortConfig ? [sortConfig.key] : [],
    sortConfig ? [sortConfig.direction] : []
  );

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

  function getQuotesTable(quotes) {
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
      <Table celled>
        <Table.Header>
          <Table.Row>
            {tableHeaders.map((header) => (
              <Table.HeaderCell
                key={header.key}
                onClick={() => handleSort(header.key)}
              >
                {header.name}
                {sortConfig && sortConfig.key === header.key && (
                  <Icon name={`sort ${sortConfig.direction}`} />
                )}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {sortedQuotes.map((quote) => (
            <Table.Row
              key={quote.symbol}
              className={
                quote.netPercentChangeInDouble > 0 ? 'positive' : 'negative'
              }
            >
              {tableHeaders.map((header) => (
                header.type === 'bool' ? (
                  <Table.Cell
                    key={header.key}
                    className="center aligned"
                  >
                    {quote[header.key]
                      ? <Icon name='check square' />
                      : <Icon name='square' />}
                  </Table.Cell>
                ) : header.type === 'date' ? (
                  <Table.Cell key={header.key}>
                    {quote[header.key].split(' ')[0]}
                  </Table.Cell>
                ) : header.type === 'int' ? (
                  <Table.Cell key={header.key}>
                    {quote[header.key].toLocaleString()}
                  </Table.Cell>
                ) : header.type === '$' || header.type === '%' ? (
                  <Table.Cell key={header.key}>
                    {header.type}{quote[header.key].toFixed(3)}
                  </Table.Cell>
                ) : header.key === 'symbol' ? (
                  <Table.Cell
                    key={header.key}
                    className="center aligned"
                  >
                    {quote[header.key]}
                  </Table.Cell>
                ) : (
                  <Table.Cell key={header.key}>
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
                <div style={{ color: '#888888' }}> {getCurrentDatetime()}</div>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>

      </Table>
    );
  }

  return (
    <div>
      {typeof quotes.quote === 'undefined' ? (
        <p>Loading...</p>
      ) : (
        getQuotesTable({ quote: sortedQuotes })
      )}
    </div>
  );
};

export default Package;
import React from 'react';
import { Icon, Table } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

function getQuotesTable(quotes) {
  var tableHeaders = [
    { name: 'Symbol', type: '', key: 'symbol' },
    { name: 'Change', type: '%', key: 'netPercentChangeInDouble' },
    { name: 'Price', type: '$', key: 'mark' },
    { name: 'Volume', type: '', key: 'totalVolume' },
    { name: 'Open', type: '$', key: 'openPrice' },
    { name: 'High', type: '$', key: 'highPrice' },
    { name: '52WkHigh', type: '$', key: '52WkHigh' },
    { name: '52WkLow', type: '$', key: '52WkLow' },
    { name: 'Div. Yield', type: '%', key: 'divYield' },
    { name: 'Div. Date', type: '', key: 'divDate' },
    { name: 'Real Time', type: '', key: 'realtimeEntitled' },
  ];

  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          {tableHeaders.map((header) => (
            <Table.HeaderCell key={header.key}>{header.name}</Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {quotes.quote.map((quote) => (
          <Table.Row key={quote.symbol} className={quote.netPercentChangeInDouble > 0 ? "positive" : "negative"}>
            {tableHeaders.map((header) => (
              <Table.Cell key={header.key}>{header.type}{quote[header.key]}</Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

export const Quotes = ({ quotes }) => {
  console.log(quotes);
  return (
    <div>
      {typeof quotes.quote === 'undefined' ? (
        <p>Loading...</p>
      ) : (
        getQuotesTable(quotes)
      )}
    </div>
  );
};
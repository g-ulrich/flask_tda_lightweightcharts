import React, { useState, useEffect } from 'react';
import { Icon, Table, Loader, Button, Pagination, Dropdown, Grid } from 'semantic-ui-react';
import _ from 'lodash';
import 'semantic-ui-css/semantic.min.css';
import './css/styles.css';
// import 'bootstrap/dist/css/bootstrap.min.css'

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


const tableHeaders = [
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

const Package = () => {
  const [quotes, setQuotes] = useState([{}]);
  const [tableUpdateDate, setTableUpdateDate] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'netPercentChangeInDouble', direction: 'descending' });
  const [activePage, setActivePage] = useState(1); // Active page for pagination
  const [pageSize, setPageSize] = useState(10);

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
    setSortConfig({ 'key': key, 'direction': sortConfig.direction === 'ascending' ? 'descending' : 'ascending' });
  };

  const sortedQuotes = () => {
    return sortConfig.direction === 'descending' ? (
      quotes.quote.sort((a, b) => b[sortConfig.key] - a[sortConfig.key])
    ) : (
      quotes.quote.sort((a, b) => (a[sortConfig.key] > b[sortConfig.key] ? 1 : -1))
    );
  };

  const getOptions = (number, prefix = 'Choice ') =>
  _.times(number, (index) => ({
    key: index,
    text: `${prefix}${10*index+10}`,
    value: 25*index+25,
  }))

  const getColor = (n) => {
    // green : red
    return n > 0 ? '#bce0be' : '#e0bcbc';
  };

  const handlePageSize = (e) => {
    console.log("combo", e.target.textContent);
    setPageSize(Number(e.target.textContent));
  }

  const handlePageChange = (e, { activePage }) => {
    setActivePage(activePage);
  };

  const startIndex = (activePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  // const displayedQuotes = sortedQuotes().slice(startIndex, endIndex);


  return (
    <div>
      {typeof quotes.quote === 'undefined' ? (
        <Loader active inline />
      ) : (
          <div>
          <Table compact inverted>
          <Table.Header>
          <Table.Row>
                <Table.HeaderCell colSpan={tableHeaders.length}>
                  <Grid>
                <Grid.Column floated='left' width={5}>
                  <div as='h1' className="text-muted text-padding">Quotes</div>

                       </Grid.Column>
                  <Grid.Column floated='right' width={6}>
                  <div as='h4' className="text-right text-muted text-padding">Updated: {tableUpdateDate}</div>
                  </Grid.Column>
                </Grid>
                  </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
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
              {sortedQuotes().slice(startIndex, endIndex).map((quote, i) => (
                <Table.Row inverted key={quote.symbol +'_'+ i.toString()}>
                  {tableHeaders.map((header) => (
                    header.type === 'bool' ? (
                      <Table.Cell 
                        style={{color: getColor(quote.netPercentChangeInDouble)}}
                        key={header.key+'_'+ i.toString()} 
                        className="center aligned">
                        {quote[header.key] ? <Icon name='check square' /> : <Icon name='square' />}
                      </Table.Cell>
                    ) : header.type === 'date' ? (
                      <Table.Cell 
                      style={{color: getColor(quote.netPercentChangeInDouble)}}
                      key={header.key+'_'+ i.toString()}>
                        {quote[header.key].split(' ')[0]}
                      </Table.Cell>
                    ) : header.type === 'int' ? (
                      <Table.Cell 
                      style={{color: getColor(quote.netPercentChangeInDouble)}}
                      key={header.key+'_'+ i.toString()}>
                        {quote[header.key].toLocaleString()}
                      </Table.Cell>
                    ) : header.type === '$' || header.type === '%' ? (
                      <Table.Cell 
                      style={{color: getColor(quote.netPercentChangeInDouble)}}
                      key={header.key+'_'+ i.toString()}>
                        {header.type}{quote[header.key].toFixed(3)}
                      </Table.Cell>
                    ) : header.key === 'symbol' ? (
                      <Table.Cell 
                      style={{color: getColor(quote.netPercentChangeInDouble)}}
                      key={header.key+'_'+ i.toString()} className="center aligned" >
                        {quote[header.key]}
                      </Table.Cell>
                    ) : (
                      <Table.Cell 
                      style={{color: getColor(quote.netPercentChangeInDouble)}}
                      key={header.key+'_'+ i.toString()}>
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
                  
                <Grid>
                <Grid.Column floated='left' width={3}>
                <Dropdown
                  placeholder='Page Size'
                  className='button secondary'
                  onChange={handlePageSize}
                  options={getOptions(10, '')}
                /> 
                  
                       </Grid.Column>
                  <Grid.Column floated='right' width={10}>

                  <Pagination inverted
                          boundaryRange={1}
                          defaultActivePage={1}
                          ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                          firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                          lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                          prevItem={{ content: <Icon name='angle left' />, icon: true }}
                          nextItem={{ content: <Icon name='angle right' />, icon: true }}
                          totalPages={Math.ceil(sortedQuotes().length / pageSize)}
                          activePage={activePage}
                          onPageChange={handlePageChange}
                          pointing
                          secondary
                        />
                  </Grid.Column>
                </Grid>
                
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>

          </Table>
          
        </div>
      )}
    </div>
  );
};

export default Package;
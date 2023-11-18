"""
The TDA API is a web-based application programming interface (API)
that provides programmatic access to the TD Ameritrade trading platform.
This API allows developers to access various data and services provided by
TD Ameritrade, such as account information, balance summaries, transaction
histories, real-time quotes, order placement, and more.

The TDA API is based on RESTful principles and communicates over HTTPS.
Developers can use a variety of programming languages, libraries,
and tools to interact with the TDA API, including Python, Java, .NET, and more.
TD Ameritrade also provides a suite of client libraries that handle some
of the heavy lifting of the API interactions, making it easier to integrate
the TDA API into your applications.

To use the TDA API, developers need to first obtain an API key from
TD Ameritrade and authenticate requests using OAuth 2.0.
TD Ameritrade provides comprehensive documentation, tutorials,
and support for developers looking to use the TDA API, making
it easier to get started with building applications that
interface with the TD Ameritrade trading platform.

u: remembercalvary
p: WPN145unk$

list of snp 500 https://tda-api.readthedocs.io/en/latest/_static/sp500.txt
"""
from tda.orders.common import Duration, EquityInstruction
from tda.orders.common import OrderStrategyType, OrderType, Session
from tda.orders.generic import OrderBuilder
from common.tools import Log, tree_traverse, group_list_of_dicts, list_of_datetimes
from datetime import datetime, timedelta
from tda import auth
import pandas as pd
import tda.client
import tda.auth
import string
import os

log = Log()


class TDA:
    def __init__(self):
        super().__init__()
        log.debug("TDA()")
        self.api_key = os.environ['TDA_API']
        self.redirect_uri = 'https://localhost/'
        self.token_path = 'assets/bin/individual.json'
        self.client = tda.auth.easy_client(self.api_key, self.redirect_uri, self.token_path)

        self.account = self.get_account()
        self.account_id = tree_traverse(self.account, "accountId")
        self.positions = tree_traverse(self.account, "positions")
        self.transactions = self.get_account_transactions()
        self.intraday_backup = []
        # market hours
        self.post_market, self.pre_market, self.regular_market = None, None, None
        self.is_pre_market_open, self.is_regular_market_open, self.is_post_market_open = False, False, False
        self.get_text_market_open = ""
        self.is_market_open = False
        self.market_hours_obj = self.get_market_hours()

    def make_webdriver(self):
        log.debug("TDA.make_webdriver()")
        # Import selenium here because it's slow to import
        from selenium import webdriver
        # driver = webdriver.Chrome()
        driver = webdriver.Firefox()
        # This ensures that the Chrome browser is closed when the program exits, even if an exception is raised.
        # atexit.register(lambda: self.web_driver.quit())
        return driver

    def renew_pickle(self):
        log.debug("TDA.renew_pickle()")
        # this is to be called manually.
        return auth.client_from_login_flow(self.make_webdriver(), self.api_key, self.redirect_uri, self.token_path)

    def update_client(self):
        log.debug("TDA.update_client()")
        self.client = tda.auth.easy_client(self.api_key, self.redirect_uri, self.token_path)

    def filter(self, resp):
        log.debug("TDA.filter()")
        self.update_client()
        codes = {
            "400": "There is a validation problem with the request.",
            "401": "The caller must pass a valid AuthToken.",
            "500": "There is an unexpected server error.",
            "403": "You are forbidden from accessing this page."
        }
        if resp.status_code == 200:
            return True, resp.json()
        elif f"{resp.status_code}" in codes.keys():
            print(str(datetime.now()), codes[str(resp.status_code)])
            self.renew_pickle() if resp.status_code == 401 else ""
            return False, resp.json()
        else:
            return False, "Unknown ERROR."

    def get_account(self):
        log.debug("TDA.get_account()")
        success, r = self.filter(self.client.get_accounts(fields=self.client.Account.Fields.POSITIONS))
        return r[0] if success else self.account

    def update_account(self):
        log.debug("TDA.update_account()")
        self.account = self.get_account()
        self.account_id = tree_traverse(self.account, "accountId")
        self.positions = tree_traverse(self.account, "positions")

    def get_account_liquidation_value(self):
        self.update_account()
        return tree_traverse(self.account, "currentBalances")['liquidationValue']

    def get_account_cash_value(self):
        self.update_account()
        return tree_traverse(self.account, "currentBalances")['cashAvailableForTrading']

    def get_account_transactions(self, days=1):
        log.debug("TDA.get_account_transactions()")
        time_delta = datetime.today() - timedelta(days=days)
        success, r = self.filter(self.client.get_transactions(self.account_id,
                                                              transaction_type=self.client.Transactions.TransactionType.ALL,
                                                              symbol=None,
                                                              start_date=time_delta,
                                                              end_date=datetime.today()))
        return r if success else self.transactions

    def update_account_transactions(self, days=1):
        log.debug("TDA.update_account_transactions()")
        self.transactions = self.get_account_transactions(days)

    def get_account_history(self, days=10):
        log.debug("TDA.get_account_history()")
        # ohlcv graph needs: fdatetime, open, high, low, close, volume, freq
        if days != 1:
            self.update_account_transactions(days)
        transactions = self.transactions
        transactions.reverse()
        use_types = ["JOURNAL", "RECEIVE_AND_DELIVER"]
        val = sum([tree_traverse(i, "netAmount") for i in transactions if
                   tree_traverse(i, "netAmount") and i['type'] not in use_types])
        val = self.get_account_liquidation_value() - val

        history = []
        for i, v in enumerate(transactions, 0):
            amount = tree_traverse(v, "netAmount")
            if amount and v['type'] not in use_types:
                val += amount
            if amount and amount != 0.0:
                history.append({"fdatetime": f"{v['settlementDate']}T00:00:00",
                                "mmdd": f"{v['settlementDate'][5:8]}{v['settlementDate'][8:10]}",
                                "freq": "1D",
                                "volume": amount if amount and amount > 0.0 else 0,
                                "close": val,
                                "open": val,
                                "high": val,
                                "low": val})
        condensed = [{'fdatetime': grp[0]['fdatetime'], 'mmdd': grp[0]['mmdd'],
                      'freq': "1D", 'volume': sum([g['volume'] for g in grp]),
                      'close': grp[-1]['close'],
                      'open': grp[0]['close'],
                      'high': max([i['close'] for i in grp]),
                      'low': min([i['close'] for i in grp])
                      } for grp in group_list_of_dicts(history, "mmdd")]
        dates = [i['fdatetime'] for i in condensed]
        new = []
        for i, dt in enumerate(list_of_datetimes(days, day_only=True), 0):
            if dt in dates:
                new.append(condensed[dates.index(dt)])
            else:
                try:
                    c = new[len(new) - 1]['close']
                    new.append({'fdatetime': dt, 'mmdd': f"{dt[5:8]}{dt[8:10]}",
                                'freq': '1D', 'volume': new[len(new) - 1]['volume'], 'close': c,
                                'open': c, 'high': c, 'low': c})
                except:
                    pass
        df = pd.DataFrame(new)
        df = df.assign(datetime=[int(datetime.fromisoformat(i).timestamp()) for i in df['fdatetime'].tolist()])
        df = df.assign(symbol=[self.account_id] * len(df))
        df = df.drop_duplicates(subset=['mmdd'])
        df = df.reset_index()
        return df

    def get_orders(self, days=1):
        log.debug("TDA.get_orders()")
        time_delta = datetime.today() - timedelta(days=days)
        success, r = self.filter(self.client.get_orders_by_path(account_id=self.account_id,
                                                                from_entered_datetime=time_delta))
        return r if success else []

    def get_quotes(self, symbols=[]):
        log.debug("TDA.get_quote()")
        success, r = self.filter(self.client.get_quotes(symbols))
        if not success:
            log.error(f"TDA.get_quotes() symbols {symbols}, {r}")
        return [v for k, v in r.items()] if success else []

    def get_current_price(self, symbol=""):
        return [i['lastPrice'] for i in self.get_quotes([symbol])][0]

    def get_intraday_history(self, symbol="", minute=1, days=1, ext=False, current=False, max=False,
                             from_last_close=False):
        log.debug(
            f"TDA.get_intraday_history(symbol={symbol}, minute={minute}, days={days}, ext={ext}, current={current}, max={max})")
        freq = [[self.client.PriceHistory.Frequency.EVERY_MINUTE, 1],
                [self.client.PriceHistory.Frequency.EVERY_FIVE_MINUTES, 5],
                [self.client.PriceHistory.Frequency.EVERY_TEN_MINUTES, 10],
                [self.client.PriceHistory.Frequency.EVERY_FIFTEEN_MINUTES, 15],
                [self.client.PriceHistory.Frequency.EVERY_THIRTY_MINUTES, 30]]
        time_delta = datetime.today() - timedelta(days=365 if max else days)
        yesterday = datetime.now() - timedelta(days=1)
        success, r = self.filter(self.client.get_price_history(symbol=symbol,
                                                               period_type=self.client.PriceHistory.PeriodType.DAY,
                                                               frequency_type=self.client.PriceHistory.FrequencyType.MINUTE,
                                                               frequency=[i[0] for i in freq if minute == i[1]][0],
                                                               start_datetime=yesterday.replace(hour=16, minute=0,
                                                                                                second=0,
                                                                                                microsecond=0) if from_last_close else time_delta,
                                                               end_datetime=datetime.today(),
                                                               need_extended_hours_data=ext))
        backup = [i for i, v in enumerate(self.intraday_backup, 0) if
                  symbol == v['symbol'] and minute == v['minute']]
        if success:
            df = pd.DataFrame(r['candles'])
            if current and self.is_regular_market_open:
                new_row = {k: [df.iloc[-1][k]] for k in list(df.columns) if k not in ['close', 'datetime']}
                new_row['close'] = self.get_current_price(symbol)
                new_row['datetime'] = datetime.timestamp(datetime.now())
                df = pd.concat([df, pd.DataFrame(new_row)])
                df = df.reset_index(drop=True)
            df = df.assign(freq=["min"] * len(df))
            df = df.assign(symbol=[symbol] * len(df))
            df = df.assign(
                fdatetime=[datetime.fromtimestamp(int(str(i)[:10])).isoformat() for i in df['datetime'].tolist()])
            df = df.assign(mmdd=[f"{i[5:8]}{i[8:10]}" for i in df['fdatetime'].tolist()])
            df = df.assign(index=[i for i in range(len(df))])
            if backup:
                try:
                    del self.intraday_backup[backup[0]]
                except:
                    pass
            # check if newest row contains data
            if df.iloc[len(df) - 1]['close'] == 0.0:
                df = df.drop(len(df) - 1)
            # store history incase failure
            self.intraday_backup.append({'minute': minute, 'symbol': symbol, 'df': df})
            return df
        else:
            log.info(f"TDA.get_intraday_history() using intraday_backup index: {backup[0]}")
            return self.intraday_backup[backup[0]]['df']

    def get_daily_history(self, symbol="", years=1, ext=False, current=False, max=False):
        log.debug(
            f"TDA.get_daily_history(symbol={symbol}, minute=1D, years={years}, current={current}, max={max})")
        time_delta = datetime.today() - timedelta(days=365 * 30 if max else 365 * years)
        minute = "1D"
        success, r = self.filter(self.client.get_price_history(symbol=symbol,
                                                               period_type=self.client.PriceHistory.PeriodType.YEAR,
                                                               frequency_type=self.client.PriceHistory.FrequencyType.DAILY,
                                                               frequency=self.client.PriceHistory.Frequency.DAILY,
                                                               start_datetime=time_delta,
                                                               end_datetime=datetime.today(),
                                                               need_extended_hours_data=ext))
        backup = [i for i, v in enumerate(self.intraday_backup, 0) if
                  symbol == v['symbol'] and minute == v['minute']]
        if success:
            df = pd.DataFrame(r['candles'])
            if current and self.is_regular_market_open:
                new_row = {k: [df.iloc[-1][k]] for k in list(df.columns) if k not in ['close', 'datetime']}
                new_row['close'] = self.get_current_price(symbol)
                new_row['datetime'] = datetime.timestamp(datetime.now())
                df = pd.concat([df, pd.DataFrame(new_row)])
                df = df.reset_index(drop=True)
            df = df.assign(freq=["min"] * len(df))
            df = df.assign(symbol=[symbol] * len(df))
            df = df.assign(
                fdatetime=[datetime.fromtimestamp(int(str(i)[:10])).isoformat() for i in df['datetime'].tolist()])
            df = df.assign(mmdd=[f"{i[5:8]}{i[8:10]}" for i in df['fdatetime'].tolist()])
            df = df.assign(index=[i for i in range(len(df))])
            if backup:
                del self.intraday_backup[backup[0]]
            # check if newest row contains data
            if df.iloc[len(df) - 1]['close'] == 0.0:
                df = df.drop(len(df) - 1)
            # store history incase failure
            self.intraday_backup.append({'minute': minute, 'symbol': symbol, 'df': df})
            return df
        else:
            log.info(f"TDA.get_daily_history() using intraday_backup index: {backup[0]}")
            return self.intraday_backup[backup[0]]['df']

    def get_market_hours(self):
        try:
            success, market_hours_obj = self.filter(self.client.get_hours_for_single_market(
                market=self.client.Markets.EQUITY, date=datetime.today()))
            if success:
                hours_obj = tree_traverse(market_hours_obj, 'sessionHours')
                self.post_market = hours_obj['postMarket'][0] if hours_obj is not None and hours_obj[
                    'postMarket'] else None
                self.pre_market = hours_obj['preMarket'][0] if hours_obj is not None and hours_obj[
                    'preMarket'] else None
                self.regular_market = hours_obj['regularMarket'][0] if hours_obj is not None and hours_obj[
                    'regularMarket'] else None
                self.market_hours_obj = market_hours_obj
                self.update_market_variables()
            return market_hours_obj
        except Exception as e:
            log.error(f"TDA.get_market_hours() {e}")
            return None

    def update_market_variables(self):
        if tree_traverse(self.market_hours_obj, 'sessionHours') is not None:
            f, d = '%Y-%m-%dT%H:%M:%S', datetime.now().replace(microsecond=0)
            hours = []
            for i in [self.pre_market, self.regular_market, self.post_market]:
                if i is not None:
                    hours.append(datetime.strptime(i['start'][0:19], f) <= d <= datetime.strptime(i['end'][0:19], f))
                else:
                    hours.append(False)
            self.is_pre_market_open, self.is_regular_market_open, self.is_post_market_open = tuple(hours)
        if self.is_pre_market_open:
            self.get_text_market_open = "Pre-Market is Open"
        elif self.is_regular_market_open:
            self.get_text_market_open = "Regular-Market is Open"
        elif self.is_post_market_open:
            self.get_text_market_open = "Post-Market is Open"
        else:
            self.get_text_market_open = "Market Closed"
        self.is_market_open = True in [self.is_pre_market_open, self.is_regular_market_open, self.is_post_market_open]

    def update_market_hours(self):
        try:
            now, saved = str(datetime.now())[0:10], tree_traverse(self.market_hours_obj, "date")
            if now != saved or self.market_hours_obj is None:
                log.info(f"TDA.update_market_hours() now {now} saved {saved}, market_hours_obj {self.market_hours_obj}")
                self.market_hours_obj = self.get_market_hours()
                self.update_market_variables()
        except Exception as e:
            log.error(f"TDA.update_market_hours() {e}")

    def get_active_symbols(self):
        symbols = []
        symbols_ext = symbols.extend
        for letter in string.ascii_lowercase:
            chunk = self.filter(self.client.search_instruments(symbols=f'{letter}.*',
                                                               projection=self.client.Instrument.Projection.SYMBOL_REGEX))
            symbols_ext([chunk[1][k]['symbol'] for k in chunk[1].keys() if
                         chunk[1][k]['exchange'] in ["NYSE", "NASDAQ"] and len(chunk[1][k]['symbol']) <= 4 and not
                         chunk[1][k]['symbol'] in [".", "-"]])
        return symbols

    # ORDER FUNCTIONS - EQUITIES
    def buy_limit(self, symbol, quantity, price=0):
        print("Order: [{}, shares: {}, ${}]".format(symbol, quantity, price))
        if quantity > 0:
            if price == 0:
                price = self.get_current_price(symbol)
                # price = price + (price * .0001)
            success, r = self.filter(self.client.place_order(account_id=self.account_id,
                                                             order_spec=(OrderBuilder()
                                                                         .set_order_type(OrderType.LIMIT)
                                                                         .set_price(price)
                                                                         .set_session(Session.SEAMLESS)
                                                                         .set_duration(Duration.GOOD_TILL_CANCEL)
                                                                         .set_order_strategy_type(
                                                                 OrderStrategyType.SINGLE)
                                                                         .add_equity_leg(EquityInstruction.BUY,
                                                                                         symbol.upper(), quantity))))
            print(success, r)

    def sell_limit(self, symbol, quantity=0, price=0.0):
        if price == 0.0:
            price = self.get_current_price(symbol)
            # price = price - (price * .0001)
        # if quantity == 0:
        #     position = [d for d in account_info(True)['positions'] if d['symbol'] == symbol]
        #     quantity = position[0]['shares']

        success, r = self.filter(self.client.place_order(account_id=self.account_id,
                                                         order_spec=(OrderBuilder()
                                                                     .set_order_type(OrderType.LIMIT)
                                                                     .set_price(price)
                                                                     .set_session(Session.SEAMLESS)
                                                                     .set_duration(Duration.GOOD_TILL_CANCEL)
                                                                     .set_order_strategy_type(OrderStrategyType.SINGLE)
                                                                     .add_equity_leg(EquityInstruction.SELL,
                                                                                     symbol.upper(),
                                                                                     quantity))))
        print(success, r)

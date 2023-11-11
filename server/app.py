from flask import Flask, render_template
from API.TD import TDA
from common.tools import Log, split_list
from common.active_symbols import symbols as SYMBOLS
log = Log()
log.empty_log_file()
tda = TDA()
app = Flask(__name__)


# Define a route to serve the React app
@app.route('/quotes')
def quote():
    q = []
    symbol_list = [i for i in SYMBOLS if len(i) <= 4 and "-" not in i and "." not in i]
    for i in split_list(symbol_list, 250):
        try:
            qu = tda.get_quotes(i)
            for quote in qu:
                q.append(quote)
        except:
            pass
    return {"quote": [i for i in q if i['totalVolume'] > 1000]}


# @app.route('/')
# def index():
#     return render_template("client/public/index.html")


# Define API routes and endpoints in api.py (separated for organization)
# from api import api_bp
# app.register_blueprint(api_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)

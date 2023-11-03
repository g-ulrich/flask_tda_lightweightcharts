from flask import Flask, render_template

app = Flask(__name__)


# Define a route to serve the React app
@app.route('/')
def index():
    return render_template('index.html')


# Define API routes and endpoints in api.py (separated for organization)
# from api import api_bp
# app.register_blueprint(api_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)

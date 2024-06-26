from flask import Flask
from part1 import part1_blueprint 
from part2 import part2_blueprint
from part3 import part3_blueprint
from flask_cors import CORS
from waitress import serve

"""
Create a Flask app and register the blueprints for the three parts of the 
assignment.
"""
def create_app():
    app = Flask(__name__)
    app.register_blueprint(part1_blueprint)
    app.register_blueprint(part2_blueprint)
    app.register_blueprint(part3_blueprint)
    CORS(app)
    return app

if __name__ == '__main__':
    app = create_app()
    serve(app, host='0.0.0.0', port=5000)

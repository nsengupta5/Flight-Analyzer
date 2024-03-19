from flask import Flask
from part1 import part1_blueprint 
from part2 import part2_blueprint
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.register_blueprint(part1_blueprint)
    app.register_blueprint(part2_blueprint)
    CORS(app)
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)

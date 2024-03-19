from flask import Blueprint

part2_blueprint = Blueprint('Part2', __name__)

from .views import *

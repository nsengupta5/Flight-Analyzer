from flask import Blueprint

part1_blueprint = Blueprint('Part1', __name__)

from .views import *

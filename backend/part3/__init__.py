from flask import Blueprint

part3_blueprint = Blueprint('Part3', __name__)

from .views import *

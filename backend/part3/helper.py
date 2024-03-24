import numpy as np
import math

"""
Helper functions for normalizing values and scaling

Params:
    arr (list): The list of routes
    col (str): The column name to normalize
    factor (int): The factor to multiply the normalized values by

Returns:
    list: The list of routes with normalized values
"""
def normalize_values(arr, col, factor=1):
    # Extract the 'value' from the routes and convert to a numpy array for normalization
    values = np.array([route[col] for route in arr])
    # Perform normalization (min-max scaling)
    normalized_values = (values - values.min()) / (values.max() - values.min())
    # Assign normalized values back to the routes
    for i, route in enumerate(arr):
        route['value'] = normalized_values[i] * factor

    return arr

"""
Helper function to normalize a value between 0 and 1
using logarithmic scaling

Params:
    value (float): The value to normalize

Returns:
    float: The normalized value
"""
def modified_log_scale(value):
    # Add 1 to ensure the log function is applied to a positive number
    return math.log10(value + 1)

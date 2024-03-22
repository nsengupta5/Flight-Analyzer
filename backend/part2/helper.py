from pyspark.sql import functions as F

"""
Returns the performance of a single metric for the US states

Parameters:
    metric (str): The metric to calculate the performance for
    collected_data (list): A list of dictionaries containing the collected data
    global_min_max_values (dict): A dictionary containing the global minimum and maximum values for the metrics
    metric_mapping (dict): A dictionary mapping metric abbreviations to readable names

Returns:
    dict: A dictionary containing the performance of the US states and regions, the
          minimum and maximum state values, and the best and worst performing states
"""
def get_performance_result_single(metric, collected_data, global_min_max_values, metric_mapping):
    for k, v in metric_mapping.items():
        if v == metric:
            metric_map = {}
            for row in collected_data:
                score = 0

                # Normalize the whole number metrics
                if v.startswith('Mean'):
                    min_value = global_min_max_values[k]['min']
                    max_value = global_min_max_values[k]['max']
                    
                    # Taxi in & out time are coalesced to 0 if null, indicating not enough data
                    if min_value == 0 and max_value == 0 and metric == 'Mean Taxi In Time' or metric == 'Mean Taxi Out Time':
                        return None
                    normalized_value = normalize_value(row[k], min_value, max_value)
                    score = normalized_value
                else:
                    score = row[k]

                if row['OriginStateName'] is not None:
                    metric_map[row['OriginStateName']] = score

            # Convert the score to a percentage
            for state, score in metric_map.items():
                if state != 'metric':
                    metric_map[state] = (1 - score) * 100

            minStateVal = min(metric_map.values())
            maxStateVal = max(metric_map.values())
            best_states = get_best_performing_states(metric_map)
            worst_states = get_worst_performing_states(metric_map)
            region_scores = get_region_score(metric_map)
            metric_map['metric'] = v
            result = {'state_performance': metric_map, 
                      'region_performance': region_scores,
                      'min_state_val': minStateVal,
                      'max_state_val': maxStateVal,
                      'best_states': best_states,
                      'worst_states': worst_states,
                      }
            return result

"""
Returns the composite performance of the US states

Parameters:
    collected_data (list): A list of dictionaries containing the collected data
    global_min_max_values (dict): A dictionary containing the global minimum and maximum values for the metrics
    metric_mapping (dict): A dictionary mapping metric abbreviations to readable names
    weights (dict): A dictionary mapping metric names to their respective weights

Returns:
    dict: A dictionary containing the the performance of the US states and regions, the
          minimum and maximum state values, and the best and worst performing states
"""
def get_performance_result_composite(collected_data, global_min_max_values, metric_mapping, weights):
    composite_scores = {}

    # Loop through each metric and calculate the composite score
    for metric, readable_name in metric_mapping.items():
        metric_map = {"metric": readable_name}
        for row in collected_data:
            score = 0

            # Normalize the value if it is a mean value
            if readable_name.startswith('Mean'):  
                min_value = global_min_max_values[metric]['min']
                max_value = global_min_max_values[metric]['max']
                normalized_value = normalize_value(row[metric], min_value, max_value)
                score = normalized_value
            else:
                score = row[metric]

            # Calculate the weighted score for each metric
            weighted_score = score * weights[readable_name]
            if row['OriginStateName'] not in composite_scores:
                composite_scores[row['OriginStateName']] = weighted_score
            composite_scores[row['OriginStateName']] += weighted_score
            metric_map[row['OriginStateName']] = score

    state_performance = {}
    # Convert the composite score to a percentage
    for state, score in composite_scores.items():
        if state is not None:
            state_performance[state] = (1 - score) * 100
    
    minStateVal = min(state_performance.values())
    maxStateVal = max(state_performance.values())
    best_states = get_best_performing_states(state_performance)
    worst_states = get_worst_performing_states(state_performance)
    state_performance['metric'] = "Composite Score"
    region_scores = get_region_score(state_performance)
    result = {'state_performance': state_performance,
              'region_performance': region_scores,
              'min_state_val': minStateVal,
              'max_state_val': maxStateVal,
              'best_states': best_states,
              'worst_states': worst_states,
              }
    return result


"""
Returns the best performing states for each region

Parameters:
    state_performance (dict): A dictionary containing the performance of the US states

Returns:
    dict: A dictionary containing the best performing states for each region
"""
def get_best_performing_states(state_performance):
    region_mapping = get_region_mapping()
    scores = {}

    # Get the top 3 performing states for each region
    for region, states in region_mapping.items():
        region_scores = [(state, score) for state, score in state_performance.items() if state in states]
        region_scores = sorted(region_scores, key=lambda x: x[1], reverse=True)
        best_states = []
        for i in range(3):
            best_states.append({'state': region_scores[i][0], 'score': region_scores[i][1]})
        scores[region] = best_states
    return scores

"""
Returns the worst performing states for each region

Parameters:
    state_performance (dict): A dictionary containing the performance of the US states

Returns:
    dict: A dictionary containing the worst performing states for each region
"""
def get_worst_performing_states(state_performance):
    region_mapping = get_region_mapping()
    scores = {}

    # Get the bottom 3 performing states for each region
    for region, states in region_mapping.items():
        region_scores = [(state, score) for state, score in state_performance.items() if state in states]
        region_scores = sorted(region_scores, key=lambda x: x[1])
        worst_states = []
        for i in range(3):
            worst_states.append({'state': region_scores[i][0], 'score': region_scores[i][1]})
        scores[region] = worst_states
    return scores


"""
Returns the performance of the US regions
"""
def get_region_score(composite_scores):
    region_score = {}
    region_mapping = get_region_mapping()
    for region, states in region_mapping.items():
        # Calculate the average composite score for each region
        region_score[region] = sum([composite_scores[state] for state in states if state in composite_scores])
        region_score[region] /= len(states)
    return region_score

"""
Normalizes a value between 0 and 1 using Min-Max normalization

Parameters:
    value (float): The value to normalize
    min_value (float): The minimum value
    max_value (float): The maximum value

Returns:
    float: The normalized value
"""
def normalize_value(value, min_value, max_value):
    if min_value == max_value:
        return 0
    return (value - min_value) / (max_value - min_value)

"""
Returns the global minimum and maximum values for whole number metrics

Parameters:
    df (DataFrame): The input DataFrame containing the flight data

Returns:
    dict: A dictionary containing the global minimum and maximum values for the metrics
"""
def get_global_min_max_vals(df):
    agg_exprs = [
        # If null values are present, coalesce them to 0
        F.coalesce(F.min('TaxiOut'), F.lit(0)).alias('min_taxi_out'),
        F.coalesce(F.max('TaxiOut'), F.lit(0)).alias('max_taxi_out'),
        F.coalesce(F.min('TaxiIn'), F.lit(0)).alias('min_taxi_in'),
        F.coalesce(F.max('TaxiIn'), F.lit(0)).alias('max_taxi_in'),
    ]

    agg_results = df.agg(*agg_exprs).collect()[0]
    return {
        'mean_taxi_out': {'min': float(agg_results[0]), 'max': float(agg_results[1])},
        'mean_taxi_in': {'min': float(agg_results[2]), 'max': float(agg_results[3])},
    }


"""
Returns the metrics dataframe

Parameters:
    df (DataFrame): The input DataFrame containing the flight data
    group_columns (list): A list of columns to group by

Returns:
    DataFrame: The metrics DataFrame containing the aggregated metrics
"""
def get_metrics_df(df, group_columns):
    return df.groupBy(group_columns).agg(
        (F.sum(F.when(F.col('ArrDel15') == 1, 1).otherwise(0)) / F.count('*')).alias('arr_del_rate'),
        (F.sum(F.when(F.col('DepDel15') == 1, 1).otherwise(0)) / F.count('*')).alias('dep_del_rate'),
        (F.sum(F.when(F.col('Cancelled') == 1, 1).otherwise(0)) / F.count('*')).alias('cancellation_rate'),
        (F.sum(F.when(F.col('Diverted') == 1, 1).otherwise(0)) / F.count('*')).alias('diversion_rate'),

        # If null values are present, coalesce them to 0
        F.coalesce(F.avg('TaxiOut'), F.lit(0)).alias('mean_taxi_out'),
        F.coalesce(F.avg('TaxiIn'), F.lit(0)).alias('mean_taxi_in'),
    )

"""
Returns the mapping of metric abbreviations to readable names

Returns:
    dict: A dictionary mapping metric abbreviations to readable names
"""
def get_metric_mapping():
    return {
        "arr_del_rate": "Arrival Delay Rate",
        "dep_del_rate": "Departure Delay Rate",
        "cancellation_rate": "Cancellation Rate",
        "diversion_rate": "Diversion Rate",
        "mean_taxi_out": "Mean Taxi Out Time",
        "mean_taxi_in": "Mean Taxi In Time",
    }

"""
Returns the weights for each metric in the composite score

Returns:
    dict: A dictionary mapping metric names to their respective weights
"""
def get_weights():
    return {
        "Arrival Delay Rate": 0.3,
        "Departure Delay Rate": 0.3,
        "Cancellation Rate": 0.15,
        "Diversion Rate": 0.15,
        "Mean Taxi Out Time": 0.03,
        "Mean Taxi In Time": 0.03,
    }

"""
Returns the mapping of US states to their respective regions

Returns:
    dict: A dictionary mapping US states to their respective regions
"""
def get_region_mapping():
    return {
        'Northeast': ['Connecticut',
                      'Maine',
                      'Massachusetts',
                      'New Hampshire',
                      'Rhode Island',
                      'Vermont',
                      'New Jersey',
                      'New York',
                      'Pennsylvania'],
        'Midwest': ['Illinois',
                    'Indiana',
                    'Michigan',
                    'Ohio',
                    'Wisconsin',
                    'Iowa',
                    'Kansas',
                    'Minnesota',
                    'Missouri',
                    'Nebraska',
                    'North Dakota',
                    'South Dakota'
                    ],
        'South': ['Florida',
                  'Georgia',
                  'Maryland',
                  'North Carolina',
                  'South Carolina',
                  'Virginia',
                  'West Virginia',
                  'Alabama',
                  'Kentucky',
                  'Mississippi',
                  'Tennessee',
                  'Arkansas',
                  'Louisiana',
                  'Oklahoma',
                  'Texas'
                  ],
        'West': ['Arizona',
                 'Colorado',
                 'Idaho',
                 'Montana',
                 'Nevada',
                 'New Mexico',
                 'Utah',
                 'Wyoming',
                 'Alaska',
                 'California',
                 'Hawaii',
                 'Oregon',
                 'Washington'
                 ]
    }

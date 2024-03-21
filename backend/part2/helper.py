from pyspark.sql import functions as F

def get_performance_result_single(metric, collected_data, global_min_max_values, metric_mapping):
    for k, v in metric_mapping.items():
        if v == metric:
            metric_map = {}
            for row in collected_data:
                score = 0
                if v.startswith('Mean'):
                    min_value = global_min_max_values[k]['min']
                    max_value = global_min_max_values[k]['max']
                    if min_value == 0 and max_value == 0 and metric == 'Mean Taxi In Time' or metric == 'Mean Taxi Out Time':
                        return None
                    normalized_value = normalize_value(row[k], min_value, max_value)
                    score = normalized_value
                else:
                    score = row[k]

                if row['OriginStateName'] is not None:
                    metric_map[row['OriginStateName']] = score

            for state, score in metric_map.items():
                if state != 'metric':
                    metric_map[state] = (1 - score) * 100

            minStateVal = min(metric_map.values())
            maxStateVal = max(metric_map.values())
            region_scores = get_region_score(metric_map)
            metric_map['metric'] = v
            result = {'state_performance': metric_map, 
                      'region_performance': region_scores,
                      'min_state_val': minStateVal,
                      'max_state_val': maxStateVal
                      }
            return result

def get_performance_result_composite(collected_data, global_min_max_values, metric_mapping, weights):
    composite_scores = {}
    for metric, readable_name in metric_mapping.items():
        metric_map = {"metric": readable_name}
        for row in collected_data:
            score = 0
            if readable_name.startswith('Mean'):  
                min_value = global_min_max_values[metric]['min']
                max_value = global_min_max_values[metric]['max']
                normalized_value = normalize_value(row[metric], min_value, max_value)
                score = normalized_value
            else:
                score = row[metric]

            weighted_score = score * weights[readable_name]
            if row['OriginStateName'] not in composite_scores:
                composite_scores[row['OriginStateName']] = weighted_score
            composite_scores[row['OriginStateName']] += weighted_score
            metric_map[row['OriginStateName']] = score

    state_performance = {}
    for state, score in composite_scores.items():
        if state is not None:
            state_performance[state] = (1 - score) * 100
    
    minStateVal = min(state_performance.values())
    maxStateVal = max(state_performance.values())
    state_performance['metric'] = "Composite Score"
    region_scores = get_region_score(state_performance)
    result = {'state_performance': state_performance,
              'region_performance': region_scores,
              'min_state_val': minStateVal,
              'max_state_val': maxStateVal
              }
    return result

def get_region_score(composite_scores):
    region_score = {}
    region_mapping = get_region_mapping()
    for region, states in region_mapping.items():
        region_score[region] = sum([composite_scores[state] for state in states if state in composite_scores])
        region_score[region] /= len(states)
    return region_score

def normalize_value(value, min_value, max_value):
    if min_value == max_value:
        return 0
    return (value - min_value) / (max_value - min_value)

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

def get_metric_mapping():
    return {
        "arr_del_rate": "Arrival Delay Rate",
        "dep_del_rate": "Departure Delay Rate",
        "cancellation_rate": "Cancellation Rate",
        "diversion_rate": "Diversion Rate",
        "mean_taxi_out": "Mean Taxi Out Time",
        "mean_taxi_in": "Mean Taxi In Time",
    }

def get_weights():
    return {
        "Arrival Delay Rate": 0.3,
        "Departure Delay Rate": 0.3,
        "Cancellation Rate": 0.15,
        "Diversion Rate": 0.15,
        "Mean Taxi Out Time": 0.03,
        "Mean Taxi In Time": 0.03,
    }

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

import pandas as pd
import numpy as np
from pathlib import Path

base_dir = Path(__file__).resolve().parent
data_path = base_dir.parent / 'data' / 'combined_filtered.csv'

numerical_columns = [
    "Income Earned from Working 10 Hours a Week at State's Minimum Wage",
    "Affordability Gap (net price minus income earned working 10 hrs at min wage)",
    "Adjusted Monthly Center-Based Child Care Cost", 
    # "Number of Bachelor Degrees White Total",
    # "Number of Bachelor Degrees American Indian or Alaska Native Total",
    # "Number of Bachelor Degrees Asian Total",
    # "Number of Bachelor Degrees Black or African American Total",
    # "Number of Bachelor Degrees Latino Total",
    # "Number of Bachelor Degrees Native Hawaiian or Other Pacific Islander Total",
    # "\"Number of Degrees Awarded in Science, Technology, Engineering, and Math\"",
    # "Number of Degrees Awarded in Arts and Humanities",
    "Total Enrollment",
    "Transfer Out Rate",
    "Median Earnings of Students Working and Not Enrolled 10 Years After Entry",
    "Percent of Undergraduates Age 25 and Older",
    "Average Cost of Attendance",
]

racial_columns = [
    'White',
    'American Indian or Alaska Native',
    'Asian',
    'Black or African American',
    'Latino',
    'Native Hawaiian or Other Pacific Islander'
]

major_columns = [
    'STEM',
    'Arts and Humanities'
]

full_df = pd.read_csv(data_path)
full_df = (full_df.groupby(['Institution Name_x', 'City','State Abbreviation'], as_index=False)
           .agg({col: 'first' if full_df[col].dtype == 'object' else 'mean' for col in full_df.columns}))

mean_std = {
    k: (full_df[k].mean(), full_df[k].std())
    for k in numerical_columns
}

full_df[numerical_columns] = (full_df[numerical_columns] - full_df[numerical_columns].mean()) / full_df[numerical_columns].std()

def preprocess_parameters(parameters):
    columns = []
    params = []
    major, race = None, None
    for param in parameters:
        if param in mean_std:
            mean, std = mean_std[param]
            columns.append(param)
            params.append((parameters[param] - mean) / std)
        
    if 'Major' in parameters:
        major = parameters['Major']
        columns.append('Major')
        params.append(1)
    if 'Race' in parameters:
        race = parameters['Race']
        columns.append('Race')
        params.append(1)
    
    return np.array(params), columns, major, race

def rank(df, target, all_columns, t):
    ranks = df[all_columns].rank(axis=1, method='dense')

    row_min = ranks.min(axis=1)
    row_max = ranks.max(axis=1)
    row_range = row_max - row_min

    ranks_scaled = ranks.sub(row_min, axis=0).div(row_range, axis=0)
    ranks_scaled = ranks_scaled.fillna(0.5)
    # print(ranks_scaled)

    df[t] = ranks_scaled[target]

    return df

def create_parameter_arrays(df, columns, major, race):
    if major is not None:
        df = rank(df, major, major_columns, 'Major')
    if race is not None:
        df = rank(df, race, racial_columns, 'Race')

    row_arrays = np.stack([row for row in df[columns].to_numpy()])

    return row_arrays

def retrieve_nn(k, lat, lng):
    df = full_df.copy()
    
    df['dist'] = np.sqrt((df['Latitude'] - lat) ** 2 + (df['Longitude'] - lng) ** 2)

    knn = df.nsmallest(k, 'dist')

    return knn

def sort_by_similarity(df, cosine_similarities):
    df['similarities'] = cosine_similarities

    df_sorted = df.sort_values(by='similarities', ascending=False)

    return df_sorted['Institution Name_x'].values.tolist(), df_sorted['similarities'].values.tolist()

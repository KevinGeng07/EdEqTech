import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from tabulate import tabulate
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import KNNImputer, IterativeImputer

cr_csv = pd.read_csv('College Results View 2021 Data Dump for Export.xlsx - College Results View 2021 Data .csv')

### Replace 'NA' with np.nan.
cr_csv.replace('NA', np.nan, inplace=True)

### All rows have some null values.
print(len(cr_csv), cr_csv.isna().any(axis=1).sum())

### Count number of nulls. -> Remove columns with 65%+ total nulls & rows with 65%+ total nulls.
print(cr_csv.isna().sum())
cr_csv = cr_csv[cr_csv.columns[cr_csv.isna().mean() <= 0.65]]
cr_csv = cr_csv[cr_csv.isna().mean(axis=1) <= 0.65]
print(len(cr_csv.columns), len(cr_csv))


### Create tabulation file.
writefile = 'college_results_table.txt'
open(writefile, 'w').close()

with open(writefile, 'a') as wf:
    feature_table = [['Feature', '25th', 'Median', '75th', 'Mean', 'Std']]

    for col in cr_csv.columns:
        feature_row = [col]

        cr_feature = cr_csv[col]
        cr_feature = cr_feature.dropna().reset_index(drop=True)

        if cr_feature.dtype == object: continue

        feature_row.extend([np.percentile(cr_feature, 25), np.percentile(cr_feature, 50), np.percentile(cr_feature, 75),
                           np.mean(cr_feature), np.std(cr_feature)])

        feature_table.append(feature_row)

    
    wf.write(tabulate(feature_table[1:], headers=feature_table[0], tablefmt='fancy_grid'))
    wf.close()

cr_csv.to_csv('college_results.csv', index=False)


# TODO: WHEN RUNNING ML, ENSURE TRAIN/TEST SPLITS CREATED PRIOR TO ML, OTHERWISE DATA LEAKAGE. OR IGNORE.
### Create ML version of cr_csv w/ imputations. -> Remove columns of type STRING OBJECT.
cr_ml_csv = cr_csv.select_dtypes(exclude=['object']).drop(columns=['UNIQUE_IDENTIFICATION_NUMBER_OF_THE_INSTITUTION'], axis=1)
cr_ml_np = KNNImputer(missing_values=np.nan, n_neighbors=7).fit_transform(cr_ml_csv)
cr_ml_csv.loc[:, :] = cr_ml_np.round(3)
cr_ml_csv.to_csv('college_results_ml.csv', index=False)




ag_csv = pd.read_csv('Affordability Gap Data AY2022-23 2.17.25.xlsx - Affordability_latest_02-17-25 1.csv')

import pandas as pd
import numpy as np
from tabulate import tabulate
from sklearn.impute import KNNImputer


### TODO: College Results CSV.
cr_csv = pd.read_csv('data/College Results View 2021 Data Dump for Export.xlsx - College Results View 2021 Data .csv')

### All rows have some null values.
print(len(cr_csv), cr_csv.isna().any(axis=1).sum())

### Replace 'NA' with np.nan.
cr_csv.replace('NA', np.nan, inplace=True)

### Count number of nulls. -> Remove columns with 65%+ total nulls & rows with 65%+ total nulls.
print(cr_csv.isna().sum())
cr_csv = cr_csv[cr_csv.columns[cr_csv.isna().mean() <= 0.65]]
cr_csv = cr_csv[cr_csv.isna().mean(axis=1) <= 0.65]
print(len(cr_csv.columns), len(cr_csv))


### Create tabulation file.
writefile = 'exploratory/college_results_table.txt'
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

cr_csv.to_csv('exploratory/college_results.csv', index=False)


# WHEN RUNNING ML, ENSURE TRAIN/TEST SPLITS CREATED PRIOR TO ML, OTHERWISE DATA LEAKAGE. OR IGNORE.
### Create ML version of cr_csv w/ imputations. -> Remove columns of type STRING OBJECT.
cr_imp_csv = cr_csv.select_dtypes(exclude=['object']).drop(columns=['UNIQUE_IDENTIFICATION_NUMBER_OF_THE_INSTITUTION'], axis=1)
cr_imp_np = KNNImputer(missing_values=np.nan, n_neighbors=7).fit_transform(cr_imp_csv)
cr_imp_csv.loc[:, :] = cr_imp_np.round(3)
cr_imp_csv.to_csv('exploratory/college_results_imputed.csv', index=False)



### TODO: Affordability Gap CSV.
ag_csv = pd.read_csv('data/Affordability Gap Data AY2022-23 2.17.25.xlsx - Affordability_latest_02-17-25 1.csv')

### Replace '.' with np.NaN.
ag_csv.replace('.', np.nan, inplace=True)

### Most rows have some null values.
print(len(ag_csv), ag_csv.isna().any(axis=1).sum())

### Filter out rows & columns with excess null values.
print(ag_csv.isna().sum()[ag_csv.isna().sum() > 0])
ag_csv = ag_csv.drop(columns=['MSI Type', 'HBCU', 'PBI', 'ANNHI', 'TRIBAL', 'AANAPII', 'HSI', 'NANTI'])

### Create tabulation file.
writefile = 'exploratory/affordability_gap.txt'
open(writefile, 'w').close()

with open(writefile, 'a') as wf:
    feature_table = [['Feature', '25th', 'Median', '75th', 'Mean', 'Std']]

    for col in ag_csv.columns:
        feature_row = [col]

        cr_feature = ag_csv[col]
        cr_feature = cr_feature.dropna().reset_index(drop=True)

        if cr_feature.dtype == object: continue

        feature_row.extend([np.percentile(cr_feature, 25), np.percentile(cr_feature, 50), np.percentile(cr_feature, 75),
                           np.mean(cr_feature), np.std(cr_feature)])

        feature_table.append(feature_row)

    
    wf.write(tabulate(feature_table[1:], headers=feature_table[0], tablefmt='fancy_grid'))
    wf.close()

ag_csv.to_csv('exploratory/affordability_gap.csv', index=False)

# WHEN RUNNING ML, ENSURE TRAIN/TEST SPLITS CREATED PRIOR TO ML, OTHERWISE DATA LEAKAGE. OR IGNORE.
### Create ML version of cr_csv w/ imputations. -> Remove columns of type STRING OBJECT.
ag_imp_csv = ag_csv.select_dtypes(exclude=['object'])
ag_imp_np = KNNImputer(missing_values=np.nan, n_neighbors=7).fit_transform(ag_imp_csv)
ag_imp_csv.loc[:, :] = ag_imp_np.round(3)
ag_imp_csv.to_csv('exploratory/ag_results_imputed.csv', index=False)

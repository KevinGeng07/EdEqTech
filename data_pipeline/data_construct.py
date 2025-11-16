import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
from tabulate import tabulate

### Cross-match DataFrames to see how many colleges are found in both sets.
larger_df = pd.read_csv('exploratory/affordability_gap.csv')
smaller_df = pd.read_csv('exploratory/college_results.csv')

not_in = 0
for id in smaller_df['UNIQUE_IDENTIFICATION_NUMBER_OF_THE_INSTITUTION'].values:
    if id not in larger_df['Unit ID'].values: not_in += 1

### Aggregate the two DataFrames together while removing colleges not in larger_df.
combined = pd.merge(larger_df, smaller_df, left_on='Unit ID', right_on='UNIQUE_IDENTIFICATION_NUMBER_OF_THE_INSTITUTION', how='left')

### Extract critical features.
# Remove string objects from recommendation algorithm filtering -> add after.
crit_features = ['Institution Name_x', 'City', 'State Abbreviation', 'Sector Name', 'MSI Status', 'Income Earned from Working 10 Hours a Week at State\'s Minimum Wage',
                 'Affordability Gap (net price minus income earned working 10 hrs at min wage)', 'Adjusted Monthly Center-Based Child Care Cost', 'Institution Level', 'Institution Size Category_x', 
                 'County Name', 'State Code (FIPS)', 'Latitude', 'Longitude', 'Region #', 'Admissions Website', 'Institution Status']
crit_features.extend(['Number of Bachelor Degrees White Total', 'Number of Bachelor Degrees American Indian or Alaska Native Total', 'Number of Bachelor Degrees Asian Total', 'Number of Bachelor Degrees Black or African American Total', 'Number of Bachelor Degrees Latino Total', 'Number of Bachelor Degrees Native Hawaiian or Other Pacific Islander Total', 
                      'Number of Degrees Awarded in Science, Technology, Engineering, and Math', 'Number of Degrees Awarded in Arts and Humanities',
                      'Total Enrollment', 'Transfer Out Rate', 'Median Earnings of Students Working and Not Enrolled 10 Years After Entry',
                      'Percent of Undergraduates Age 25 and Older'])

combined_filtered = combined[crit_features]
combined_filtered['Average Cost of Attendance'] = (combined['Cost of Attendance: In State'] + combined['Cost of Attendance: Out of State']) / 2


writefile = 'final/processed_table.txt'
open(writefile, 'w').close()

with open(writefile, 'a') as wf:
    feature_table = [['Feature', '25th', 'Median', '75th', 'Mean', 'Std']]

    for col in combined_filtered.columns:
        feature_row = [col]

        cf_feature = combined_filtered[col]
        cf_feature = cf_feature.dropna().reset_index(drop=True)

        if cf_feature.dtype == object: continue

        feature_row.extend([np.percentile(cf_feature, 25), np.percentile(cf_feature, 50), np.percentile(cf_feature, 75),
                           np.mean(cf_feature), np.std(cf_feature)])

        feature_table.append(feature_row)

    
    wf.write(tabulate(feature_table[1:], headers=feature_table[0], tablefmt='fancy_grid'))
    wf.close()


impute_cols = combined_filtered.select_dtypes(exclude=['object']).columns
impute_np = KNNImputer(missing_values=np.nan, n_neighbors=7).fit_transform(combined_filtered[impute_cols])
combined_filtered[impute_cols] = impute_np
combined_filtered['MSI Status'] = combined_filtered['MSI Status'].round(0)

combined_filtered.to_csv('final/combined_filtered.csv', index=False)
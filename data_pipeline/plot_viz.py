import plotly.express as px
import plotly.graph_objects as go
import numpy as np
import pandas as pd

combined = pd.read_csv('final/combined_filtered.csv')

### Plot degrees awarded by race.
subset = combined[['Number of Bachelor Degrees White Total', 'Number of Bachelor Degrees American Indian or Alaska Native Total', 
                  'Number of Bachelor Degrees Asian Total', 'Number of Bachelor Degrees Black or African American Total', 
                  'Number of Bachelor Degrees Latino Total', 'Number of Bachelor Degrees Native Hawaiian or Other Pacific Islander Total']]

traces = []
names = ['White', 'American Indian', 'Asian', 'Black', 'Latino', 'Pacific Islander']
colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']
for color, name, col in zip(colors, names, subset.columns):
    traces.append(go.Histogram(x=subset[col].to_list(), opacity=0.6, name=name, nbinsx=150, marker_color=color))

fig = go.Figure(traces)
fig.update_layout(barmode='overlay',
                  title={'text': 'Degree Distribution per Racial Group', 'y': 0.85, 'x': 0.5},
                  xaxis_title='Number of Bachelor\'s Degrees', yaxis_title='Frequency',)
fig.update_xaxes(range=[0, 5000])
fig.update_yaxes(range=[0, 5000])
fig.write_image('visualizations/degree_race_viz.jpg')


### Scatter 1000 randomly sampled colleges & tuitions.
subset = combined.iloc[np.random.choice(combined.index, size=250, replace=False)]
subset = subset[['Latitude', 'Longitude', 'Average Cost of Attendance', 'MSI Status']]
subset['MSI Status'] = subset['MSI Status'].astype(str)

fig = px.scatter_geo(subset, lat='Latitude', lon='Longitude', size='Average Cost of Attendance', size_max=15, 
                     color='MSI Status', color_discrete_map={'0.0': 'blue', '1.0': 'red'}, scope='usa')

fig.update_layout(title={'text': '250 Colleges by Tuition and MSI Status', 'y': 0.85, 'x': 0.5},
                  geo=dict(showland=True, landcolor="lightgray"),
                  legend=dict(x=0.9, y=0.5, xanchor='left', yanchor='middle'))
fig.write_image('visualizations/tuition_msi_viz.jpg')

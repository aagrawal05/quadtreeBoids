import os
import json
import matplotlib.pyplot as plt
import numpy as np
from scipy.optimize import curve_fit

# Load data from data_quadtree.json using json.load()
with open('data_quadtree.json', 'r') as f:
    data = json.load(f)

points = []

# For each of the population with vision 10, maxDepth 5, maxChildren 4
# Plot the average number of frames in the first epoch against the population
for population in data.keys():
    for vision in data[population].keys():
        for maxDepth in data[population][vision].keys():
            for maxChildren in data[population][vision][maxDepth].keys():
                if vision == '10' and maxDepth == '5' and maxChildren == '5':
                    # Get the average number of frames in the first epoch
                    # of the current population, vision, maxDepth, and maxChildren
                    # configuration
                    epoch = data[population][vision][maxDepth][maxChildren]['0']
                    averageFrames = sum(epoch) / len(epoch)
                    points.append((int(population), averageFrames))
                    # Plot the average number of frames in the first epoch
                    # against the population
                    plt.plot(int(population), averageFrames, 'ro')

# Set the title of the plot
plt.title('Average number of frames vs. population')
# Set the x-axis label of the plot
plt.xlabel('Population')
# Set the y-axis label of the plot
plt.ylabel('Average number of frames')

# Get the x and y values of the points
x = [point[0] for point in points]
y = [point[1] for point in points]

# Sort the x and y values before curve fitting
sorted_indices = np.argsort(x)
x = np.array(x)[sorted_indices]
y = np.array(y)[sorted_indices]

# Fit O(n^2) curve to the points
def func_n_squared(x, a, b):
    return a * x**2 + b

# Fit the curve to the points
popt, pcov = curve_fit(func_n_squared, x, y)

# Calculate the r-squared value
r2 = np.corrcoef(func_n_squared(x, *popt), y)[0, 1] ** 2
print('O(n^2) curve fit: y = {}x^2 + {}, r^2 = {}'.format(popt[0], popt[1], r2))

# Plot the curve
plt.plot(x, func_n_squared(x, *popt), 'g--', label='O(n^2) curve fit')

# Fit O(n log n) curve to the points
def func_n_log_n(x, a, b):
    return a * x * np.log(x) + b

# Fit the curve to the points
popt, pcov = curve_fit(func_n_log_n, x, y)

# Calculate the r-squared value
r2_log = np.corrcoef(func_n_log_n(x, *popt), y)[0, 1] ** 2
print('O(n log n) curve fit: y = {}x log(x) + {}, r^2 = {}'.format(popt[0], popt[1], r2_log))

# Plot the curve
plt.plot(x, func_n_log_n(x, *popt), 'b--', label='O(n log n) curve fit')

# Legend
plt.plot([], [], 'ro', label='Data')
plt.legend(loc='upper left')

# O(n^2) R^2 fit text to 6dp in bottom right
plt.text(0.95, 0.05, 'O(n^2) R^2 = %.6f' % r2, horizontalalignment='right', verticalalignment='bottom', transform=plt.gca().transAxes)

# O(n log n) R^2 fit text to 6dp in bottom right above O(n^2) text
plt.text(0.95, 0.1, 'O(n log n) R^2 = %.6f' % r2_log, horizontalalignment='right', verticalalignment='bottom', transform=plt.gca().transAxes)

# Show the plot
plt.show()


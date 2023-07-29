import json
import os
import matplotlib.pyplot as plt
import numpy as np

end = 800 
with open('checkpoint'+str(end)+'.json') as f:
    data = json.load(f)

naive = []
quadtree = []
for i in range(100, end+100, 100):
    for t in data['true'][str(i)]:
        naive.append(t)
    for t in data['false'][str(i)]['1']:
        quadtree.append(t)

# Scatter plot x = 1,... len(naive), y = naive, y1 = quadtree
x = np.arange(1, len(naive)+1)
plt.scatter(x, naive, label='naive')
plt.scatter(x, quadtree, label='quadtree')
plt.xlabel('Simulation')
plt.ylabel('Time (ms)')
plt.legend()
plt.show()




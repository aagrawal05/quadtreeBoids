import json
import os
import matplotlib.pyplot as plt
import numpy as np

end = 800 
with open('checkpoint'+str(end)+'.json') as f:
    data = json.load(f)

y = []
y1 = []

for i in range(100, end+100, 100):
    y.append(sum(data['true'][str(i)])/len(data['true'][str(i)]))
    y1.append(sum(data['false'][str(i)]['1'])/len(data['false'][str(i)]['1']))

# Fit quadratic curve
x = [i for i in range(100, end+100, 100)]
z = np.polyfit(x, y, 2)
f = np.poly1d(z)

# Fit n log n curve
z1 = np.polyfit(x * np.log(x), y1, 1)
f1 = np.poly1d(z1)

# Get the r^2 value of the fit
r2 = 1 - sum((y - f(x))**2)/sum((y - np.mean(y))**2)
print("R^2 value: ", r2)

# Get the r^2 value of the fit1
or2 = 1 - sum((f1(x * np.log(x)) - y1)**2)/sum((y1 - np.mean(y1))**2)
print("Optimized R^2 value: ", or2)

plt.plot(range(100, end + 100, 100), y, label="Naive average performance")
# plt.plot(x,f(x),"r--", label="O(n^2) fit")

plt.plot(range(100, end + 100, 100), y1, label="Quadratic average performance")
# plt.plot(x,f1(x * np.log(x)),"r--", label="O(n log n) fit")

# plt.text(500, 0.5, "O(n^2) fit: " + str(round(r2, 4)))
# plt.text(500, 0.4, "O(n log n) fit: " + str(round(or2, 4)))

plt.xlabel('Number of boids')
plt.ylabel('Average frametime (ms)')
plt.title('Average performance for different number of boids')

plt.legend()

plt.show()

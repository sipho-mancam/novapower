import numpy as np



a = np.array([1,2,3,4,5,6])
b = np.array([1,2.5,3,4,5,6, 0.2, 0.5])
c = np.zeros((1,24), dtype=np.float64)[0]

c = [1,2,3,4]
d = [5,6,7]

c = c+d

d = {'name':'test'}

b = d.copy()
d['name'] = 't'
print(b)
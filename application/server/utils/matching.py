import numpy as np

def l2_distance(a, b):
    distance = np.sqrt(np.average((a - b) **2))

    return distance

# def cosine_similarity(a, b):
#     dot = np.dot(a, b)
#     norm_a = np.linalg.norm(a)
#     norm_b = np.linalg.norm(b)

#     return dot / (norm_a * norm_b)

# def l2_distance(a, b):
#     distance = 

std = 0.75

def similarities(expectation, actual):
    distances = []
    for a in actual:
        distances.append(l2_distance(a, expectation))
    
    distances = np.stack(distances)
    # distances = (distances - distances.mean()) / (distances.std() + 1e-8)
    distances_normalized = np.exp((-distances ** 2) / (2 * std ** 2))

    return distances_normalized, distances


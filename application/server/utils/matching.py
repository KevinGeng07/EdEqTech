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
<<<<<<< Updated upstream
    sim = []
    for id, a in enumerate(actual):
        sim.append([cosine_similarity(expectation, a), id])

    return sorted(sim, key=lambda x: x[0])

expectation = np.array([[10, 2], [3, 3], [4, 1], [5, 0]])
actual = [
    np.array([1, 2, 3, 4]),
    np.array([2, 3, 4 ,5]),
    np.array([3, 4, 5, 6]),
    np.array([10, 3, 4, 5])
]

print(similarities(expectation, actual))
=======
    distances = []
    for a in actual:
        distances.append(l2_distance(a, expectation))
    
    distances = np.stack(distances)
    # distances = (distances - distances.mean()) / (distances.std() + 1e-8)
    distances_normalized = np.exp((-distances ** 2) / (2 * std ** 2))

    return distances_normalized, distances
    # sim = []
    # for a in actual:
    #     sim.append(cosine_similarity(expectation, a))

    # return sim
>>>>>>> Stashed changes

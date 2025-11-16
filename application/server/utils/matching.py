import numpy as np

def cosine_similarity(a, b):
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    return dot / (norm_a * norm_b)

def similarities(expectation, actual):
    sim = []
    for a in actual:
        sim.append(cosine_similarity(expectation, a))

    return sorted(sim)

expectation = np.array([10, 3, 4, 5])
actual = [
    np.array([1, 2, 3, 4]),
    np.array([2, 3, 4 ,5]),
    np.array([3, 4, 5, 6]),
    np.array([10, 3, 4, 5])
]

print(similarities(expectation, actual))

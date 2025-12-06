from recommendation_system import recommend

# 1) Family + budget example
q1 = "Family friendly 5 seater car under 12 lakhs with petrol engine"
print("Query 1:", q1)
for item in recommend(q1, top_k=5):
    print(item)

print("\n" + "="*50 + "\n")

# 2) Performance cars
q2 = "Looking for a sporty performance car under 25 lakhs"
print("Query 2:", q2)
for item in recommend(q2, top_k=5):
    print(item)

print("\n" + "="*50 + "\n")

# 3) Collector / rare
q3 = "Show me rare collector cars"
print("Query 3:", q3)
for item in recommend(q3, top_k=5):
    print(item)

print("\n" + "="*50 + "\n")

# 4) EV with long range
q4 = "Electric SUV with long range"
print("Query 4:", q4)
for item in recommend(q4, top_k=5):
    print(item)

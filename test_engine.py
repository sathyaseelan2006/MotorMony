from score_engine import compute_scores

results = compute_scores(["family", "budget"], budget=12, min_seats=5)

print(results[["name", "final_score", "price_min_lakh", "seats"]].head(10))

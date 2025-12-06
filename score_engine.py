import pandas as pd

# Load normalized dataset
df = pd.read_csv("cars_dataset_normalized.csv")

# -------- INTENT WEIGHT PROFILES (Updated for new dataset) -------------

INTENT_WEIGHTS = {
    "family": {
        "safety_rating_norm": 0.30,
        "mileage_kmpl_norm": 0.25,
        "price_min_lakh_norm": -0.20,
        "resale_value_5yr_norm": 0.15,
        "power_bhp_norm": 0.10
    },
    "performance": {
        "power_bhp_norm": 0.50,
        "safety_rating_norm": 0.20,
        "price_min_lakh_norm": -0.20,
        "resale_value_5yr_norm": 0.10
    },
    "budget": {
        "price_min_lakh_norm": -0.45,
        "mileage_kmpl_norm": 0.30,
        "resale_value_5yr_norm": 0.15,
        "safety_rating_norm": 0.10
    },
    "collector": {
        "resale_value_5yr_norm": 0.40,
        "safety_rating_norm": 0.20,
        "power_bhp_norm": 0.20,
        "price_min_lakh_norm": -0.20
    },
    "ev": {
        "mileage_kmpl_norm": 0.35,
        "safety_rating_norm": 0.30,
        "price_min_lakh_norm": -0.20,
        "resale_value_5yr_norm": 0.15
    },
    "resale": {
        "resale_value_5yr_norm": 0.45,
        "safety_rating_norm": 0.25,
        "mileage_kmpl_norm": 0.20,
        "price_min_lakh_norm": -0.10
    },
    "general": {
        "price_min_lakh_norm": -0.25,
        "mileage_kmpl_norm": 0.25,
        "safety_rating_norm": 0.25,
        "resale_value_5yr_norm": 0.25
    }
}

# --------- COMBINE WEIGHTS FROM MULTIPLE INTENTS ------------

def merge_intent_weights(intent_list):
    combined = {}
    for intent in intent_list:
        w = INTENT_WEIGHTS.get(intent, {})
        for key, val in w.items():
            combined[key] = combined.get(key, 0) + val

    # Normalize weight sum to 1
    total = sum(abs(v) for v in combined.values())
    for k in combined:
        combined[k] /= total

    return combined

# -------------- COMPUTE SCORES FOR ALL CARS ----------------

def compute_scores(intent_list, budget=None, min_seats=None):
    weights = merge_intent_weights(intent_list)
    df_filtered = df.copy()

    if budget:
        df_filtered = df_filtered[df_filtered["price_min_lakh"] <= budget]

    if min_seats:
        df_filtered = df_filtered[df_filtered["seats"] >= min_seats]

    scores = []
    for _, row in df_filtered.iterrows():
        score = 0
        for feat, w in weights.items():
            if feat in row:
                score += row[feat] * w
        scores.append(score)

    df_filtered["final_score"] = scores
    return df_filtered.sort_values("final_score", ascending=False)


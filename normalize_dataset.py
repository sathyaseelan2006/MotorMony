import pandas as pd

# Load dataset
df = pd.read_csv("E:\\carrecommendationsystem\\car_dataset.csv")

# Columns to normalize
normalize_cols = [
    "engine_cc", "power_bhp", "torque_nm", "mileage_kmpl",
    "top_speed_kmph", "acceleration_0_100", "boot_space_l",
    "ground_clearance_mm", "maintenance_cost_year",
    "service_interval_km", "resale_value_5yr", "price_min_lakh",
    "price_max_lakh", "production_units", "market_popularity_score",
    "collector_interest_score", "ev_range_km", "fast_charge_time_min",
    "auction_price_avg", "rarity_index", "demand_index",
    "appreciation_rate", "heritage_score"
]

df_normalized = df.copy()

for col in normalize_cols:
    if col == "acceleration_0_100":
        # Lower is better → invert scale
        min_val = df[col].min()
        max_val = df[col].max()
        df_normalized[col + "_norm"] = 1 - (df[col] - min_val) / (max_val - min_val)
    else:
        min_val = df[col].min()
        max_val = df[col].max()
        df_normalized[col + "_norm"] = (df[col] - min_val) / (max_val - min_val)

# Save new file
df_normalized.to_csv("cars_dataset_normalized.csv", index=False)

print("Normalization complete! File saved as cars_dataset_normalized.csv")

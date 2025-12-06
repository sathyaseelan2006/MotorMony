import pandas as pd
import numpy as np

print("Loading car_prices.csv...")
df = pd.read_csv("car_prices.csv")

print(f"Original dataset: {len(df)} rows, {len(df.columns)} columns")
print("\nColumns:", df.columns.tolist())

# Clean and prepare the data
print("\n1. Cleaning data...")

# Remove rows with missing critical values
df = df.dropna(subset=['make', 'model', 'sellingprice', 'year'])

# Remove outliers (very cheap or very expensive cars)
df = df[(df['sellingprice'] > 1000) & (df['sellingprice'] < 200000)]

# Filter for recent years (2010-2015 range, as dataset doesn't have newer cars)
df = df[df['year'] >= 2010]

# Convert price to lakhs (1 USD ≈ 83 INR, 1 Lakh = 100,000 INR)
USD_TO_INR = 83
df['price_min_lakh'] = (df['sellingprice'] * USD_TO_INR) / 100000

# Create a combined name
df['name'] = df['make'] + ' ' + df['model']
df['brand'] = df['make']

# Estimate seats based on body type
def estimate_seats(body):
    body_str = str(body).lower()
    if 'suv' in body_str or 'van' in body_str:
        return 7
    elif 'sedan' in body_str or 'coupe' in body_str or 'hatchback' in body_str:
        return 5
    elif 'truck' in body_str:
        return 2
    else:
        return 5  # default

df['seats'] = df['body'].apply(estimate_seats)

# Estimate mileage based on year and type (rough estimates)
def estimate_mileage(year, body):
    body_str = str(body).lower()
    base_mileage = 20  # base km/l
    
    # Newer cars are more efficient
    year_bonus = (year - 2010) * 0.5
    
    # Adjust by body type
    if 'suv' in body_str or 'truck' in body_str:
        type_adjustment = -5
    elif 'sedan' in body_str:
        type_adjustment = 2
    elif 'hatchback' in body_str:
        type_adjustment = 5
    else:
        type_adjustment = 0
    
    return max(10, base_mileage + year_bonus + type_adjustment)

df['mileage_kmpl'] = df.apply(lambda x: estimate_mileage(x['year'], x['body']), axis=1)

# Estimate power based on price and body type
def estimate_power(price, body):
    body_str = str(body).lower()
    base_power = 80  # base BHP
    
    # Higher price usually means more power
    price_factor = (price / 10000) * 10
    
    # Adjust by body type
    if 'suv' in body_str or 'truck' in body_str:
        type_adjustment = 50
    elif 'sedan' in body_str:
        type_adjustment = 20
    elif 'coupe' in body_str:
        type_adjustment = 40
    else:
        type_adjustment = 0
    
    return min(500, base_power + price_factor + type_adjustment)

df['power_bhp'] = df.apply(lambda x: estimate_power(x['sellingprice'], x['body']), axis=1)

# Estimate safety rating based on year and condition
def estimate_safety(year, condition):
    base_rating = 3.0
    
    # Newer cars have better safety
    if year >= 2020:
        year_bonus = 1.5
    elif year >= 2015:
        year_bonus = 1.0
    elif year >= 2012:
        year_bonus = 0.5
    else:
        year_bonus = 0
    
    # Condition affects perceived safety
    condition_str = str(condition).lower()
    if 'excellent' in condition_str or '5.0' in condition_str or '4.9' in condition_str:
        condition_bonus = 0.5
    else:
        condition_bonus = 0
    
    return min(5.0, base_rating + year_bonus + condition_bonus)

df['safety_rating'] = df.apply(lambda x: estimate_safety(x['year'], x['condition']), axis=1)

# Create fuel_type based on make and model
def estimate_fuel_type(make, model, year):
    make_str = str(make).lower()
    model_str = str(model).lower()
    
    # Tesla and electric vehicles
    if 'tesla' in make_str or 'electric' in model_str or 'ev' in model_str:
        return 'EV'
    # Hybrid indicators
    elif 'hybrid' in model_str or 'prius' in model_str:
        return 'Hybrid'
    # Most modern cars
    elif year >= 2020:
        return 'Petrol'
    else:
        return 'Petrol'

df['fuel_type'] = df.apply(lambda x: estimate_fuel_type(x['make'], x['model'], x['year']), axis=1)

# Map body types
def normalize_body_type(body):
    body_str = str(body).lower()
    if 'suv' in body_str:
        return 'SUV'
    elif 'sedan' in body_str:
        return 'Sedan'
    elif 'coupe' in body_str:
        return 'Coupe'
    elif 'hatchback' in body_str:
        return 'Hatchback'
    elif 'van' in body_str or 'minivan' in body_str:
        return 'MPV'
    elif 'truck' in body_str or 'pickup' in body_str:
        return 'Truck'
    elif 'wagon' in body_str:
        return 'Wagon'
    else:
        return 'Sedan'

df['body_type'] = df['body'].apply(normalize_body_type)

# Add resale value estimate (based on condition and year)
def estimate_resale(year, condition, price):
    age = 2025 - year
    depreciation = age * 0.08  # 8% per year
    
    condition_str = str(condition).lower()
    if 'excellent' in condition_str or '5.0' in condition_str:
        condition_factor = 1.0
    elif '4' in condition_str:
        condition_factor = 0.9
    else:
        condition_factor = 0.8
    
    resale_pct = max(30, (1 - depreciation) * 100 * condition_factor)
    return min(95, resale_pct)

df['resale_value_5yr'] = df.apply(lambda x: estimate_resale(x['year'], x['condition'], x['sellingprice']), axis=1)

# Select and aggregate data (take average for duplicate car models)
print("\n2. Aggregating data by make and model...")

# Group by name and take representative values
agg_dict = {
    'brand': 'first',
    'price_min_lakh': 'mean',
    'seats': 'first',
    'mileage_kmpl': 'mean',
    'power_bhp': 'mean',
    'safety_rating': 'mean',
    'fuel_type': 'first',
    'body_type': 'first',
    'resale_value_5yr': 'mean',
    'year': 'max'  # Take the newest year
}

df_grouped = df.groupby('name').agg(agg_dict).reset_index()

print(f"Aggregated to {len(df_grouped)} unique cars")

# Normalize columns for scoring (0-1 scale)
print("\n3. Normalizing features...")

from sklearn.preprocessing import MinMaxScaler

features_to_normalize = [
    'price_min_lakh', 'mileage_kmpl', 'power_bhp', 
    'safety_rating', 'resale_value_5yr'
]

scaler = MinMaxScaler()
for feature in features_to_normalize:
    if feature in df_grouped.columns:
        df_grouped[f'{feature}_norm'] = scaler.fit_transform(df_grouped[[feature]])

# Round numerical values
df_grouped['price_min_lakh'] = df_grouped['price_min_lakh'].round(2)
df_grouped['mileage_kmpl'] = df_grouped['mileage_kmpl'].round(1)
df_grouped['power_bhp'] = df_grouped['power_bhp'].round(0)
df_grouped['safety_rating'] = df_grouped['safety_rating'].round(1)
df_grouped['resale_value_5yr'] = df_grouped['resale_value_5yr'].round(1)

# Save the normalized dataset
output_file = "cars_dataset_normalized.csv"
df_grouped.to_csv(output_file, index=False)

print(f"\n✅ Success! Saved {len(df_grouped)} cars to {output_file}")
print("\nSample of processed data:")
print(df_grouped[['name', 'brand', 'price_min_lakh', 'seats', 'mileage_kmpl', 'power_bhp', 'safety_rating']].head(10))
print("\nColumns in output:", df_grouped.columns.tolist())

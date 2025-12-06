from intent_parser import parse_query
from score_engine import compute_scores

def generate_carpilot_suggestion(top_car, query_text, intents, params):
    """
    Generate intelligent CarPilot suggestion with detailed reasoning.
    """
    car = top_car
    reasons = []
    
    # Analyze why this car is the best match
    if "family" in intents:
        reasons.append(f"✅ **Perfect for Families**: With {int(car['seats'])} comfortable seats and a {car.get('safety_rating', 'good')} star safety rating, this car prioritizes your family's wellbeing")
        if car.get('mileage_kmpl'):
            reasons.append(f"💰 **Cost-Efficient**: {car['mileage_kmpl']} km/l mileage keeps running costs low for daily school runs and weekend trips")
    
    if "performance" in intents:
        if car.get('power_bhp'):
            reasons.append(f"🏎️ **Powerful Performance**: {int(car['power_bhp'])} BHP delivers thrilling acceleration and highway confidence")
        reasons.append(f"⚡ **Dynamic Driving**: Built for enthusiasts who demand responsive handling and spirited performance")
    
    if "budget" in intents:
        reasons.append(f"💵 **Budget Champion**: At just ₹{car['price_min_lakh']}L, this offers exceptional value without compromising quality")
        if car.get('mileage_kmpl'):
            reasons.append(f"📊 **Low Running Costs**: {car['mileage_kmpl']} km/l efficiency means more money stays in your pocket")
        if car.get('resale_value_5yr'):
            reasons.append(f"📈 **Strong Resale**: Retains approximately {int(car.get('resale_value_5yr', 0))}% value after 5 years")
    
    if "ev" in intents or car.get('fuel_type', '').lower() == 'electric':
        reasons.append(f"🌱 **Eco-Friendly Choice**: Zero emissions driving helps protect the environment")
        reasons.append(f"⚡ **Future-Ready**: Electric powertrain means lower maintenance and no fuel expenses")
    
    if "luxury" in intents or car['price_min_lakh'] > 50:
        reasons.append(f"👑 **Premium Experience**: {car['brand']} craftsmanship delivers refined comfort and cutting-edge technology")
        if car.get('safety_rating'):
            reasons.append(f"🛡️ **Top-Tier Safety**: {car['safety_rating']} star rating with advanced driver assistance systems")
    
    # Add budget context if specified
    if params.get('budget'):
        reasons.append(f"✓ **Within Budget**: Fits comfortably under your ₹{params['budget']}L budget")
    
    # Add general strengths
    if car.get('safety_rating') and car['safety_rating'] >= 4 and "family" not in intents:
        reasons.append(f"🛡️ **Safety First**: {car['safety_rating']} star safety rating for peace of mind")
    
    if car.get('resale_value_5yr') and car['resale_value_5yr'] >= 60 and "budget" not in intents:
        reasons.append(f"💎 **Smart Investment**: Strong {int(car['resale_value_5yr'])}% resale value retention")
    
    # Generate recommendation summary
    intent_text = ", ".join(intents).title()
    summary = f"Based on your search for '{query_text}', our AI identified {intent_text} priorities. The **{car['name']}** scored {car['final_score']:.3f} - our highest match for your needs."
    
    return {
        "car_name": car['name'],
        "brand": car['brand'],
        "score": float(car['final_score']),
        "summary": summary,
        "reasons": reasons,
        "key_specs": {
            "price": f"₹{car['price_min_lakh']}L",
            "seats": int(car['seats']),
            "power": f"{int(car['power_bhp'])} BHP" if car.get('power_bhp') else "N/A",
            "mileage": f"{car['mileage_kmpl']} km/l" if car.get('mileage_kmpl') else "N/A",
            "safety": f"{car['safety_rating']} ⭐" if car.get('safety_rating') else "N/A"
        }
    }

def recommend(query_text, top_k=5):
    """
    Input: free‑form text query from user.
    Output: list of top_k cars with final_score and reasons + CarPilot suggestion.
    """
    # 1) Parse the user text into structured params
    params = parse_query(query_text)
    intents = params.get("intents", ["general"])
    budget = params.get("budget")          # in lakhs, or None
    min_seats = params.get("min_seats")    # or None
    fuel_type = params.get("fuel_type")    # currently unused, but ready for future filters
    body_type = params.get("body_type")    # currently unused, but ready for future filters

    # 2) Compute ranking scores
    results = compute_scores(intents, budget=budget, min_seats=min_seats)

    # 3) Optionally filter by fuel_type or body_type if provided
    if fuel_type:
        # e.g., filter EV only if intent includes ev, or if user explicitly says petrol/diesel
        # only keep rows where fuel_type matches; our dataset column is 'fuel_type' not normalized
        results = results[results["fuel_type"].str.lower() == fuel_type.lower()]

    if body_type:
        results = results[results["body_type"].str.lower() == body_type.lower()]

    # 4) Select top_k results
    top_results = results.head(top_k)

    # 5) Prepare a tidy list for return or display
    output = []
    carpilot_suggestion = None
    
    for idx, (_, row) in enumerate(top_results.iterrows()):
        # Build a quick reason summary
        reason_parts = [
            f"Intent: {', '.join(intents)}",
            f"Score: {row['final_score']:.3f}",
            f"Price (min): ₹{row['price_min_lakh']}L",
            f"Seats: {row['seats']}"
        ]
        # If budget or seats were specified, echo that
        if budget is not None:
            reason_parts.append(f"Budget ≤ ₹{budget}L")
        if min_seats is not None:
            reason_parts.append(f"Seats ≥ {min_seats}")

        car_data = {
            "name": row["name"],
            "brand": row["brand"],
            "final_score": float(row["final_score"]),
            "price_min_lakh": float(row["price_min_lakh"]),
            "seats": int(row["seats"]),
            "power_bhp": float(row.get("power_bhp", 0)) if row.get("power_bhp") else None,
            "mileage_kmpl": float(row.get("mileage_kmpl", 0)) if row.get("mileage_kmpl") else None,
            "safety_rating": float(row.get("safety_rating", 0)) if row.get("safety_rating") else None,
            "fuel_type": str(row.get("fuel_type", "N/A")),
            "body_type": str(row.get("body_type", "N/A")),
            "resale_value_5yr": float(row.get("resale_value_5yr", 0)) if row.get("resale_value_5yr") else None,
            "year": int(row.get("year", 0)) if row.get("year") else None,
            "reason": "; ".join(reason_parts)
        }
        
        output.append(car_data)
        
        # Generate CarPilot suggestion for top car
        if idx == 0:
            carpilot_suggestion = generate_carpilot_suggestion(car_data, query_text, intents, params)

    return {
        "results": output,
        "carpilot_suggestion": carpilot_suggestion
    }

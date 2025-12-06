import re

# ------------------- KEYWORD DEFINITIONS -------------------

FAMILY_WORDS = [
    "family", "safe", "kids", "children", "comfortable", "7 seater", "5 seater"
]

BUDGET_WORDS = [
    "budget", "cheap", "affordable", "low cost", "value", "under"
]

PERFORMANCE_WORDS = [
    "sporty", "performance", "fast", "bhp", "torque", "acceleration"
]

COLLECTOR_WORDS = [
    "rare", "collector", "vintage", "classic", "limited", "special edition"
]

EV_WORDS = [
    "ev", "electric", "battery", "zero emission", "range"
]

RESALE_WORDS = [
    "resale", "value hold", "good resale"
]

FUEL_WORDS = {
    "petrol": ["petrol", "gasoline"],
    "diesel": ["diesel"],
    "ev": ["ev", "electric"],
    "hybrid": ["hybrid"]
}

BODY_TYPE_WORDS = {
    "suv": ["suv"],
    "sedan": ["sedan"],
    "hatchback": ["hatchback"],
    "mpv": ["mpv", "minivan"]
}

# ------------------- PARSING FUNCTIONS -------------------

def detect_intents(text):
    text = text.lower()
    intents = []

    if any(word in text for word in FAMILY_WORDS):
        intents.append("family")

    if any(word in text for word in BUDGET_WORDS):
        intents.append("budget")

    if any(word in text for word in PERFORMANCE_WORDS):
        intents.append("performance")

    if any(word in text for word in COLLECTOR_WORDS):
        intents.append("collector")

    if any(word in text for word in EV_WORDS):
        intents.append("ev")

    if any(word in text for word in RESALE_WORDS):
        intents.append("resale")

    if len(intents) == 0:
        intents.append("general")

    return intents


def extract_budget(text):
    text = text.lower()

    # Match: "under 10 lakh", "below 12 lakhs", "15 L", etc.
    match = re.search(r"(\d+)\s*(lakh|lakhs|l|la)", text)
    if match:
        return float(match.group(1))

    # Match rupees directly: "under 500000"
    match2 = re.search(r"(\d{5,7})", text)
    if match2:
        amount = float(match2.group(1)) / 100000.0
        return amount

    return None


def extract_seats(text):
    match = re.search(r"(\d+)\s*(seater|seaters|people|persons)", text.lower())
    if match:
        return int(match.group(1))
    return None


def extract_fuel(text):
    text = text.lower()
    for fuel, keywords in FUEL_WORDS.items():
        if any(word in text for word in keywords):
            return fuel
    return None


def extract_body_type(text):
    text = text.lower()
    for body, keywords in BODY_TYPE_WORDS.items():
        if any(word in text for word in keywords):
            return body
    return None


# ------------------- MAIN PARSER -------------------

def parse_query(text):
    intents = detect_intents(text)
    budget = extract_budget(text)
    min_seats = extract_seats(text)
    fuel_type = extract_fuel(text)
    body_type = extract_body_type(text)

    return {
        "intents": intents,
        "budget": budget,
        "min_seats": min_seats,
        "fuel_type": fuel_type,
        "body_type": body_type
    }


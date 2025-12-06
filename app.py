from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from recommendation_system import recommend
import os

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for all routes

@app.route("/recommend", methods=["POST"])
def recommend_api():
    data = request.get_json()

    if "query" not in data:
        return jsonify({"error": "Missing 'query' field"}), 400

    query_text = data["query"]
    top_k = data.get("top_k", 100)  # Default to 100 cars to show more results

    try:
        recommendation_data = recommend(query_text, top_k=top_k)
        return jsonify({
            "query": query_text,
            "results": recommendation_data.get("results", []),
            "carpilot_suggestion": recommendation_data.get("carpilot_suggestion"),
            "total_available": len(recommendation_data.get("results", []))
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def home():
    return send_from_directory('.', 'index.html')


@app.route("/static/<path:path>")
def send_static(path):
    return send_from_directory('static', path)


# Vercel serverless function entry point
app = app

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)

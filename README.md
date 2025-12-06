# 🚗 MotorMony - AI Car Recommendation System

A commercial-grade AI-powered car recommendation system that helps users find their perfect vehicle using natural language queries. Experience intelligent recommendations with CarPilot AI, premium UI/UX, and transparent scoring.

![MotorMony](https://img.shields.io/badge/Status-Production%20Ready-success)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0+-green)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sathyaseelan2006/MotorMony)

## 🌐 Live Demo
🔗 **[Visit MotorMony Live](https://your-app.vercel.app)**

## ✨ Features

### 🎯 Smart Recommendations
- **AI-Powered Search**: Natural language processing understands queries like "family car under 20 lakhs"
- **Intent Detection**: Automatically identifies user intent (family, performance, budget, EV, luxury)
- **Multi-Factor Scoring**: Analyzes price, power, mileage, safety, and resale value

### 🏆 CarPilot AI Suggestion
- Intelligent top pick with detailed reasoning
- Intent-based recommendations
- Transparent scoring breakdown

### 🔍 Advanced Features
- **Year Filtering**: Filter cars by year (2010-2015)
- **Smart Sorting**: Sort by score, price, mileage, power, safety, or year
- **Comparison Panel**: Compare up to 4 cars side-by-side
- **Pagination**: Load more results (20 cars per page)
- **Score Explanation**: Transparent scoring with detailed breakdowns

### 🎨 Premium UI/UX
- Modern glassmorphism design with purple gradient theme
- Animated timeline for "How It Works" section
- Responsive mobile-first design
- Smooth animations and micro-interactions
- 526+ cars across 40+ brands

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd e:\carrecommendationsystem
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open in browser**
   ```
   http://127.0.0.1:5000
   ```

## 📖 Usage

### Search for Cars

Simply describe what you're looking for in natural language:

- "Family friendly 5 seater car under 12 lakhs with petrol engine"
- "Budget car with good mileage under 8 lakhs"
- "Performance SUV with high power"
- "Electric vehicle with good range"

### Features

- **Quick Search Buttons**: Pre-filled example queries for quick testing
- **Sorting Options**: Sort results by best match, price, or name
- **Visual Comparison**: Interactive charts showing score and price comparisons
- **Detailed Cards**: Each car shows rank, score, price, seats, and recommendation reasons

## 🏗️ Project Structure

```
carrecommendationsystem/
├── app.py                          # Flask backend
├── index.html                      # Main HTML interface
├── static/
│   ├── css/
│   │   └── style.css              # Design system & styles
│   └── js/
│       └── app.js                 # Frontend logic
├── recommendation_system.py        # Core recommendation engine
├── intent_parser.py               # Query parsing
├── score_engine.py                # Scoring algorithm
├── car_dataset.csv                # Car database
├── cars_dataset_normalized.csv    # Normalized data
└── requirements.txt               # Python dependencies
```

## 🛠️ Technology Stack

### Backend
- **Flask**: Web framework
- **Pandas**: Data processing
- **Python**: Core logic

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables
- **JavaScript**: Vanilla JS for interactivity
- **Chart.js**: Data visualization

## 🎨 Design System

- **Colors**: Dark theme with vibrant accents (Indigo, Purple, Pink)
- **Typography**: Google Fonts (Inter, Outfit)
- **Effects**: Glassmorphism, animations, hover effects
- **Layout**: Responsive grid system

## 📊 How It Works

1. **Query Parsing**: User input is analyzed for intents (family, budget, performance, etc.)
2. **Intent Detection**: Keywords are matched to predefined categories
3. **Scoring**: Cars are scored based on multiple weighted factors
4. **Filtering**: Results are filtered by budget, seats, fuel type, etc.
5. **Ranking**: Top matches are returned sorted by score

## 🔧 Configuration

### Backend Settings

Edit `app.py` to change:
- **Port**: Default is 5000
- **Host**: Default is 0.0.0.0 (all interfaces)
- **Debug Mode**: Enabled by default

### Frontend Settings

Edit `static/js/app.js` to change:
- **API URL**: Default is http://127.0.0.1:5000
- **Results Count**: Default is 10 cars
- **Chart Colors**: Customize in renderCharts()

## 📝 API Endpoints

### POST /recommend
Get car recommendations based on query

**Request:**
```json
{
  "query": "Family car under 10 lakhs",
  "top_k": 5
}
```

**Response:**
```json
{
  "query": "Family car under 10 lakhs",
  "results": [
    {
      "name": "Maruti Swift",
      "brand": "Maruti",
      "final_score": 0.856,
      "price_min_lakh": 6.2,
      "seats": 5,
      "reason": "Intent: family; Score: 0.856; ..."
    }
  ]
}
```

## 🌐 Deployment

The application is ready for deployment to:
- **Heroku**: Add Procfile
- **AWS**: Use Elastic Beanstalk
- **DigitalOcean**: Deploy on App Platform
- **Vercel/Netlify**: For static frontend with API backend

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Add car images
- Implement user accounts
- Add comparison feature
- Create mobile app
- Add more data sources

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

Built with ❤️ using Flask, Python, and modern web technologies.

---

**Happy Car Hunting! 🚗✨**

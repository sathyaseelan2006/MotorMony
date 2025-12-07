import sys
import os

# Add parent directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Import Flask app
from app import app as application

# Vercel serverless function handler
def handler(event, context):
    return application(event, context)

# Also export app directly for compatibility
app = application

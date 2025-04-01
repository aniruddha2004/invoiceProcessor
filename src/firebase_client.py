from firebase_admin import credentials, firestore
import firebase_admin
from dotenv import load_dotenv
import os
import json

load_dotenv()

# Retrieve the Firebase credentials JSON string from the environment variable
firebase_credentials_json = os.getenv("FIREBASE_CREDENTIALS")
if firebase_credentials_json is None:
    raise ValueError("FIREBASE_CREDENTIALS not set in .env file")

# Convert the JSON string into a Python dictionary
firebase_credentials_dict = json.loads(firebase_credentials_json)

# Initialize Firebase only if it hasn't been initialized already
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_credentials_dict)
    firebase_admin.initialize_app(cred)

# Create the Firestore client
db = firestore.client()


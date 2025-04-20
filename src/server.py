from flask import Flask, request, jsonify, render_template
import os
import uuid
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from chain import process_image
from firebase_client import db
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join("src", "static", "images")
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    # Renders a simple HTML page with a file upload form
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        # Generate a unique filename using uuid and preserve the file extension
        ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(filepath)
        
        # Process the uploaded image using your chain
        result = process_image(filepath)
        
        # Store the result as a string in Firestore
        doc_data = {
            'imageName': unique_filename,
            'result': result,  # This is already a string
            'timestamp': datetime.utcnow().isoformat()
        }
        db.collection('invoices').document(unique_filename).set(doc_data)
        
        return jsonify({'result': result, 'imageName': unique_filename})
    else:
        return jsonify({'error': 'Invalid file type'}), 400
    
@app.route('/invoices')
def get_invoices():
    # Fetch all invoices from Firestore
    invoices_ref = db.collection('invoices')
    docs = invoices_ref.stream()
    invoices = []
    for doc in docs:
        data = doc.to_dict()
        # Ensure result is a string
        if isinstance(data.get('result'), dict):
            data['result'] = json.dumps(data['result'])
        invoices.append(data)
    
    # Sort invoices by timestamp in descending order (most recent first)
    invoices.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    
    # Render the invoices.html template and pass the invoices list
    return render_template('invoices.html', invoices=invoices)

if __name__ == '__main__':
    app.run(debug=True, port=34568)

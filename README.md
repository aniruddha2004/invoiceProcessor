# Invoice Parser

## Overview
This project includes a Python application that parses the contents of a invoice, processes it and displays it's contents in CSV format.


## Contents

1. [Project Files](#project-files)
2. [Setup Instructions](#setup-instructions)
3. [Environment Variables](#environment-variables)
4. [Running the Application](#running-the-application)

---

## Project Files

- **`src/`**: Contains source code and static files.
  - **`static/`**: Holds static files like CSS and JavaScript.
  - **`templates/`**: Stores HTML templates.
  - **`chain.py`**, **`extractor.py`**, **`firebase_client.py`**, **`server.py`**: Core Python scripts.
  - **`uploads/`**: Directory for storing uploaded files.
- **`.env`**: File holding environment variables (see below).
- **`.gitignore`**: Git configuration to exclude files from version control.

---

## Setup Instructions

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Create and Activate a Virtual Environment** 
   ```bash
   python -m venv .venv
   source .venv/bin/activate   # On macOS/Linux
   # For Windows:
   # .venv\Scripts\activate
   ```

3. **Install Required Dependencies** 
   ```bash
   pip install -r requirements.txt
   ```

4. **Create a .env File and Set Environment Variables** 
   ```bash
   GROQ_API_KEY="YOUR_GROQ_API_KEY"
   FIREBASE_CREDENTIALS="YOUR_FIREBASE_CREDENTIALS"
   SYSTEM_PROMPT="You will be given the data that has been extracted from the image of an invoice. The data is in full unstructured format, you need to parse the data, extract all the item details like SL No, HSN code, item description and each and every other column, dont miss out on any columns and also each row should have an equal number of columns, that uniform number of columns. And if in a row there are no elements, that is every column is empty, dont include that row and also dont repeat any column. And along with these for individual items, also give the total for the entire data in the end, and if any column there is no data, leave that column empty. The response should only contain the mentioned items in csv format, not even a single extra text should be present."
   ```

5. **Start the Application** 
   ```bash
   python src/server.py
   ```



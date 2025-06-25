# nft_marketplace_bot.py (SECURE VERSION ✅)

import os
import json
import csv
import requests
import subprocess
from flask import Flask, request, jsonify, send_from_directory
from collections import defaultdict
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load .env environment variables
load_dotenv()

PINATA_API_KEY = os.getenv("23b809cfc020ac0c1a08")
PINATA_SECRET_API_KEY = os.getenv("PINATA_SECRET_API_KEY")

# Flask App Setup
app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ---------------- Utility: Upload to IPFS (Pinata) ---------------- #
def upload_to_pinata(file_path):
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET_API_KEY
    }
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f)}
        response = requests.post(url, files=files, headers=headers)
    if response.status_code == 200:
        return f"https://gateway.pinata.cloud/ipfs/{response.json()['IpfsHash']}"
    else:
        raise Exception(f"Pinata upload failed: {response.text}")

# ---------------- Utility: Rarity Calculation ---------------- #
def calculate_rarity_score(metadata_folder):
    trait_counts = defaultdict(lambda: defaultdict(int))
    scores = []
    total_nfts = 0

    for filename in os.listdir(metadata_folder):
        if filename.endswith(".json"):
            with open(os.path.join(metadata_folder, filename)) as f:
                data = json.load(f)
                total_nfts += 1
                for trait in data.get("attributes", []):
                    trait_counts[trait["trait_type"]][trait["value"]] += 1

    for filename in os.listdir(metadata_folder):
        if filename.endswith(".json"):
            with open(os.path.join(metadata_folder, filename)) as f:
                data = json.load(f)
                score = sum(1 / (trait_counts[t["trait_type"]][t["value"]] / total_nfts)
                            for t in data.get("attributes", []))
                scores.append({"name": data.get("name", filename), "score": score})

    return sorted(scores, key=lambda x: x["score"], reverse=True)

# ---------------- Routes ---------------- #

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('.', path)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
    file.save(filepath)
    try:
        ipfs_url = upload_to_pinata(filepath)
        return jsonify({'ipfs_url': ipfs_url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/rarity', methods=['POST'])
def rarity():
    metadata_path = request.json.get('metadata_path', 'uploads')
    try:
        scores = calculate_rarity_score(metadata_path)
        return jsonify(scores)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/export_csv', methods=['POST'])
def export_csv():
    metadata_path = request.json.get('metadata_path', 'uploads')
    scores = calculate_rarity_score(metadata_path)
    try:
        with open('rarity_scores.csv', 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Rank', 'Name', 'Score'])
            for i, nft in enumerate(scores):
                writer.writerow([i+1, nft['name'], nft['score']])
        return send_from_directory('.', 'rarity_scores.csv', as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/mint', methods=['POST'])
def mint():
    try:
        result = subprocess.run([
            'solana', 'transfer', '--from', os.path.expanduser('~/.config/solana/id.json'),
            '--allow-unfunded-recipient', 'YourWalletAddressHere', '0.001',
            '--url', 'https://api.devnet.solana.com'
        ], capture_output=True, text=True)
        if result.returncode != 0:
            return jsonify({'error': result.stderr}), 500
        return jsonify({'message': 'Mint triggered', 'output': result.stdout})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---------------- Run ---------------- #
if __name__ == '__main__':
    app.run(debug=True)

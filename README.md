🪙 Solana NFT Marketplace Bot
A professional, full-featured Solana NFT minting bot with IPFS upload and rarity analysis capabilities. Built with Flask, Vanilla JavaScript, Phantom Wallet integration, and a clean, responsive UI.
---
🚀 Features

Phantom Wallet Integration: Connect and display wallet details seamlessly.
IPFS Upload: Upload NFT assets to IPFS via Pinata through a secure backend.
Rarity Analysis: Calculate and display NFT rarity scores based on metadata attributes.
CSV Export: Export rarity scores to a downloadable CSV file.
One-Click Minting: Mint NFTs on the Solana blockchain with a single click.
Lightweight & Secure: Built using HTML, CSS, JavaScript, and Flask with no external UI libraries.
Responsive Design: Optimized for desktop and mobile devices.
Error Handling: Robust error notifications and loading states for a smooth user experience.


🖥️ Live Demo

Demo Link Placeholder (Replace with your deployed link if available)


🛠️ Prerequisites

Python 3.8+: Required for running the Flask backend.
Node.js (optional): For local development and testing.
Solana CLI: For minting NFTs on the Solana blockchain.
Pinata Account: For IPFS uploads (API key and secret required).
Phantom Wallet: Browser extension for wallet integration.


📂 Installation & Setup

Clone the Repository
git clone https://github.com/your-username/nft-marketplace-bot.git
cd nft-marketplace-bot


Install Dependencies
pip install -r requirements.txt


Configure Environment Variables

Create a .env file in the project root.

Add your Pinata API credentials:
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_api_key




Set Up Solana CLI

Install the Solana CLI: Solana Installation Guide.

Configure your Solana wallet:
solana-keygen new --outfile ~/.config/solana/id.json




Run the Application
python nft_marketplace_bot.py


Access the App

Open your browser and navigate to http://127.0.0.1:5000.




📖 Usage

Connect Wallet: Click "Connect Wallet" to link your Phantom Wallet.
Upload Files: Select NFT assets (images, metadata, etc.) and upload them to IPFS via the backend.
Analyze Rarity: Calculate rarity scores for uploaded metadata files.
Export Rarity: Download rarity scores as a CSV file.
Mint NFTs: Trigger NFT minting on the Solana blockchain (Devnet by default).


📂 Project Structure
nft-marketplace-bot/
├── static/
│   ├── logo.png           # Project logo
│   ├── script.js         # Frontend JavaScript logic
│   └── style.css         # CSS for responsive UI
├── Uploads/              # Temporary folder for uploaded files
├── nft.html              # Main HTML file
├── nft_marketplace_bot.py # Flask backend
├── requirements.txt       # Python dependencies
└── README.md             # This file


🛠️ Technologies Used

Backend: Flask, Python, Solana CLI, Pinata API
Frontend: HTML, CSS, Vanilla JavaScript, Phantom Wallet API
Dependencies:
Flask==2.3.3
Flask-CORS==4.0.1
requests==2.31.0
python-dotenv==1.0.1
werkzeug==3.0.1
solana==0.31.0




🔐 Security Notes

Secure File Uploads: Uses werkzeug.utils.secure_filename to prevent path traversal attacks.
Environment Variables: Sensitive keys (e.g., Pinata API) are stored in a .env file.
Phantom Wallet: Wallet interactions are handled client-side for security.
CORS: Configured to allow secure cross-origin requests.


🤝 Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m 'Add your feature').
Push to the branch (git push origin feature/your-feature).
Open a pull request.


📜 License
This project is licensed under the MIT License. See the LICENSE file for details.

📬 Contact

Author: Kamran Ali
GitHub: KamranAliOfficial
Email: kamranalideveloper@gmail.com


Built with 💻 and ☕ in 2025 by Kamran Ali

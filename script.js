(function () {
  'use strict';

  // Constants
  const DOM = {
    fileInput: document.getElementById('fileInput'),
    uploadButton: document.getElementById('uploadButton'),
    rarityButton: document.getElementById('rarityButton'),
    exportButton: document.getElementById('exportButton'),
    mintButton: document.getElementById('mintButton'),
    connectWallet: document.getElementById('connectWallet'),
    walletAddress: document.getElementById('walletAddress'),
    uploadResults: document.getElementById('uploadResults'),
    rarityResults: document.getElementById('rarityResults'),
    output: document.getElementById('output')
  };

  const API_ENDPOINTS = {
    UPLOAD: '/upload',
    RARITY: '/rarity',
    EXPORT_CSV: '/export_csv',
    MINT: '/mint'
  };

  let walletConnected = false;

  /**
   * Display a temporary notification message.
   * @param {string} type - 'success' or 'error'
   * @param {string} message - Message to display
   */
  function showMessage(type, message) {
    const notification = document.createElement('p');
    notification.className = `text-sm p-2 rounded ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    notification.textContent = message;
    DOM.output.prepend(notification);
    setTimeout(() => notification.remove(), 5000);
  }

  /**
   * Toggle button loading state.
   * @param {HTMLElement} button - Button element
   * @param {boolean} isLoading - Whether to show loading state
   * @param {string} defaultText - Default button text
   */
  function toggleButtonLoading(button, isLoading, defaultText) {
    button.disabled = isLoading;
    button.classList.toggle('loading', isLoading);
    button.textContent = isLoading ? 'Processing...' : defaultText;
  }

  /**
   * Connect to Phantom Wallet and update UI.
   */
  async function connectWallet() {
    if (!window.solana || !window.solana.isPhantom) {
      showMessage('error', '⚠️ Please install Phantom Wallet');
      return;
    }
    try {
      const res = await window.solana.connect();
      const publicKey = res.publicKey.toString();
      DOM.walletAddress.textContent = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
      DOM.walletAddress.classList.remove('hidden');
      DOM.connectWallet.textContent = 'Wallet Connected';
      DOM.connectWallet.disabled = true;
      walletConnected = true;
      showMessage('success', `🦊 Wallet Connected: ${publicKey}`);
    } catch (err) {
      showMessage('error', 'Wallet connection failed');
      console.error('Wallet connection error:', err);
    }
  }

  /**
   * Upload files to IPFS via backend.
   */
  async function uploadFiles() {
    if (!DOM.fileInput.files.length) {
      showMessage('error', 'Please select files to upload');
      return;
    }
    toggleButtonLoading(DOM.uploadButton, true, 'Upload Files');
    DOM.uploadResults.innerHTML = '';
    try {
      const formData = new FormData();
      Array.from(DOM.fileInput.files).forEach(file => formData.append('file', file));
      const res = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!data.results) {
        throw new Error('Invalid response from server');
      }
      data.results.forEach(result => {
        const p = document.createElement('p');
        if (result.error) {
          p.textContent = `❌ ${result.filename}: ${result.error}`;
          p.className = 'text-red-400';
        } else {
          p.innerHTML = `✅ ${result.filename}: <a href="${result.ipfs_url}" target="_blank" class="text-blue-400 underline">${result.ipfs_url}</a>`;
        }
        DOM.uploadResults.appendChild(p);
      });
      showMessage('success', 'Files uploaded successfully');
    } catch (err) {
      showMessage('error', `Upload failed: ${err.message}`);
      console.error('Upload error:', err);
    } finally {
      toggleButtonLoading(DOM.uploadButton, false, 'Upload Files');
      DOM.fileInput.value = '';
    }
  }

  /**
   * Fetch rarity scores from backend and display in a table.
   */
  async function fetchRarity() {
    toggleButtonLoading(DOM.rarityButton, true, 'Analyze Rarity');
    DOM.rarityResults.innerHTML = '';
    try {
      const res = await fetch(API_ENDPOINTS.RARITY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata_path: 'Uploads' })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      const table = document.createElement('table');
      table.className = 'w-full text-left border-collapse';
      table.innerHTML = `
        <thead>
          <tr class="bg-gray-700">
            <th class="p-2">Rank</th>
            <th class="p-2">Name</th>
            <th class="p-2">Score</th>
          </tr>
        </thead>
        <tbody>
          ${data.scores.map((nft, index) => `
            <tr class="border-b border-gray-600">
              <td class="p-2">${index + 1}</td>
              <td class="p-2">${nft.name}</td>
              <td class="p-2">${nft.score.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
      DOM.rarityResults.appendChild(table);
      showMessage('success', '📊 Rarity analysis completed');
    } catch (err) {
      showMessage('error', `Rarity calculation failed: ${err.message}`);
      console.error('Rarity error:', err);
    } finally {
      toggleButtonLoading(DOM.rarityButton, false, 'Analyze Rarity');
    }
  }

  /**
   * Export rarity scores as CSV.
   */
  async function exportCSV() {
    toggleButtonLoading(DOM.exportButton, true, 'Export CSV');
    try {
      const res = await fetch(API_ENDPOINTS.EXPORT_CSV, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata_path: 'Uploads' })
      });
      if (!res.ok) {
        throw new Error('Failed to export CSV');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'rarity_scores.csv';
      link.click();
      window.URL.revokeObjectURL(url);
      showMessage('success', 'CSV exported successfully');
    } catch (err) {
      showMessage('error', `CSV export failed: ${err.message}`);
      console.error('Export error:', err);
    } finally {
      toggleButtonLoading(DOM.exportButton, false, 'Export CSV');
    }
  }

  /**
   * Trigger NFT minting on Solana.
   */
  async function triggerMint() {
    if (!walletConnected) {
      showMessage('error', 'Please connect your wallet first');
      return;
    }
    toggleButtonLoading(DOM.mintButton, true, 'Mint NFT');
    try {
      const res = await fetch(API_ENDPOINTS.MINT, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      showMessage('success', `🚀 ${data.message}`);
      if (data.output) {
        const pre = document.createElement('pre');
        pre.textContent = data.output;
        DOM.output.appendChild(pre);
      }
    } catch (err) {
      showMessage('error', `Minting failed: ${err.message}`);
      console.error('Minting error:', err);
    } finally {
      toggleButtonLoading(DOM.mintButton, false, 'Mint NFT');
    }
  }

  // Event Listeners
  function setupEventListeners() {
    DOM.connectWallet.addEventListener('click', connectWallet);
    DOM.uploadButton.addEventListener('click', uploadFiles);
    DOM.rarityButton.addEventListener('click', fetchRarity);
    DOM.exportButton.addEventListener('click', exportCSV);
    DOM.mintButton.addEventListener('click', triggerMint);
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    // Check for existing wallet connection
    if (window.solana && window.solana.isPhantom && window.solana.isConnected) {
      connectWallet();
    }
  });
})();
// TypeScript global declarations for browser globals
declare global {
  interface Window { ethers: any; ethereum: any; }
}

export {};

// Extracted from receive.html <script>
// Show claim success if ?claimed=1&amount=...&address=... in URL
function getQueryParams(): Record<string, string> {
  const params: Record<string, string> = {};
  window.location.search.replace(/\??([^=&]+)=([^&]*)/g, function(_, k: string, v: string): string {
    params[k] = decodeURIComponent(v);
    return '';
  });
  return params;
}
document.addEventListener('DOMContentLoaded', function() {
  const params = getQueryParams();
  if (params.claimed === '1') {
    document.getElementById('claim-success')?.classList.remove('hidden');
    let details = '';
    if (params.amount) details += `<div>Amount: <span class='font-bold'>${params.amount}</span></div>`;
    if (params.address) details += `<div>Address: <span class='font-bold'>${params.address}</span></div>`;
    const claimDetails = document.getElementById('claim-details');
    if (claimDetails) claimDetails.innerHTML = details;
    const startBtn = document.getElementById('startFaceScanBtn') as HTMLElement;
    if (startBtn) startBtn.style.display = 'none';
  }
});
// --- Wallet & Withdraw Logic ---
let receiveUserAddress: string | null = null;
let receiveProvider: any;
let receiveSigner: any;
const CONTRACT_ABI = [
  { "inputs": [ { "internalType": "address", "name": "_verifier", "type": "address" }, { "internalType": "bytes32[128]", "name": "_faceEncoding", "type": "bytes32[128]" }, { "internalType": "bytes32", "name": "_threshold", "type": "bytes32" } ], "stateMutability": "nonpayable", "type": "constructor" },
  { "inputs": [], "name": "verifier", "outputs": [ { "internalType": "contract HonkVerifier", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "bytes", "name": "proof", "type": "bytes" } ], "name": "verify", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address payable", "name": "to", "type": "address" }, { "internalType": "bytes", "name": "proof", "type": "bytes" } ], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "stateMutability": "payable", "type": "receive" }
];
async function getContractBalance(address: string): Promise<string | null> {
  if (!window.ethers) return null;
  try {
    const rpcProvider = new window.ethers.providers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
    const bal = await rpcProvider.getBalance(address);
    return window.ethers.utils.formatEther(bal);
  } catch (e) { return null; }
}
document.addEventListener('DOMContentLoaded', async function() {
  const params = getQueryParams();
  // --- Show claim success if claimed=1 ---
  if (params.claimed === '1') {
    document.getElementById('claim-success')?.classList.remove('hidden');
    let details = '';
    if (params.amount) details += `<div>Amount: <span class='font-bold'>${params.amount}</span></div>`;
    if (params.address) details += `<div>Address: <span class='font-bold'>${params.address}</span></div>`;
    const claimDetails2 = document.getElementById('claim-details');
    if (claimDetails2) claimDetails2.innerHTML = details;
    const startBtn2 = document.getElementById('startFaceScanBtn') as HTMLElement;
    if (startBtn2) startBtn2.style.display = 'none';
    return;
  }
  const embeddings = params.embeddings;
  console.log(embeddings);
  // --- Withdraw UI logic ---
  const contractAddr = params.address;
  if (contractAddr) {
    const contractAddrEl = document.getElementById('contract-address');
    if (contractAddrEl) {
      contractAddrEl.textContent = 'Contract: ' + contractAddr;
      contractAddrEl.classList.remove('hidden');
    }
    const bal = await getContractBalance(contractAddr);
    if (bal !== null) {
      const contractBalEl = document.getElementById('contract-balance');
      if (contractBalEl) {
        contractBalEl.textContent = 'Available: ' + bal + ' ETH';
        contractBalEl.classList.remove('hidden');
      }
    }
  }
  // --- Connect Wallet ---
  const connectWalletBtn = document.getElementById('connect-wallet') as HTMLButtonElement;
  if (connectWalletBtn) {
    connectWalletBtn.onclick = async function () {
    if (window.ethereum && window.ethers) {
      receiveProvider = new window.ethers.providers.Web3Provider(window.ethereum, 'any');
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        receiveUserAddress = accounts[0];
        const walletAddress = document.getElementById('wallet-address') as HTMLElement;
        const destAddress = document.getElementById('dest-address') as HTMLInputElement;
        const withdrawBtn = document.getElementById('withdraw-btn') as HTMLButtonElement;
        const withdrawError = document.getElementById('withdraw-error') as HTMLElement;
        if (walletAddress) {
          walletAddress.textContent = 'Connected: ' + receiveUserAddress;
          walletAddress.classList.remove('hidden');
        }
        if (destAddress && receiveUserAddress) destAddress.value = receiveUserAddress;
        if (withdrawBtn) withdrawBtn.disabled = false;
        if (withdrawError) withdrawError.classList.add('hidden');
      } catch (e) {
        const withdrawError = document.getElementById('withdraw-error') as HTMLElement;
        if (withdrawError) {
          withdrawError.textContent = 'Wallet connection rejected.';
          withdrawError.classList.remove('hidden');
        }
      }
    } else {
      const withdrawError = document.getElementById('withdraw-error') as HTMLElement;
      if (withdrawError) {
        withdrawError.textContent = 'MetaMask or ethers.js not found.';
        withdrawError.classList.remove('hidden');
      }
    }
    };
  }
  // --- Withdraw ---
  const withdrawBtnElement = document.getElementById('withdraw-btn') as HTMLButtonElement;
  if (withdrawBtnElement) {
    withdrawBtnElement.onclick = async function () {
      const withdrawStatus = document.getElementById('withdraw-status') as HTMLElement;
      const withdrawError = document.getElementById('withdraw-error') as HTMLElement;
      if (withdrawStatus) withdrawStatus.classList.add('hidden');
      if (withdrawError) withdrawError.classList.add('hidden');
      const destAddressInput = document.getElementById('dest-address') as HTMLInputElement;
      const proofInput = document.getElementById('proof-input') as HTMLInputElement;
      const dest = destAddressInput ? destAddressInput.value : '';
      let proof = proofInput ? proofInput.value : '';
      if (!receiveUserAddress || !dest || !window.ethers.utils.isAddress(dest)) {
        if (withdrawError) {
          withdrawError.textContent = 'Connect wallet and enter a valid destination address.';
          withdrawError.classList.remove('hidden');
        }
        return;
      }
    if (!proof) {
      // For now, use dummy proof (empty bytes)
      proof = '0x';
    }
      if (!contractAddr) {
        if (withdrawError) {
          withdrawError.textContent = 'No contract address in URL.';
          withdrawError.classList.remove('hidden');
        }
        return;
      }
      // --- BEGIN PATCH: Accept both hex and base64 for proof, and sanitize input ---
      function isHexString(str: string): boolean {
      return /^0x[0-9a-fA-F]*$/.test(str);
    }
      function base64ToHex(base64: string): string | null {
      try {
        // atob decodes base64 to binary string
        const raw = atob(base64.replace(/\s/g, ''));
        let result = '0x';
        for (let i = 0; i < raw.length; i++) {
          let hex = raw.charCodeAt(i).toString(16);
          if (hex.length === 1) hex = '0' + hex;
          result += hex;
        }
        return result;
      } catch (e) {
        return null;
      }
    }
    // Remove whitespace
    proof = proof.trim();
      // Accept both hex and base64
      if (proof && !isHexString(proof)) {
        // Try to convert from base64 to hex
        const hexProof = base64ToHex(proof);
        if (hexProof && isHexString(hexProof)) {
          proof = hexProof;
        } else {
          if (withdrawError) {
            withdrawError.textContent = 'Invalid proof format: must be hex (0x...) or base64.';
            withdrawError.classList.remove('hidden');
          }
          return;
        }
      }
      // If proof is just "0x" or empty, treat as empty bytes
      if (!proof || proof === '0x') {
        proof = '0x';
      }
    // --- END PATCH ---
      try {
        const contract = new window.ethers.Contract(contractAddr, CONTRACT_ABI, receiveProvider.getSigner());
        // Use a high manual gas limit, similar to scan.html
        const manualGasLimit = 8000000;
        const tx = await contract.withdraw(dest, proof, { gasLimit: manualGasLimit });
        if (withdrawStatus) {
          withdrawStatus.textContent = 'Transaction sent. Waiting for confirmation...';
          withdrawStatus.classList.remove('hidden');
        }
      const receipt = await tx.wait();
        if (receipt && receipt.status === 1) {
          if (withdrawStatus) withdrawStatus.textContent = 'Withdraw successful!';
          // Optionally redirect or show claim success
          const contractBalance = document.getElementById('contract-balance') as HTMLElement;
          const balanceText = contractBalance ? contractBalance.textContent?.replace('Available: ','') : '';
          window.location.href = `/receive?claimed=1&amount=${balanceText}&address=${contractAddr}`;
        } else {
          if (withdrawError) {
            withdrawError.textContent = 'Withdraw failed or reverted.';
            withdrawError.classList.remove('hidden');
          }
        }
      } catch (err: any) {
        // Show more helpful error for invalid proof
        if (withdrawError) {
          if (err && err.code === 'INVALID_ARGUMENT' && /invalid arrayify value/i.test(err.message)) {
            withdrawError.textContent = 'Withdraw failed: Invalid proof format. Please ensure your proof is a valid hex string (0x...) or base64.';
          } else {
            withdrawError.textContent = 'Withdraw failed: ' + (err.message || err);
          }
          withdrawError.classList.remove('hidden');
        }
      }
    };
  }
}); 
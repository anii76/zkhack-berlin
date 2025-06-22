"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Extracted from receive.html <script>
// Show claim success if ?claimed=1&amount=...&address=... in URL
function getQueryParams() {
    const params = {};
    window.location.search.replace(/\??([^=&]+)=([^&]*)/g, function (_, k, v) {
        params[k] = decodeURIComponent(v);
    });
    return params;
}
document.addEventListener('DOMContentLoaded', function () {
    const params = getQueryParams();
    if (params.claimed === '1') {
        document.getElementById('claim-success').classList.remove('hidden');
        let details = '';
        if (params.amount)
            details += `<div>Amount: <span class='font-bold'>${params.amount}</span></div>`;
        if (params.address)
            details += `<div>Address: <span class='font-bold'>${params.address}</span></div>`;
        document.getElementById('claim-details').innerHTML = details;
        document.getElementById('startFaceScanBtn').style.display = 'none';
    }
});
// --- Wallet & Withdraw Logic ---
let userAddress = null;
let provider, signer;
const CONTRACT_ABI = [
    { "inputs": [{ "internalType": "address", "name": "_verifier", "type": "address" }, { "internalType": "bytes32[128]", "name": "_faceEncoding", "type": "bytes32[128]" }, { "internalType": "bytes32", "name": "_threshold", "type": "bytes32" }], "stateMutability": "nonpayable", "type": "constructor" },
    { "inputs": [], "name": "verifier", "outputs": [{ "internalType": "contract HonkVerifier", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "bytes", "name": "proof", "type": "bytes" }], "name": "verify", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address payable", "name": "to", "type": "address" }, { "internalType": "bytes", "name": "proof", "type": "bytes" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "stateMutability": "payable", "type": "receive" }
];
function getContractBalance(address) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!window.ethers)
            return null;
        try {
            const rpcProvider = new window.ethers.providers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
            const bal = yield rpcProvider.getBalance(address);
            return window.ethers.utils.formatEther(bal);
        }
        catch (e) {
            return null;
        }
    });
}
document.addEventListener('DOMContentLoaded', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const params = getQueryParams();
        // --- Show claim success if claimed=1 ---
        if (params.claimed === '1') {
            document.getElementById('claim-success').classList.remove('hidden');
            let details = '';
            if (params.amount)
                details += `<div>Amount: <span class='font-bold'>${params.amount}</span></div>`;
            if (params.address)
                details += `<div>Address: <span class='font-bold'>${params.address}</span></div>`;
            document.getElementById('claim-details').innerHTML = details;
            document.getElementById('startFaceScanBtn').style.display = 'none';
            return;
        }
        // --- Withdraw UI logic ---
        const contractAddr = params.address;
        if (contractAddr) {
            document.getElementById('contract-address').textContent = 'Contract: ' + contractAddr;
            document.getElementById('contract-address').classList.remove('hidden');
            const bal = yield getContractBalance(contractAddr);
            if (bal !== null) {
                document.getElementById('contract-balance').textContent = 'Available: ' + bal + ' ETH';
                document.getElementById('contract-balance').classList.remove('hidden');
            }
        }
        // --- Connect Wallet ---
        document.getElementById('connect-wallet').onclick = function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (window.ethereum && window.ethers) {
                    provider = new window.ethers.providers.Web3Provider(window.ethereum, 'any');
                    try {
                        const accounts = yield window.ethereum.request({ method: 'eth_requestAccounts' });
                        userAddress = accounts[0];
                        document.getElementById('wallet-address').textContent = 'Connected: ' + userAddress;
                        document.getElementById('wallet-address').classList.remove('hidden');
                        // Default destination address to user
                        document.getElementById('dest-address').value = userAddress;
                        document.getElementById('withdraw-btn').disabled = false;
                        document.getElementById('withdraw-error').classList.add('hidden');
                    }
                    catch (e) {
                        document.getElementById('withdraw-error').textContent = 'Wallet connection rejected.';
                        document.getElementById('withdraw-error').classList.remove('hidden');
                    }
                }
                else {
                    document.getElementById('withdraw-error').textContent = 'MetaMask or ethers.js not found.';
                    document.getElementById('withdraw-error').classList.remove('hidden');
                }
            });
        };
        // --- Withdraw ---
        document.getElementById('withdraw-btn').onclick = function () {
            return __awaiter(this, void 0, void 0, function* () {
                document.getElementById('withdraw-status').classList.add('hidden');
                document.getElementById('withdraw-error').classList.add('hidden');
                const dest = document.getElementById('dest-address').value;
                let proof = document.getElementById('proof-input').value;
                if (!userAddress || !dest || !window.ethers.utils.isAddress(dest)) {
                    document.getElementById('withdraw-error').textContent = 'Connect wallet and enter a valid destination address.';
                    document.getElementById('withdraw-error').classList.remove('hidden');
                    return;
                }
                if (!proof) {
                    // For now, use dummy proof (empty bytes)
                    proof = '0x';
                }
                if (!contractAddr) {
                    document.getElementById('withdraw-error').textContent = 'No contract address in URL.';
                    document.getElementById('withdraw-error').classList.remove('hidden');
                    return;
                }
                // --- BEGIN PATCH: Accept both hex and base64 for proof, and sanitize input ---
                function isHexString(str) {
                    return /^0x[0-9a-fA-F]*$/.test(str);
                }
                function base64ToHex(base64) {
                    try {
                        // atob decodes base64 to binary string
                        const raw = atob(base64.replace(/\s/g, ''));
                        let result = '0x';
                        for (let i = 0; i < raw.length; i++) {
                            let hex = raw.charCodeAt(i).toString(16);
                            if (hex.length === 1)
                                hex = '0' + hex;
                            result += hex;
                        }
                        return result;
                    }
                    catch (e) {
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
                    }
                    else {
                        document.getElementById('withdraw-error').textContent = 'Invalid proof format: must be hex (0x...) or base64.';
                        document.getElementById('withdraw-error').classList.remove('hidden');
                        return;
                    }
                }
                // If proof is just "0x" or empty, treat as empty bytes
                if (!proof || proof === '0x') {
                    proof = '0x';
                }
                // --- END PATCH ---
                try {
                    const contract = new window.ethers.Contract(contractAddr, CONTRACT_ABI, provider.getSigner());
                    // Use a high manual gas limit, similar to scan.html
                    const manualGasLimit = 8000000;
                    const tx = yield contract.withdraw(dest, proof, { gasLimit: manualGasLimit });
                    document.getElementById('withdraw-status').textContent = 'Transaction sent. Waiting for confirmation...';
                    document.getElementById('withdraw-status').classList.remove('hidden');
                    const receipt = yield tx.wait();
                    if (receipt && receipt.status === 1) {
                        document.getElementById('withdraw-status').textContent = 'Withdraw successful!';
                        // Optionally redirect or show claim success
                        window.location.href = `/receive?claimed=1&amount=${document.getElementById('contract-balance').textContent.replace('Available: ', '')}&address=${contractAddr}`;
                    }
                    else {
                        document.getElementById('withdraw-error').textContent = 'Withdraw failed or reverted.';
                        document.getElementById('withdraw-error').classList.remove('hidden');
                    }
                }
                catch (err) {
                    // Show more helpful error for invalid proof
                    if (err && err.code === 'INVALID_ARGUMENT' && /invalid arrayify value/i.test(err.message)) {
                        document.getElementById('withdraw-error').textContent = 'Withdraw failed: Invalid proof format. Please ensure your proof is a valid hex string (0x...) or base64.';
                    }
                    else {
                        document.getElementById('withdraw-error').textContent = 'Withdraw failed: ' + (err.message || err);
                    }
                    document.getElementById('withdraw-error').classList.remove('hidden');
                }
            });
        };
    });
});

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
let stream;
let isModelLoaded = false;
function startWebcam() {
    return __awaiter(this, void 0, void 0, function* () {
        const videoEl = document.getElementById('inputVideo');
        try {
            // Use the front (selfie) camera by default
            stream = yield navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        }
        catch (err) {
            // fallback to any camera
            stream = yield navigator.mediaDevices.getUserMedia({ video: true });
        }
        videoEl.srcObject = stream;
    });
}
function loadModels() {
    return __awaiter(this, void 0, void 0, function* () {
        yield faceapi.nets.tinyFaceDetector.load('/models/');
        yield faceapi.nets.faceRecognitionNet.load('/models/');
        isModelLoaded = true;
        document.getElementById('uploadPhoto').disabled = false;
        document.getElementById('captureBtn').disabled = false;
    });
}
function detectFace() {
    return __awaiter(this, arguments, void 0, function* (sourceType = 'video') {
        const canvas = document.getElementById('overlay');
        let input, displaySize;
        if (sourceType === 'image') {
            input = document.getElementById('inputImage');
            displaySize = { width: input.naturalWidth, height: input.naturalHeight };
        }
        else {
            input = document.getElementById('inputVideo');
            displaySize = { width: input.videoWidth, height: input.videoHeight };
        }
        faceapi.matchDimensions(canvas, displaySize);
        const detection = yield faceapi.detectSingleFace(input, new faceapi.TinyFaceDetectorOptions());
        const resizedDetections = detection ? faceapi.resizeResults(detection, displaySize) : null;
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        if (resizedDetections) {
            faceapi.draw.drawDetections(canvas, resizedDetections);
        }
        return detection;
    });
}
// Helper function to check if an image is loaded (from face-api.js isMediaLoaded)
function isImageLoaded(img) {
    return img.complete;
}
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    yield loadModels();
    yield startWebcam();
    const inputImage = document.getElementById('inputImage');
    const inputVideo = document.getElementById('inputVideo');
    document.getElementById('uploadPhoto').addEventListener('change', function (e) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = e.target.files[0];
            if (!file)
                return;
            const url = URL.createObjectURL(file);
            inputImage.src = url;
            inputImage.onload = () => __awaiter(this, void 0, void 0, function* () {
                inputImage.classList.remove('hidden');
                inputVideo.classList.add('hidden');
                if (!isImageLoaded(inputImage)) {
                    console.warn('Uploaded image is not fully loaded, skipping detection.');
                    return;
                }
                const detection = yield detectFace('image');
                const status = document.getElementById('face-status');
                if (detection) {
                    status.textContent = '';
                    document.getElementById('captureBtn').style.display = 'none';
                    const descriptor = yield faceapi.computeFaceDescriptor(inputImage);
                    const embeddingsOutput = document.getElementById('embeddings-output');
                    if (embeddingsOutput) {
                        embeddingsOutput.value = JSON.stringify(Array.from(descriptor), null, 2);
                        // Skip embeddings-container, go directly to send funds
                        document.getElementById('embeddings-container').classList.add('hidden');
                        showSendFunds();
                    }
                    else {
                        console.warn('Embeddings output not found in DOM');
                    }
                }
                else {
                    status.textContent = 'No face detected in uploaded photo. Try another image.';
                    inputImage.classList.add('hidden');
                    inputVideo.classList.remove('hidden');
                }
            });
        });
    });
    document.getElementById('captureBtn').onclick = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!isModelLoaded)
            return;
        let detection;
        if (!inputImage.classList.contains('hidden')) {
            detection = yield detectFace('image');
        }
        else {
            detection = yield detectFace('video');
        }
        const status = document.getElementById('face-status');
        if (detection) {
            status.textContent = '';
            document.getElementById('captureBtn').style.display = 'none';
            let descriptor;
            if (!inputImage.classList.contains('hidden')) {
                descriptor = yield faceapi.computeFaceDescriptor(inputImage);
            }
            else {
                descriptor = yield faceapi.computeFaceDescriptor(inputVideo);
            }
            const embeddingsOutput = document.getElementById('embeddings-output');
            if (embeddingsOutput) {
                embeddingsOutput.value = JSON.stringify(Array.from(descriptor), null, 2);
                // Skip embeddings-container, go directly to send funds
                document.getElementById('embeddings-container').classList.add('hidden');
                showSendFunds();
            }
            else {
                console.warn('Embeddings output not found in DOM');
            }
            if (stream && inputImage.classList.contains('hidden'))
                stream.getTracks().forEach(t => t.stop());
        }
        else {
            status.textContent = 'No face detected. Try again.';
        }
    });
}));
// --- New wallet/ETH logic ---
let userAddress = null;
let provider, signer;
const CHAIN_ID = '0x6706e'; // 421614 in hex
const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';
// Show send funds UI after embeddings
function showSendFunds() {
    document.getElementById('embeddings-container').classList.add('hidden');
    document.getElementById('send-funds-container').classList.remove('hidden');
}
// Connect wallet
document.getElementById('connect-wallet').onclick = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (window.ethereum) {
            let switched = false;
            try {
                yield window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_ID }] });
                switched = true;
            }
            catch (switchError) {
                if (switchError.code === 4902) {
                    // Chain not added, try to add
                    try {
                        yield window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                    chainId: CHAIN_ID,
                                    rpcUrls: [RPC_URL],
                                    chainName: 'Arbitrum Sepolia',
                                    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                                    blockExplorerUrls: ['https://sepolia.arbiscan.io/']
                                }]
                        });
                        switched = true;
                    }
                    catch (addError) {
                        document.getElementById('send-error').textContent = 'Failed to add network.';
                        document.getElementById('send-error').classList.remove('hidden');
                        return;
                    }
                }
                else if (switchError.code === 4001) {
                    // User rejected
                    document.getElementById('send-error').textContent = 'Network switch rejected by user.';
                    document.getElementById('send-error').classList.remove('hidden');
                    return;
                } // else: could be already on correct network, so continue
            }
            // Always try to connect wallet and show address
            try {
                const accounts = yield window.ethereum.request({ method: 'eth_requestAccounts' });
                userAddress = accounts[0];
                document.getElementById('wallet-address').textContent = 'Connected: ' + userAddress;
                document.getElementById('wallet-address').classList.remove('hidden');
                document.getElementById('send-eth').disabled = false;
                document.getElementById('send-error').classList.add('hidden');
            }
            catch (connectError) {
                document.getElementById('send-error').textContent = 'Wallet connection rejected.';
                document.getElementById('send-error').classList.remove('hidden');
            }
        }
        else {
            document.getElementById('send-error').textContent = 'MetaMask not found.';
            document.getElementById('send-error').classList.remove('hidden');
        }
    });
};
// Send ETH and call contract
document.getElementById('send-eth').onclick = function () {
    return __awaiter(this, void 0, void 0, function* () {
        document.getElementById('send-status').classList.add('hidden');
        document.getElementById('send-error').classList.add('hidden');
        const eth = parseFloat(document.getElementById('eth-amount-input').value);
        if (!userAddress || !eth || eth <= 0) {
            document.getElementById('send-error').textContent = 'Please connect wallet and enter a valid ETH amount.';
            document.getElementById('send-error').classList.remove('hidden');
            return;
        }
        // Get face embeddings
        let embeddings;
        try {
            embeddings = JSON.parse(document.getElementById('embeddings-output').value);
        }
        catch (e) {
            document.getElementById('send-error').textContent = 'Invalid embeddings.';
            document.getElementById('send-error').classList.remove('hidden');
            return;
        }
        // Pad/convert embeddings to bytes32[128]
        let faceEncoding = [];
        for (let i = 0; i < 128; i++) {
            let hex;
            if (i < embeddings.length) {
                let val = embeddings[i];
                let intVal = Math.floor(val * Math.pow(2, 32));
                let bigVal = BigInt(intVal);
                if (bigVal < 0n) {
                    bigVal = (1n << 256n) + bigVal;
                }
                hex = bigVal.toString(16).padStart(64, '0');
                faceEncoding.push('0x' + hex);
            }
            else {
                faceEncoding.push('0x' + '00'.repeat(32));
            }
        }
        // Generate a salt as bytes32
        // Use ethers.utils.formatBytes32String to convert a string to bytes32
        let salt;
        try {
            // Generate a random 16-byte hex string and format as bytes32
            // Use a 31-character string to ensure it's less than 32 bytes for formatBytes32String
            const randomBytes = crypto.getRandomValues(new Uint8Array(16));
            // Convert to base64 (22 chars for 16 bytes), safe for bytes32
            const randomBase64 = btoa(String.fromCharCode(...randomBytes)).replace(/=+$/, '').slice(0, 31);
            salt = window.ethers.utils.formatBytes32String(randomBase64);
        }
        catch (e) {
            document.getElementById('send-error').textContent = 'Failed to format salt: ' + (e.message || e);
            document.getElementById('send-error').classList.remove('hidden');
            return;
        }
        // Contract ABI and address (replace with your deployed address)
        const CONTRACT_ABI = [
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "addr", "type": "address" }], "name": "Deployed", "type": "event" },
            {
                "inputs": [
                    { "internalType": "bytes32", "name": "salt", "type": "bytes32" },
                    { "internalType": "address", "name": "owner", "type": "address" },
                    { "internalType": "bytes32[128]", "name": "faceEncoding", "type": "bytes32[128]" },
                    { "internalType": "bytes32", "name": "threshold", "type": "bytes32" }
                ],
                "name": "deploy",
                "outputs": [{ "internalType": "address", "name": "addr", "type": "address" }],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "bytes32", "name": "salt", "type": "bytes32" },
                    { "internalType": "address", "name": "owner", "type": "address" },
                    { "internalType": "bytes32[128]", "name": "faceEncoding", "type": "bytes32[128]" },
                    { "internalType": "bytes32", "name": "threshold", "type": "bytes32" }
                ],
                "name": "getAddress",
                "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "address", "name": "owner", "type": "address" },
                    { "internalType": "bytes32[128]", "name": "faceEncoding", "type": "bytes32[128]" },
                    { "internalType": "bytes32", "name": "threshold", "type": "bytes32" }
                ],
                "name": "getBytecode",
                "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }],
                "stateMutability": "pure",
                "type": "function"
            }
        ];
        const CONTRACT_ADDRESS = '0x0ff86E8abc751ea988835e92123CBFCB0b906f68';
        // Use ethers.js if available
        if (window.ethereum && window.ethers) {
            provider = new window.ethers.providers.Web3Provider(window.ethereum, 'any');
            signer = provider.getSigner();
            const contract = new window.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            try {
                console.log("deploying contract");
                console.log("Salt:", salt);
                console.log("Owner:", "0x4f98718CE96ccAb7CEaaB5a81C7ddDAF77D8dDc8");
                console.log("FaceEncoding:", faceEncoding);
                console.log("ETH amount:", eth);
                console.log("Value (wei):", window.ethers.utils.parseEther(eth.toString()).toString());
                // Use a high manual gas limit
                const manualGasLimit = 8000000;
                const tx = yield contract.deploy(salt, "0x4f98718CE96ccAb7CEaaB5a81C7ddDAF77D8dDc8", faceEncoding, window.ethers.utils.zeroPad(window.ethers.utils.hexlify(500000000), 32), {
                    value: window.ethers.utils.parseEther(eth.toString()),
                    gasLimit: manualGasLimit
                });
                console.log("Transaction sent to blockchain. Tx hash:", tx.hash);
                document.getElementById('send-status').textContent = 'Transaction sent. Waiting for confirmation...';
                document.getElementById('send-status').classList.remove('hidden');
                const receipt = yield tx.wait();
                if (receipt && receipt.status === 1) {
                    console.log("Transaction confirmed on blockchain. Receipt:", receipt);
                }
                else {
                    console.log("Transaction failed or was reverted. Receipt:", receipt);
                }
                // Get deployed address from event or call getAddress
                let deployedAddr = null;
                if (receipt && receipt.events) {
                    const event = receipt.events.find(e => e.event === 'Deployed');
                    if (event)
                        deployedAddr = event.args.addr;
                }
                if (!deployedAddr) {
                    deployedAddr = yield contract.getAddress(salt, "0x4f98718CE96ccAb7CEaaB5a81C7ddDAF77D8dDc8", faceEncoding);
                }
                // Show success and link
                document.getElementById('send-funds-container').classList.add('hidden');
                document.getElementById('claim-link-container').classList.remove('hidden');
                const claimUrl = `${window.location.origin}/receive?address=${deployedAddr}&amount=${eth}ETH`;
                document.getElementById('claim-link').value = claimUrl;
                document.getElementById('copy-link').onclick = function () {
                    navigator.clipboard.writeText(claimUrl);
                    document.getElementById('copy-status').classList.remove('hidden');
                    setTimeout(() => document.getElementById('copy-status').classList.add('hidden'), 1200);
                };
            }
            catch (err) {
                console.error("Transaction failed to send to blockchain:", err);
                document.getElementById('send-error').textContent = 'Transaction failed: ' + (err.message || err);
                document.getElementById('send-error').classList.remove('hidden');
            }
        }
        else {
            console.error("Ethers.js or MetaMask not found.");
            document.getElementById('send-error').textContent = 'Ethers.js or MetaMask not found.';
            document.getElementById('send-error').classList.remove('hidden');
        }
    });
};
// Enable/disable send button based on ETH input
document.getElementById('eth-amount-input').addEventListener('input', function () {
    const eth = parseFloat(this.value);
    document.getElementById('send-eth').disabled = !(eth > 0 && userAddress);
});
// Show send funds UI after embeddings are generated
// Patch into existing embedding logic
const origShowEmbeddings = function () {
    document.getElementById('embeddings-container').classList.remove('hidden');
    showSendFunds();
};
// Patch: after embeddings are shown, also show send funds
// You may need to call origShowEmbeddings() after embeddings are generated in your flow 

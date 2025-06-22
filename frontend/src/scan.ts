// TypeScript global declarations for browser globals
declare global {
  const faceapi: any;
  interface Window { ethers: any; ethereum: any; }
}

export {};

let stream: MediaStream | undefined;
let isModelLoaded = false;
async function startWebcam(): Promise<void> {
  const videoEl = document.getElementById('inputVideo') as HTMLVideoElement;
  if (!videoEl) return;
  try {
    // Use the front (selfie) camera by default
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
  } catch (err) {
    // fallback to any camera
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
  }
  if (videoEl) {
    videoEl.srcObject = stream;
  }
}
async function loadModels(): Promise<void> {
  await faceapi.nets.tinyFaceDetector.load('/models/');
  await faceapi.nets.faceRecognitionNet.load('/models/');
  isModelLoaded = true;
  const uploadPhoto = document.getElementById('uploadPhoto') as HTMLInputElement;
  const captureBtn = document.getElementById('captureBtn') as HTMLButtonElement;
  if (uploadPhoto) uploadPhoto.disabled = false;
  if (captureBtn) captureBtn.disabled = false;
}
async function detectFace(sourceType: string = 'video'): Promise<any> {
  const canvas = document.getElementById('overlay') as HTMLCanvasElement;
  if (!canvas) return null;
  let input: HTMLImageElement | HTMLVideoElement;
  let displaySize: { width: number; height: number };
  if (sourceType === 'image') {
    input = document.getElementById('inputImage') as HTMLImageElement;
    if (!input) return null;
    displaySize = { width: input.naturalWidth, height: input.naturalHeight };
  } else {
    input = document.getElementById('inputVideo') as HTMLVideoElement;
    if (!input) return null;
    displaySize = { width: input.videoWidth, height: input.videoHeight };
  }
  faceapi.matchDimensions(canvas, displaySize);
  const detection = await faceapi.detectSingleFace(input, new faceapi.TinyFaceDetectorOptions());
  const resizedDetections = detection ? faceapi.resizeResults(detection, displaySize) : null;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  if (resizedDetections) {
    faceapi.draw.drawDetections(canvas, resizedDetections);
  }
  return detection;
}
// Helper function to check if an image is loaded (from face-api.js isMediaLoaded)
function isImageLoaded(img: HTMLImageElement): boolean {
  return img.complete;
}
document.addEventListener('DOMContentLoaded', async () => {
  await loadModels();
  await startWebcam();
  const inputImage = document.getElementById('inputImage') as HTMLImageElement;
  const inputVideo = document.getElementById('inputVideo') as HTMLVideoElement;
  const uploadPhoto = document.getElementById('uploadPhoto') as HTMLInputElement;
  uploadPhoto?.addEventListener('change', async function (e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files ? target.files[0] : null;
    if (!file) return;
    const url = URL.createObjectURL(file);
    inputImage.src = url;
    if (inputImage) {
      inputImage.onload = async () => {
      inputImage.classList.remove('hidden');
      inputVideo.classList.add('hidden');
      if (!isImageLoaded(inputImage)) {
        console.warn('Uploaded image is not fully loaded, skipping detection.');
        return;
      }
      const detection = await detectFace('image');
      const status = document.getElementById('face-status') as HTMLElement;
      if (detection) {
        if (status) status.textContent = '';
        const captureBtn = document.getElementById('captureBtn') as HTMLElement;
        if (captureBtn) captureBtn.style.display = 'none';
        const descriptor = await faceapi.computeFaceDescriptor(inputImage);
        const embeddingsOutput = document.getElementById('embeddings-output') as HTMLTextAreaElement;
        if (embeddingsOutput) {
          embeddingsOutput.value = JSON.stringify(Array.from(descriptor), null, 2);
          // Skip embeddings-container, go directly to send funds
          const embeddingsContainer = document.getElementById('embeddings-container') as HTMLElement;
          if (embeddingsContainer) embeddingsContainer.classList.add('hidden');
          showSendFunds();
        } else {
          console.warn('Embeddings output not found in DOM');
        }
      } else {
        if (status) status.textContent = 'No face detected in uploaded photo. Try another image.';
        inputImage.classList.add('hidden');
        inputVideo.classList.remove('hidden');
      }
      };
    }
  });
  const captureBtnElement = document.getElementById('captureBtn') as HTMLButtonElement;
  if (captureBtnElement) {
    captureBtnElement.onclick = async () => {
    if (!isModelLoaded) return;
    let detection;
    if (!inputImage.classList.contains('hidden')) {
      detection = await detectFace('image');
    } else {
      detection = await detectFace('video');
    }
      const status = document.getElementById('face-status') as HTMLElement;
      if (detection) {
        if (status) status.textContent = '';
        const captureBtn = document.getElementById('captureBtn') as HTMLElement;
        if (captureBtn) captureBtn.style.display = 'none';
      let descriptor;
      if (!inputImage.classList.contains('hidden')) {
        descriptor = await faceapi.computeFaceDescriptor(inputImage);
      } else {
        descriptor = await faceapi.computeFaceDescriptor(inputVideo);
      }
        const embeddingsOutput = document.getElementById('embeddings-output') as HTMLTextAreaElement;
      if (embeddingsOutput) {
        embeddingsOutput.value = JSON.stringify(Array.from(descriptor), null, 2);
        // Skip embeddings-container, go directly to send funds
          const embeddingsContainer = document.getElementById('embeddings-container') as HTMLElement;
          if (embeddingsContainer) embeddingsContainer.classList.add('hidden');
        showSendFunds();
      } else {
        console.warn('Embeddings output not found in DOM');
      }
        if (stream && inputImage && inputImage.classList.contains('hidden')) {
          stream.getTracks().forEach(t => t.stop());
        }
      } else {
        if (status) status.textContent = 'No face detected. Try again.';
      }
    };
  }
});
// --- New wallet/ETH logic ---
let scanUserAddress: string | null = null;
let scanProvider: any;
let scanSigner: any;
const CHAIN_ID = '0x66eee'; // 421614 in hex
const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';
// Show send funds UI after embeddings
function showSendFunds(): void {
  const embeddingsContainer = document.getElementById('embeddings-container') as HTMLElement;
  const sendFundsContainer = document.getElementById('send-funds-container') as HTMLElement;
  if (embeddingsContainer) embeddingsContainer.classList.add('hidden');
  if (sendFundsContainer) sendFundsContainer.classList.remove('hidden');
}
// Connect wallet
const connectWalletBtn = document.getElementById('connect-wallet') as HTMLButtonElement;
if (connectWalletBtn) {
  connectWalletBtn.onclick = async function () {
  if (window.ethereum) {
    let switched = false;
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_ID }] });
      switched = true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added, try to add
        try {
          await window.ethereum.request({
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
        } catch (addError: any) {
          const sendError = document.getElementById('send-error') as HTMLElement;
          if (sendError) {
            sendError.textContent = 'Failed to add network.';
            sendError.classList.remove('hidden');
          }
          return;
        }
      } else if (switchError.code === 4001) {
        // User rejected
        const sendError = document.getElementById('send-error') as HTMLElement;
        if (sendError) {
          sendError.textContent = 'Network switch rejected by user.';
          sendError.classList.remove('hidden');
        }
        return;
      } // else: could be already on correct network, so continue
    }
    // Always try to connect wallet and show address
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      scanUserAddress = accounts[0];
      const walletAddress = document.getElementById('wallet-address') as HTMLElement;
      const sendEth = document.getElementById('send-eth') as HTMLButtonElement;
      const sendError = document.getElementById('send-error') as HTMLElement;
      if (walletAddress) {
        walletAddress.textContent = 'Connected: ' + scanUserAddress;
        walletAddress.classList.remove('hidden');
      }
      if (sendEth) sendEth.disabled = false;
      if (sendError) sendError.classList.add('hidden');
    } catch (connectError: any) {
      const sendError = document.getElementById('send-error') as HTMLElement;
      if (sendError) {
        sendError.textContent = 'Wallet connection rejected.';
        sendError.classList.remove('hidden');
      }
    }
  } else {
    const sendError = document.getElementById('send-error') as HTMLElement;
    if (sendError) {
      sendError.textContent = 'MetaMask not found.';
      sendError.classList.remove('hidden');
    }
  }
  };
}
// Send ETH and call contract
const sendEthBtn = document.getElementById('send-eth') as HTMLButtonElement;
if (sendEthBtn) {
  sendEthBtn.onclick = async function () {
    const sendStatus = document.getElementById('send-status') as HTMLElement;
    const sendError = document.getElementById('send-error') as HTMLElement;
    if (sendStatus) sendStatus.classList.add('hidden');
    if (sendError) sendError.classList.add('hidden');
    const ethAmountInput = document.getElementById('eth-amount-input') as HTMLInputElement;
    const eth = ethAmountInput ? parseFloat(ethAmountInput.value) : 0;
    if (!scanUserAddress || !eth || eth <= 0) {
      if (sendError) {
        sendError.textContent = 'Please connect wallet and enter a valid ETH amount.';
        sendError.classList.remove('hidden');
      }
      return;
    }
    // Get face embeddings
    let embeddings: number[];
    try {
      const embeddingsOutput = document.getElementById('embeddings-output') as HTMLTextAreaElement;
      embeddings = embeddingsOutput ? JSON.parse(embeddingsOutput.value) : [];
    } catch (e: any) {
      if (sendError) {
        sendError.textContent = 'Invalid embeddings.';
        sendError.classList.remove('hidden');
      }
      return;
    }
    // Pad/convert embeddings to bytes32[128]
    let faceEncoding: string[] = [];
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
    } else {
      faceEncoding.push('0x' + '00'.repeat(32));
    }
  }
    // Generate a salt as bytes32
    // Use ethers.utils.formatBytes32String to convert a string to bytes32
    let salt: string;
  try {
    // Generate a random 16-byte hex string and format as bytes32
    // Use a 31-character string to ensure it's less than 32 bytes for formatBytes32String
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    // Convert to base64 (22 chars for 16 bytes), safe for bytes32
    const randomBase64 = btoa(String.fromCharCode(...randomBytes)).replace(/=+$/, '').slice(0, 31);
    salt = window.ethers.utils.formatBytes32String(randomBase64);
    } catch (e: any) {
      if (sendError) {
        sendError.textContent = 'Failed to format salt: ' + (e.message || e);
        sendError.classList.remove('hidden');
      }
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
    scanProvider = new window.ethers.providers.Web3Provider(window.ethereum, 'any');
    scanSigner = scanProvider.getSigner();
    const contract = new window.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, scanSigner);
    try {
      console.log("deploying contract");
      console.log("Salt:", salt);
      console.log("Owner:", "0x4f98718CE96ccAb7CEaaB5a81C7ddDAF77D8dDc8");
      console.log("FaceEncoding:", faceEncoding);
      console.log("ETH amount:", eth);
      console.log("Value (wei):", window.ethers.utils.parseEther(eth.toString()).toString());
      // Use a high manual gas limit
      const manualGasLimit = 8000000;
      const tx = await contract.deploy(
        salt,
        "0x4f98718CE96ccAb7CEaaB5a81C7ddDAF77D8dDc8",
        faceEncoding,
        window.ethers.utils.zeroPad(
          window.ethers.utils.hexlify(500000000),
          32
        ),
        {
          value: window.ethers.utils.parseEther(eth.toString()),
          gasLimit: manualGasLimit
        },
      );
      console.log("Transaction sent to blockchain. Tx hash:", tx.hash);
      if (sendStatus) {
        sendStatus.textContent = 'Transaction sent. Waiting for confirmation...';
        sendStatus.classList.remove('hidden');
      }
      const receipt = await tx.wait();
      if (receipt && receipt.status === 1) {
          console.log("Transaction confirmed on blockchain. Receipt:", receipt);
      } else {
        console.log("Transaction failed or was reverted. Receipt:", receipt);
      }
      // Get deployed address from event or call getAddress
      let deployedAddr: string | null = null;
      if (receipt && receipt.events) {
        const event = receipt.events.find((e: any) => e.event === 'Deployed');
        if (event) deployedAddr = event.args.addr;
      }
      if (!deployedAddr) {
        deployedAddr = await contract.getAddress(salt, "0x4f98718CE96ccAb7CEaaB5a81C7ddDAF77D8dDc8", faceEncoding);
      }
      // Show success and link
      const sendFundsContainer = document.getElementById('send-funds-container') as HTMLElement;
      const claimLinkContainer = document.getElementById('claim-link-container') as HTMLElement;
      if (sendFundsContainer) sendFundsContainer.classList.add('hidden');
      if (claimLinkContainer) claimLinkContainer.classList.remove('hidden');
      // Encode embeddings as base64 for URL
      let embeddingsBase64 = '';
      try {
        const embeddingsStr = JSON.stringify(embeddings);
        // Standard base64 encoding
        embeddingsBase64 = btoa(unescape(encodeURIComponent(embeddingsStr)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, ''); // URL-safe base64
      } catch (e: any) {
        embeddingsBase64 = '';
      }
      const claimUrl = `${window.location.origin}/receive?address=${deployedAddr}&amount=${eth}ETH&embeddings=${embeddingsBase64}`;
      const claimLink = document.getElementById('claim-link') as HTMLInputElement;
      const copyLink = document.getElementById('copy-link') as HTMLButtonElement;
      if (claimLink) claimLink.value = claimUrl;
      if (copyLink) {
        copyLink.onclick = function () {
          navigator.clipboard.writeText(claimUrl);
          const copyStatus = document.getElementById('copy-status') as HTMLElement;
          if (copyStatus) {
            copyStatus.classList.remove('hidden');
            setTimeout(() => copyStatus.classList.add('hidden'), 1200);
          }
        };
      }
    } catch (err: any) {
      console.error("Transaction failed to send to blockchain:", err);
      if (sendError) {
        sendError.textContent = 'Transaction failed: ' + (err.message || err);
        sendError.classList.remove('hidden');
      }
    }
  } else {
    console.error("Ethers.js or MetaMask not found.");
    if (sendError) {
      sendError.textContent = 'Ethers.js or MetaMask not found.';
      sendError.classList.remove('hidden');
    }
  }
  };
}
// Enable/disable send button based on ETH input
const ethAmountInputElement = document.getElementById('eth-amount-input') as HTMLInputElement;
if (ethAmountInputElement) {
  ethAmountInputElement.addEventListener('input', function () {
    const eth = parseFloat(this.value);
    const sendEthButton = document.getElementById('send-eth') as HTMLButtonElement;
    if (sendEthButton) {
      sendEthButton.disabled = !(eth > 0 && scanUserAddress);
    }
  });
}
// Show send funds UI after embeddings are generated
// Patch into existing embedding logic
const origShowEmbeddings = function (): void {
  const embeddingsContainer = document.getElementById('embeddings-container') as HTMLElement;
  if (embeddingsContainer) {
    embeddingsContainer.classList.remove('hidden');
  }
  showSendFunds();
};
// Patch: after embeddings are shown, also show send funds
// You may need to call origShowEmbeddings() after embeddings are generated in your flow 
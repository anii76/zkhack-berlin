import pako from 'pako';
import { AES, enc } from 'crypto-js';
import base64url from 'base64url';

// Configuration - modify these values as needed
const CONFIG = {
    // Replace this with your actual embedding data
    embedding: [123, 456, 789, 234, 567, 890, 345, 678, 901, 432, 765, 198, 543, 876, 210, 654, 987, 321, 876, 543],
    // Replace with your actual shared secret
    secret: 'sharedSecret123',
    // Replace with your actual app URL
    baseUrl: 'https://your.app/prove'
};

function compressAndEncryptEmbedding(embedding: number[], secret: string): string {
    // Step 1: Serialize
    const json = JSON.stringify(embedding);
    
    // Step 2: Compress
    const compressed = pako.deflate(json);
    
    // Step 3: Encrypt
    const encrypted = AES.encrypt(enc.Utf8.parse(Buffer.from(compressed).toString('base64')), secret).toString();
    
    // Step 4: Base64url encode
    return base64url.encode(encrypted);
}

function decryptAndDecompressEmbedding(encryptedData: string, secret: string): number[] {
    // Step 4: Base64url decode
    const decoded = base64url.decode(encryptedData);
    
    // Step 3: Decrypt
    const decrypted = AES.decrypt(decoded, secret).toString(enc.Utf8);
    
    // Step 2: Decompress
    const decompressed = pako.inflate(Buffer.from(decrypted, 'base64'), { to: 'string' });
    
    // Step 1: Deserialize
    return JSON.parse(decompressed);
}

async function main() {
    console.log('=== Embedding Compression and Encryption ===\n');
    
    // Compress and encrypt
    const urlSafeData = compressAndEncryptEmbedding(CONFIG.embedding, CONFIG.secret);
    
    // Generate URL
    const url = `${CONFIG.baseUrl}?data=${urlSafeData}`;
    
    // Display results
    console.log('Original embedding length:', CONFIG.embedding.length);
    console.log('Original embedding:', CONFIG.embedding);
    console.log('JSON string length:', JSON.stringify(CONFIG.embedding).length);
    console.log('Compressed and encrypted data length:', urlSafeData.length);
    console.log('\nGenerated URL:');
    console.log(url);
    
    // Test decryption
    console.log('\n=== Testing Decryption ===');
    const reconstructed = decryptAndDecompressEmbedding(urlSafeData, CONFIG.secret);
    console.log('Reconstructed embedding:', reconstructed);
    console.log('Decryption successful:', JSON.stringify(CONFIG.embedding) === JSON.stringify(reconstructed));
    
    // Performance metrics
    const originalSize = JSON.stringify(CONFIG.embedding).length;
    const compressedSize = urlSafeData.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
    console.log(`\nCompression ratio: ${compressionRatio}% (${originalSize} -> ${compressedSize} characters)`);
}

main().catch((error) => {
    console.error('Error:', error);
    process.exitCode = 1;
}); 
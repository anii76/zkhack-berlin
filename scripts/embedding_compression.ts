import pako from 'pako';
import { AES, enc } from 'crypto-js';
import base64url from 'base64url';

async function main() {
    // Step 1: Serialize
    // Create a sample embedding array (you can replace this with your actual data)
    const embedding = [123, 456, 789, 234, 567, 890, 345, 678, 901, 432, 765, 198, 543, 876, 210, 654, 987, 321, 876, 543]; // Quantized.x values
    const json = JSON.stringify(embedding);

    console.log('Original embedding:', embedding);
    console.log('JSON string length:', json.length);

    // Step 2: Compress
    const compressed = pako.deflate(json);
    console.log('Compressed size:', compressed.length);

    // Step 3: Encrypt (using a shared secret)
    const secret = 'sharedSecret123';
    const encrypted = AES.encrypt(enc.Utf8.parse(Buffer.from(compressed).toString('base64')), secret).toString();
    console.log('Encrypted data length:', encrypted.length);

    // Step 4: Base64url encode
    const urlSafe = base64url.encode(encrypted);
    console.log('URL-safe encoded length:', urlSafe.length);

    // Step 5: Generate URL
    const url = `https://your.app/prove?data=${urlSafe}`;
    console.log('Generated URL:', url);

    // Optional: Test decryption to verify the process works
    console.log('\n--- Testing Decryption ---');
    const decoded = base64url.decode(urlSafe);
    const decrypted = AES.decrypt(decoded, secret).toString(enc.Utf8);
    const decompressed = pako.inflate(Buffer.from(decrypted, 'base64'), { to: 'string' });
    const reconstructed = JSON.parse(decompressed);
    console.log('Reconstructed embedding:', reconstructed);
    console.log('Decryption successful:', JSON.stringify(embedding) === JSON.stringify(reconstructed));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();  // To keep API keys secure in .env file

// Load API keys from .env file
const pinataApiKey = "b49970843bfcbfdfb139";  // Replace with your Pinata API Key
const pinataSecretApiKey = "c4cf72f1d0d2de9363c7b90ab2f733b6b3b7ebce83e3be62ab8109db7ff2fe15";  // Replace with your Pinata Secret Key

// Function to upload files to IPFS
async function uploadToIPFS(filePaths) {
    for (const filePath of filePaths) {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            continue;
        }

        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath));

        try {
            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretApiKey,
                    ...formData.getHeaders()
                },
            });

            console.log(`✅ File uploaded: ${filePath}`);
            console.log(`🌍 IPFS Link: https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
        } catch (error) {
            console.error(`❌ Error uploading ${filePath}:`, error.response ? error.response.data : error.message);
        }
    }
}

// List of QR code files to upload
const qrFiles = ["qr1.png", "qr2.png", "qr3.png","qr4.png","qr5.png","qr6.png","qr7.png"]; // Ensure these files exist

uploadToIPFS(qrFiles);

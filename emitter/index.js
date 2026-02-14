const fs = require('fs');
const crypto = require('crypto');
const net = require('net');
const path = require('path');

// Configuration
const CONFIG = {
    host: process.env.LISTENER_HOST || 'localhost',
    port: process.env.LISTENER_PORT || 3000,
    encryptionKey: process.env.ENCRYPTION_KEY || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3', // 32 bytes for AES-256
    ivLength: 16
};

// Load Data
const dataPath = path.join(__dirname, 'data.json');
const rawData = fs.readFileSync(dataPath);
const { names, cities } = JSON.parse(rawData);

// Helper Functions
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateRandomMessage = () => {
    const name = getRandomElement(names);
    const origin = getRandomElement(cities);
    const destination = getRandomElement(cities);

    // Create hash
    const secret_key = crypto.createHash('sha256')
        .update(JSON.stringify({ name, origin, destination }))
        .digest('hex');

    return {
        name,
        origin,
        destination,
        secret_key
    };
};

const encryptMessage = (message) => {
    const iv = crypto.randomBytes(CONFIG.ivLength); // Random IV for each message
    const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(CONFIG.encryptionKey), iv);
    
    const messageString = JSON.stringify(message);
    const encrypted = Buffer.concat([cipher.update(messageString), cipher.final()]);

    // Return IV + Encrypted Data (so listener can decrypt)
    // Format: iv:encryptedData
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Main Logic
const sendDataStream = () => {
    const client = new net.Socket();

    client.connect(CONFIG.port, CONFIG.host, () => {
        console.log(`Connected to listener at ${CONFIG.host}:${CONFIG.port}`);

        const messageCount = Math.floor(Math.random() * (499 - 49 + 1)) + 49;
        const messages = [];

        console.log(`Generating ${messageCount} messages...`);

        for (let i = 0; i < messageCount; i++) {
            const msg = generateRandomMessage();
            const encryptedMsg = encryptMessage(msg) 
            messages.push(encryptedMsg);
        }

        const stream = messages.join('|');
        
        // Send stream
        client.write(stream, () => {
            console.log('Stream sent successfully.');
            client.end(); // Close connection after sending
        });
    });

    client.on('error', (err) => {
        console.error('Connection error:', err.message);
    });

    client.on('close', () => {
        console.log('Connection closed');
    });
};

// Start Emitter
console.log('Starting Emitter Service...');
// Initial run
sendDataStream();
// Interval
setInterval(sendDataStream, 10000); 

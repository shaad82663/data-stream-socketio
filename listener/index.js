const net = require('net');
const mongoose = require('mongoose');
const crypto = require('crypto');
const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const TimeSeries = require('./models/TimeSeries');
const cors = require('cors');
const { decryptMessage, validateMessage } = require('./utils');

// Configuration
const CONFIG = {
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/encrypted_timeseries',
    listenerPort: process.env.LISTENER_PORT || 3000,
    socketPort: process.env.SOCKET_PORT || 3001,
    encryptionKey: process.env.ENCRYPTION_KEY || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3' // Must match Emitter
};

// Setup Express & Socket.io
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity
        methods: ["GET", "POST"]
    }
});

// MongoDB Connection
mongoose.connect(CONFIG.mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Process Stream
const processStream = async (streamData) => {
    const encryptedMessages = streamData.split('|');
    const validMessages = [];
    let total = encryptedMessages.length;
    let validCount = 0;
    
    for (const encryptedMsg of encryptedMessages) {
        if (!encryptedMsg) continue; // Skip empty strings
        
        const decryptedMsg = decryptMessage(encryptedMsg, CONFIG.encryptionKey);
        
        if (decryptedMsg && validateMessage(decryptedMsg)) {
            // Add timestamp
            decryptedMsg.timestamp = new Date();
            validMessages.push(decryptedMsg);
            validCount++;
        }
    }
    
    console.log(`Processed ${total} messages. Valid: ${validCount}`);

    // Emit Real-time Stats
    const successRate = total > 0 ? (validCount / total) * 100 : 0;
    io.emit('data-update', {
        total,
        validCount,
        successRate,
        messages: validMessages
    });

    if (validMessages.length > 0) {
        await saveToDB(validMessages);
    }
};

// Save to DB (Group by Minute)
const saveToDB = async (messages) => {
    try {
        for (const msg of messages) {
            const date = new Date(msg.timestamp);
            date.setSeconds(0);
            date.setMilliseconds(0);
            
            // Upsert document for this minute
            await TimeSeries.findOneAndUpdate(
                { timestamp: date },
                { 
                    $push: { data: msg },
                    $inc: { 
                        'metadata.total_messages': 1, 
                        'metadata.valid_messages': 1 
                    }
                },
                { upsert: true, new: true }
            );
        }
        console.log(`Saved ${messages.length} messages to DB.`);
    } catch (error) {
        console.error('Error saving to DB:', error);
    }
};

// Net Server (Listener)
const netServer = net.createServer((socket) => {
    console.log('Emitter connected');

    socket.on('data', (data) => {
        const streamData = data.toString();
        // console.log('Received stream:', streamData.substring(0, 50) + '...');
        processStream(streamData);
    });

    socket.on('end', () => {
        console.log('Emitter disconnected');
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

netServer.listen(CONFIG.listenerPort, () => {
    console.log(`Listener Service running on TCP port ${CONFIG.listenerPort}`);
});

// Start Socket.io Server
server.listen(CONFIG.socketPort, () => {
    console.log(`Socket.io Server running on port ${CONFIG.socketPort}`);
});

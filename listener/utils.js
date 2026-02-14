const crypto = require('crypto');

// Decrypt Function
const decryptMessage = (encryptedString, encryptionKey) => {
    try {
        const parts = encryptedString.split(':');
        if (parts.length !== 2) return null;

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(encryptionKey), iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        
        return JSON.parse(decrypted.toString());
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return null;
    }
};

// Validate Function
const validateMessage = (message) => {
    if (!message || !message.secret_key) return false;

    const { name, origin, destination, secret_key } = message;
    const computedHash = crypto.createHash('sha256')
        .update(JSON.stringify({ name, origin, destination }))
        .digest('hex');

    return computedHash === secret_key;
};

module.exports = { decryptMessage, validateMessage };

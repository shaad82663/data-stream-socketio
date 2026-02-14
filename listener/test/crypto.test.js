const { expect } = require('chai');
const crypto = require('crypto');
const { decryptMessage, validateMessage } = require('../utils');

describe('Crypto Utils', () => {
    const encryptionKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; // 32 bytes
    const ivLength = 16;

    // Helper to encrypt
    const encryptMessage = (message) => {
        const iv = crypto.randomBytes(ivLength);
        const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(encryptionKey), iv);
        
        const messageString = JSON.stringify(message);
        const encrypted = Buffer.concat([cipher.update(messageString), cipher.final()]);

        return iv.toString('hex') + ':' + encrypted.toString('hex');
    };

    describe('decryptMessage', () => {
        it('should correctly decrypt a valid encrypted string', () => {
            const originalData = { name: 'Test', origin: 'A', destination: 'B' };
            const encrypted = encryptMessage(originalData);
            const decrypted = decryptMessage(encrypted, encryptionKey);

            expect(decrypted).to.deep.equal(originalData);
        });

        it('should return null for invalid format', () => {
            const result = decryptMessage('invalid_string', encryptionKey);
            expect(result).to.be.null;
        });

        it('should return null for incorrect key', () => {
            const originalData = { name: 'Test' };
            const encrypted = encryptMessage(originalData);
            const wrongKey = 'wOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; // Changed first char
            
       // In this case, likely JSON parse error -> returns null
            const result = decryptMessage(encrypted, wrongKey);
            expect(result).to.be.null; 
        });
    });

    describe('validateMessage', () => {
        it('should return true for data with valid hash', () => {
            const data = { name: 'Test', origin: 'A', destination: 'B' };
            const secret_key = crypto.createHash('sha256')
                .update(JSON.stringify(data))
                .digest('hex');
            
            const message = { ...data, secret_key };
            expect(validateMessage(message)).to.be.true;
        });

        it('should return false for data with invalid hash', () => {
            const data = { name: 'Test', origin: 'A', destination: 'B' };
            const secret_key = 'fake_hash';
            
            const message = { ...data, secret_key };
            expect(validateMessage(message)).to.be.false;
        });

        it('should return false if secret_key is missing', () => {
            const message = { name: 'Test', origin: 'A', destination: 'B' };
            expect(validateMessage(message)).to.be.false;
        });

         it('should return false if data is tampered', () => {
             const data = { name: 'Test', origin: 'A', destination: 'B' };
            const secret_key = crypto.createHash('sha256')
                .update(JSON.stringify(data))
                .digest('hex');
            
            // Tamper with data
            const message = { ...data, origin: 'C', secret_key };
            expect(validateMessage(message)).to.be.false;
        });
    });
});

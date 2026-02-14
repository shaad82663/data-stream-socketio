# Encrypted Timeseries App

A real-time data streaming system that handles encrypted messages securely.

## Overview
This application demonstrates a secure data pipeline:
1.  **Emitter**: Generates encrypted random data streams.
2.  **Listener**: Decrypts, validates, and stores data in MongoDB.
3.  **Frontend**: Visualizes the data stream in real-time.

## Quick Start

### 1. Prerequisites
- Node.js (v14+)
- Docker (for MongoDB)

### 2. Setup
Install all dependencies with a single command:
```bash
npm run install:all
```

### 3. Run the Application
You will need three terminal windows:

**Terminal 1: Start Database**
```bash
npm run mongo
```

**Terminal 2: Start Listener Service**
```bash
npm run listener
```

**Terminal 3: Start Emitter Service**
```bash
npm run emitter
```

### 4. View Dashboard
Open `frontend/index.html` in your web browser.

## Testing
To verify the encryption and validation logic:
```bash
npm test
```

# Stellar Privacy Survey DApp - GEMINI Context

## Project Overview
A privacy-first, decentralized survey application on the **Stellar** blockchain. It ensures 100% data privacy via client-side encryption and "Proof of Humanity" via Soroban smart contracts.

### Core Features
- **Fragmented Surveys:** Questionnaires are broken into multiple "Stages" to prevent user exhaustion.
- **On-Chain Progress:** Each stage submission is a separate blockchain transaction, recording a hash of the encrypted response.
- **Privacy-Preserving:** Uses AES-256 encryption before data touches any network.
- **Humanity Verification:** Soroban contract validates "Human-Verified" credentials before allowing submissions.

## Architecture
- **Smart Contract (`contracts/survey/`):** Written in Rust (Soroban). Manages survey registration, stage submissions, and humanity validation.
- **Frontend (`frontend/`):** React/TypeScript application. Integrates with Freighter wallet and handles client-side encryption.

## Building and Running

### Smart Contract
```bash
cd contracts/survey
cargo test # Run logic tests
stellar contract build # Build WASM
```

### Frontend
```bash
cd frontend
npm install
npm run dev # Start local development server
```

## Development Guidelines
- **Contract Keys:** Uses `DataKey` enum for organized instance and persistent storage.
- **Security:** AES keys should be fragmented using Shamir's Secret Sharing in production.
- **Identities:** Leverages SEP-10 for wallet authentication.

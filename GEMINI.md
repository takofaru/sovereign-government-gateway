# Stellar VerifySurvey DApp - GEMINI Context

## Project Overview
A privacy-first, decentralized survey application on the **Stellar** blockchain. It ensures that every respondent is a "real person" using Government ID verification (Proof of Humanity) while keeping user data private via client-side encryption.

### Core Features
- **Identity Verification:** Users must verify their identity using a Government ID before accessing any surveys.
- **Survey Dashboard:** A central hub showing multiple active surveys.
- **On-Chain Proofs:** Each survey submission is recorded on the **Soroban** blockchain as a cryptographic hash linked to a verified identity proof.
- **Client-Side Privacy:** Survey responses are encrypted using AES-256 before being submitted, ensuring only the intended recipient can read them.

## Architecture
- **Smart Contract (`contracts/survey/`):** Soroban contract that handles survey registration, humanity-verified submissions, and prevents double-voting.
- **Frontend (`frontend/`):** React/TypeScript application with Freighter wallet integration, mock Gov ID verification flow, and encryption utilities.

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

## Security & Compliance
- **Data Privacy:** No PII is stored on-chain. Only cryptographic hashes and identity proofs.
- **GDPR/CCPA:** The architecture supports the "Right to Erasure" as off-chain data (encrypted payloads) can be deleted, rendering on-chain hashes useless.

# Stellar VerifySurvey DApp

**Stellar VerifySurvey DApp** - Secure, Private, and Verified Human Feedback.

## Project Description

Stellar VerifySurvey is a decentralized survey application built on the **Stellar** blockchain using **Soroban smart contracts**. It solves the dual challenge of ensuring that every respondent is a "real person" (Proof of Humanity) while maintaining 100% data privacy for the user. 

By requiring a Government ID verification step (simulated) before access, the application ensures high-integrity survey results for organizations, while utilizing client-side AES encryption so that sensitive personal data never touches the blockchain or any server in plaintext.

## Key Features

### 1. **Government ID Identity Verification**
- Users must complete a "Proof of Humanity" step using a Government ID.
- Generates a cryptographic signature from a trusted issuer.
- Only verified real people can access and submit surveys.

### 2. **Survey Dashboard**
- A centralized hub to discover and participate in multiple active surveys.
- Covers diverse topics from corporate feedback to decentralized governance voting.
- Tracks and displays the user's "Verified Human" status.

### 3. **Privacy-First Architecture**
- **Client-Side Encryption:** All survey responses are encrypted using AES-256 in the browser before submission.
- **On-Chain Proofs:** Only the cryptographic hash of the encrypted data is stored on the Soroban blockchain.
- **No PII On-Chain:** Personally Identifiable Information (PII) never touches the ledger, ensuring compliance and security.

### 4. **Soroban Smart Contract Integrity**
- Prevents double-submissions for the same survey.
- Verifies the issuer's signature to confirm the respondent's humanity.
- Provides a permanent, timestamped record of the survey's validity.

## System Architecture

1.  **Identity Verification:** The user uploads a Gov ID (processed locally). A trusted issuer provides a signature confirming the user is a unique human.
2.  **Dashboard:** The user browses available surveys.
3.  **Encrypted Submission:** Upon completion, the frontend encrypts the response, hashes the ciphertext, and submits the hash + humanity proof to the Soroban contract.
4.  **Verification:** The smart contract validates the transaction, ensuring the user is verified and hasn't voted before.

## Technical Requirements

- **Soroban SDK:** For smart contract development.
- **Rust:** The primary programming language for the contract.
- **Node.js & npm:** For the React/TypeScript frontend.
- **Freighter Wallet:** To sign transactions on the Stellar Testnet.

## Getting Started

### 1. Smart Contract
Navigate to the contract directory to build and test:
```bash
cd contracts/survey
cargo test
stellar contract build
```

### 2. Frontend
Install dependencies and start the development server:
```bash
cd frontend
npm install
npm run dev
```
*Note: Ensure your Freighter wallet is set to the Stellar Testnet.*

## Security & Compliance Strategy

- **GDPR/CCPA Compliance:** The architecture inherently supports the "Right to Erasure." Since only hashes are on-chain, deleting the off-chain encrypted data or the decryption keys effectively "deletes" the personal information from the system.
- **Decoupled Identity:** By using specialized Identity Providers (IdPs) for the Gov ID check, the dApp itself never needs to store or manage sensitive government documents.

---

**Stellar VerifySurvey DApp** - Powering High-Integrity Research on the Blockchain.

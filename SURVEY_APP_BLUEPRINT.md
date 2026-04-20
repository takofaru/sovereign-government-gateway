# Privacy-Preserving Stellar Survey Application: Technical Blueprint

## 1. System Architecture: Hybrid Design

To achieve 100% data privacy and verifiable humanity while keeping transaction costs low and ensuring data immutability, we employ a hybrid architecture:

*   **On-Chain (Stellar/Soroban):** Handles identity verification proofs, access control, timestamps, and immutable commitments (hashes) of the survey responses.
*   **Off-Chain (IPFS/Arweave):** Stores the actual encrypted survey data fragments.

### User Flow Diagram

```text
[User] --> 1. SEP-10 Auth --> [Stellar Anchor/Wallet]
  |                                 |
  v                                 v
[Identity Provider] <-- 2. Issuance -- [Verifiable Credential (VC)]
(e.g., Civic, Kleros)                 | "Human-Verified"
                                    |
  +---------------------------------+
  |
  v
3. Survey Frontend (Client-Side)
   a. User fills survey.
   b. Client encrypts data (AES-256).
   c. Client fragments key (Shamir's Secret Sharing).
   d. Client uploads ciphertext to IPFS --> Gets CID (Content Identifier).
   e. Client generates Hash(CID).
   |
   v
4. Soroban Smart Contract
   - User submits Tx: `submit_response(survey_id, user_address, response_hash, zkp_humanity_proof)`
   - Contract verifies proof (or signature from trusted issuer).
   - Contract records timestamp and hash.
   |
   v
[Stellar Ledger] (Immutable Record)
```

---

## 2. Identity Flow (SEP-10 & Verifiable Credentials)

We leverage SEP-10 for authentication and Verifiable Credentials (W3C standard) for "Proof of Humanity" without exposing PII to the smart contract.

**Step-by-Step Logic:**

1.  **Authentication (SEP-10):**
    *   The user connects their Stellar wallet (e.g., Freighter) to the dApp.
    *   The dApp requests an authentication challenge from the backend (WebAuth backend).
    *   The user signs the SEP-10 challenge transaction with their private key.
    *   The backend verifies the signature and issues a JWT session token.

2.  **Credential Issuance (Off-Chain):**
    *   If the user doesn't have a "Human-Verified" VC, they are redirected to a trusted Identity Provider (IdP) that issues credentials on Stellar.
    *   The IdP performs KYC or a Turing test, and if successful, issues a signed VC containing the claim `{"isHuman": true}` tied to the user's Stellar public key.

3.  **Credential Presentation & Verification (On-Chain):**
    *   The user's client generates a Zero-Knowledge Proof (ZKP) or a verifiable presentation of the VC to prove they hold a valid "Human" credential from an accepted issuer, without revealing the underlying PII.
    *   Alternatively, the contract can whitelist specific issuer public keys and verify the issuer's signature on the user's credential during the `submit_response` call.

---

## 3. Smart Contract Logic (Soroban)

Here is the implementation blueprint for the Soroban smart contract.

```rust
#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, Map, Symbol,
};

// Data structures
#[contracttype]
pub struct SurveySubmission {
    pub response_hash: BytesN<32>, // Hash of the IPFS CID
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    TrustedIssuer,
    Survey(u64),                           // survey_id -> SurveyMetadata
    Submission(u64, Address),              // (survey_id, user_address) -> SurveySubmission
}

#[contract]
pub struct SurveyContract;

#[contractimpl]
impl SurveyContract {
    /// Initialize the contract with an admin and a trusted VC issuer
    pub fn init(env: Env, admin: Address, trusted_issuer: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TrustedIssuer, &trusted_issuer);
    }

    /// Registers a new survey instance
    pub fn create_survey(env: Env, survey_id: u64, owner: Address) {
        owner.require_auth();
        // In production, verify owner against admin or whitelist
        env.storage().instance().set(&DataKey::Survey(survey_id), &owner);
    }

    /// Accepts a cryptographic hash of an off-chain survey response and verifies humanity
    pub fn submit_response(
        env: Env,
        survey_id: u64,
        user: Address,
        response_hash: BytesN<32>,
        issuer_signature: BytesN<64>, // Simplified proof: Issuer's signature over the user's address
    ) {
        // 1. Authenticate user
        user.require_auth();

        // 2. Verify the survey exists
        if !env.storage().instance().has(&DataKey::Survey(survey_id)) {
            panic!("Survey does not exist");
        }

        // 3. Verify user's 'Human-Verified' credential
        let issuer: Address = env.storage().instance().get(&DataKey::TrustedIssuer).unwrap();
        Self::verify_humanity(&env, &user, &issuer, &issuer_signature);

        // 4. Check for double submission
        let submission_key = DataKey::Submission(survey_id, user.clone());
        if env.storage().persistent().has(&submission_key) {
            panic!("User has already submitted a response");
        }

        // 5. Store the hash and timestamp
        let submission = SurveySubmission {
            response_hash,
            timestamp: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&submission_key, &submission);
    }

    /// Helper to verify the VC/Signature
    fn verify_humanity(env: &Env, user: &Address, issuer: &Address, signature: &BytesN<64>) {
        // In a real implementation, you would use env.crypto().ed25519_verify()
        // to verify that the `issuer` signed a payload confirming `user` is human.
        // This ensures the user is a verified human before allowing the transaction.
        
        // Example (pseudo-code):
        // let payload = generate_humanity_payload(user);
        // env.crypto().ed25519_verify(&issuer_pub_key, &payload, signature);
    }
}
```

---

## 4. Data Handling: Fragmentation and Encryption

To ensure data remains entirely private and resilient against single points of failure:

1.  **Client-Side AES Encryption:** As soon as the user completes the survey, the client generates a strong, random symmetric key (AES-256-GCM). The survey JSON payload is encrypted locally in the browser.
2.  **Shamir's Secret Sharing (SSS):** The AES decryption key is split using SSS (e.g., a 2-of-3 scheme). 
    *   Share 1: Given to the Survey Creator (encrypted via their public key).
    *   Share 2: Stored in an Escrow Smart Contract or secure enclave.
    *   Share 3: Kept by the User.
    This ensures no single party (not even the decentralized storage network) can decrypt the data without collaboration.
3.  **Decentralized Storage:** The AES-encrypted payload (the ciphertext) is uploaded to IPFS.
4.  **On-Chain Commitment:** The IPFS CID is hashed (SHA-256). This hash is submitted to the Soroban contract via `submit_response`.

---

## 5. Compliance Strategy (GDPR/CCPA Minimization)

This architecture inherently minimizes liability under data protection regulations:

*   **No PII on the Ledger:** The Stellar ledger only stores cryptographic hashes (pseudonymous) and timestamps. No personal data, survey answers, or direct identifiers are recorded on-chain, satisfying the "Right to Erasure" (you cannot delete blockchain data, but you can delete the off-chain data/keys).
*   **Data Controller Minimization:** Because the survey data is client-side encrypted and the key is fragmented before the payload touches any server or IPFS node, you (the dApp provider) act only as a conduit. You cannot access the plaintext data unless you hold the necessary SSS shares.
*   **Off-Chain Deletion:** If a user exercises their Right to be Forgotten, the off-chain encrypted payload on IPFS can be unpinned, or the escrowed AES decryption key shares can be destroyed. Without the key, the ciphertext becomes mathematical noise, effectively "deleting" the data.
*   **Decoupled Identity:** By using Verifiable Credentials, the Identity Provider handles KYC and compliance. The Soroban contract only receives a cryptographic boolean ("Is Human"), transferring the liability of PII storage entirely to specialized, regulated IdPs.

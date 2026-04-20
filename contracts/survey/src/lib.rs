#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, BytesN, Env,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SurveyInfo {
    pub owner: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SurveySubmission {
    pub response_hash: BytesN<32>,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    TrustedIssuer,
    Survey(u64),
    Submission(u64, Address),
}

#[contract]
pub struct SurveyContract;

#[contractimpl]
impl SurveyContract {
    /// Initialize the contract with an admin and a trusted VC issuer
    pub fn init(env: Env, admin: Address, trusted_issuer: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TrustedIssuer, &trusted_issuer);
    }

    /// Registers a new survey instance
    pub fn create_survey(env: Env, survey_id: u64, owner: Address) {
        owner.require_auth();
        if env.storage().instance().has(&DataKey::Survey(survey_id)) {
            panic!("Survey already exists");
        }
        let info = SurveyInfo { owner };
        env.storage().instance().set(&DataKey::Survey(survey_id), &info);
    }

    /// Accepts a cryptographic hash of an off-chain survey response and verifies humanity
    pub fn submit_response(
        env: Env,
        survey_id: u64,
        user: Address,
        response_hash: BytesN<32>,
        _issuer_signature: BytesN<64>, // Mock for Proof of Humanity verification
    ) {
        user.require_auth();

        // 1. Verify survey exists
        let survey_key = DataKey::Survey(survey_id);
        if !env.storage().instance().has(&survey_key) {
            panic!("Survey not found");
        }

        // 2. Verify humanity (Simplified mock)
        // In a real scenario, we would use env.crypto().ed25519_verify(...)
        // to check if the TrustedIssuer signed the user's address confirming humanity.

        // 3. Check for double submission for this survey
        let submission_key = DataKey::Submission(survey_id, user.clone());
        if env.storage().persistent().has(&submission_key) {
            panic!("Survey already submitted by this user");
        }

        // 4. Record submission
        let submission = SurveySubmission {
            response_hash,
            timestamp: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&submission_key, &submission);
    }

    /// Returns submission details for a specific user
    pub fn get_submission(env: Env, survey_id: u64, user: Address) -> SurveySubmission {
        let submission_key = DataKey::Submission(survey_id, user);
        env.storage().persistent().get(&submission_key).expect("Submission not found")
    }
    
    /// Returns survey metadata
    pub fn get_survey_info(env: Env, survey_id: u64) -> SurveyInfo {
        env.storage().instance().get(&DataKey::Survey(survey_id)).expect("Survey not found")
    }
}

mod test;

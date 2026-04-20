#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _};
use soroban_sdk::{Address, BytesN, Env};

#[test]
fn test_survey_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, SurveyContract);
    let client = SurveyContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let user = Address::generate(&env);
    let owner = Address::generate(&env);

    // 1. Init
    client.init(&admin, &issuer);

    // 2. Create Survey
    let survey_id = 1;
    client.create_survey(&survey_id, &owner);

    let info = client.get_survey_info(&survey_id);
    assert_eq!(info.owner, owner);

    // 3. Submit Response
    let response_hash = BytesN::from_array(&env, &[1; 32]);
    let sig = BytesN::from_array(&env, &[0; 64]);
    client.submit_response(&survey_id, &user, &response_hash, &sig);

    let submission = client.get_submission(&survey_id, &user);
    assert_eq!(submission.response_hash, response_hash);
}

#[test]
#[should_panic(expected = "Survey already submitted by this user")]
fn test_duplicate_submission() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, SurveyContract);
    let client = SurveyContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let user = Address::generate(&env);
    client.init(&admin, &issuer);
    client.create_survey(&1, &admin);

    let hash = BytesN::from_array(&env, &[1; 32]);
    let sig = BytesN::from_array(&env, &[0; 64]);
    client.submit_response(&1, &user, &hash, &sig);
    client.submit_response(&1, &user, &hash, &sig);
}

#[test]
#[should_panic(expected = "Survey not found")]
fn test_invalid_survey() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, SurveyContract);
    let client = SurveyContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let user = Address::generate(&env);
    client.init(&admin, &issuer);

    let hash = BytesN::from_array(&env, &[1; 32]);
    let sig = BytesN::from_array(&env, &[0; 64]);
    client.submit_response(&1, &user, &hash, &sig);
}

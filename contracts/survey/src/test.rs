#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _};
use soroban_sdk::{Address, BytesN, Env};

#[test]
fn test_survey_reputation_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SurveyContract, ());
    let client = SurveyContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let user = Address::generate(&env);
    let owner = Address::generate(&env);

    // 1. Init
    client.init(&admin, &issuer);

    // 2. Create Survey requiring reputation 0 (accessible to all)
    let survey_id_1 = 1;
    client.create_survey(&survey_id_1, &owner, &0);

    // 3. User submits response to survey 1
    let response_hash = BytesN::from_array(&env, &[1; 32]);
    let sig = BytesN::from_array(&env, &[0; 64]);
    client.submit_response(&survey_id_1, &user, &response_hash, &sig);

    // 4. Verify user reputation increased to 1
    assert_eq!(client.get_reputation(&user), 1);

    // 5. Create Survey requiring reputation 2 (currently inaccessible to user)
    let survey_id_2 = 2;
    client.create_survey(&survey_id_2, &owner, &2);

    // 6. User attempts to submit to survey 2 and fails
    // We expect a panic with "Insufficient reputation"
}

#[test]
#[should_panic(expected = "Insufficient reputation")]
fn test_insufficient_reputation() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(SurveyContract, ());
    let client = SurveyContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let user = Address::generate(&env);
    client.init(&admin, &issuer);
    client.create_survey(&1, &admin, &2); // Requires 2

    let hash = BytesN::from_array(&env, &[1; 32]);
    let sig = BytesN::from_array(&env, &[0; 64]);
    client.submit_response(&1, &user, &hash, &sig);
}

#[test]
fn test_reputation_progression() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(SurveyContract, ());
    let client = SurveyContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let user = Address::generate(&env);
    client.init(&admin, &issuer);

    let hash = BytesN::from_array(&env, &[1; 32]);
    let sig = BytesN::from_array(&env, &[0; 64]);

    // Survey 1: Req 0
    client.create_survey(&1, &admin, &0);
    client.submit_response(&1, &user, &hash, &sig);
    assert_eq!(client.get_reputation(&user), 1);

    // Survey 2: Req 1
    client.create_survey(&2, &admin, &1);
    client.submit_response(&2, &user, &hash, &sig);
    assert_eq!(client.get_reputation(&user), 2);
}

#[test]
#[should_panic(expected = "Survey already submitted by this user")]
fn test_duplicate_submission() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(SurveyContract, ());
    let client = SurveyContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let user = Address::generate(&env);
    client.init(&admin, &issuer);
    client.create_survey(&1, &admin, &0);

    let hash = BytesN::from_array(&env, &[1; 32]);
    let sig = BytesN::from_array(&env, &[0; 64]);
    client.submit_response(&1, &user, &hash, &sig);
    client.submit_response(&1, &user, &hash, &sig);
}

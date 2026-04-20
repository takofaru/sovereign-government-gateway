#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _}, Address, Env, String, Vec};

#[test]
fn test_notes_flow() {
    let env = Env::default();
    let contract_id = env.register_contract(None, NotesContract);
    let client = NotesContractClient::new(&env, &contract_id);

    // 1. Create a note
    let title = String::from_str(&env, "First Note");
    let content = String::from_str(&env, "Hello Stellar!");
    client.create_note(&title, &content);

    // 2. Get notes
    let notes: Vec<Note> = client.get_notes();
    assert_eq!(notes.len(), 1);
    let note = notes.get(0).unwrap();
    assert_eq!(note.title, title);
    assert_eq!(note.content, content);

    // 3. Delete note
    let note_id = note.id;
    client.delete_note(&note_id);
    assert_eq!(client.get_notes().len(), 0);
}

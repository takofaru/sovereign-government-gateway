#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, String, Symbol, Vec};

// Struktur data yang akan menyimpan notes
#[contracttype]
#[derive(Clone, Debug)]
pub struct Note {
    pub id: u64,
    pub title: String,
    pub content: String,
}

// Storage key untuk data notes
const NOTE_DATA: Symbol = symbol_short!("NOTE_DATA");

#[contract]
pub struct NotesContract;

#[contractimpl]
impl NotesContract {
    // Fungsi untuk mendapatkan semua notes
    pub fn get_notes(env: Env) -> Vec<Note> {
        env.storage()
            .instance()
            .get(&NOTE_DATA)
            .unwrap_or(Vec::new(&env))
    }

    // Fungsi untuk membuat note baru
    pub fn create_note(env: Env, title: String, content: String) -> String {
        let mut notes: Vec<Note> = env.storage()
            .instance()
            .get(&NOTE_DATA)
            .unwrap_or(Vec::new(&env));

        let note = Note {
            id: env.ledger().timestamp(), // Simple ID based on timestamp
            title,
            content,
        };

        notes.push_back(note);
        env.storage().instance().set(&NOTE_DATA, &notes);

        String::from_str(&env, "Notes berhasil ditambahkan")
    }

    // Fungsi untuk menghapus notes berdasarkan id
    pub fn delete_note(env: Env, id: u64) -> String {
        let mut notes: Vec<Note> = env.storage()
            .instance()
            .get(&NOTE_DATA)
            .unwrap_or(Vec::new(&env));

        for i in 0..notes.len() {
            if let Some(note) = notes.get(i) {
                if note.id == id {
                    notes.remove(i);
                    env.storage().instance().set(&NOTE_DATA, &notes);
                    return String::from_str(&env, "Berhasil hapus notes");
                }
            }
        }

        String::from_str(&env, "Notes tidak ditemukan")
    }
}

mod test;
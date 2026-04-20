import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { submitStage } from './contract';

interface SurveyStageProps {
  surveyId: number;
  stageId: number;
  topic: string;
  questions: string[];
  onComplete: () => void;
}

const SurveyStage = ({ surveyId, stageId, topic, questions, onComplete }: SurveyStageProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Client-side AES Encryption (Privacy First)
      const data = JSON.stringify(answers);
      const secretKey = "MOCK_SECRET_KEY"; // In production, this is split with Shamir's Secret Sharing
      const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();

      // 2. Hash the encrypted payload (This is what goes on Stellar)
      const hash = CryptoJS.SHA256(encrypted).toString();

      // 3. Submit to Soroban Contract
      const mockSignature = "0".repeat(128); // Mock Proof-of-Humanity signature
      await submitStage(surveyId, stageId, hash, mockSignature);

      alert(`Stage ${stageId} ("${topic}") submitted successfully!`);
      onComplete();
    } catch (err) {
      console.error(err);
      alert("Submission failed. Ensure you have Freighter connected to Testnet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>Stage {stageId}: {topic}</h3>
      <p>This is a separate session to prevent exhaustion. Complete this fragment at your own pace.</p>
      
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>{q}</label>
          <input 
            type="text" 
            style={{ width: '100%', padding: '8px' }}
            onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
          />
        </div>
      ))}

      <button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        style={{ padding: '10px 20px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}
      >
        {isSubmitting ? "Submitting to Blockchain..." : "Complete Stage & Submit Proof"}
      </button>
    </div>
  );
};

export default SurveyStage;

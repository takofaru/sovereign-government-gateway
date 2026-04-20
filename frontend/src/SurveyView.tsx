import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { submitResponse } from './contract';

interface SurveyViewProps {
  surveyId: number;
  title: string;
  questions: string[];
  issuerSignature: string;
  isSimulation: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

const SurveyView = ({ surveyId, title, questions, issuerSignature, isSimulation, onComplete, onCancel }: SurveyViewProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Client-side AES Encryption
      const data = JSON.stringify(answers);
      const secretKey = "MOCK_SECRET_KEY";
      const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();

      // 2. Hash for Stellar
      const hash = CryptoJS.SHA256(encrypted).toString();

      if (isSimulation) {
        // Simulate contract delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("SIMULATED SUBMISSION:", { surveyId, hash, issuerSignature });
      } else {
        // 3. Submit to Soroban Contract
        await submitResponse(surveyId, hash, issuerSignature);
      }

      alert(`Survey "${title}" submitted successfully! ${isSimulation ? '(SIMULATED)' : ''}`);
      onComplete();
    } catch (err: any) {
      console.error(err);
      alert(`Submission failed: ${err.message || 'Unknown error'}. Please ensure your Freighter is set to TESTNET and has XLM for fees.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '30px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
      <button 
        onClick={onCancel} 
        style={{ float: 'right', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
      >
        ✕ Close
      </button>
      <h2 style={{ color: '#333' }}>{title}</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>Your responses are encrypted locally and linked to your verified identity proof on-chain.</p>
      
      {isSimulation && (
        <div style={{ padding: '10px', background: '#fff3cd', color: '#856404', borderRadius: '4px', marginBottom: '20px', fontSize: '13px', border: '1px solid #ffeeba' }}>
          <b>Simulation Mode:</b> Submissions will be logged to the console but not sent to the blockchain. Use this to test the UI flow without a deployed contract.
        </div>
      )}

      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{q}</label>
          <textarea 
            rows={3}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
          />
        </div>
      ))}

      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          style={{ 
            flex: 1, 
            padding: '12px', 
            background: '#007bff', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isSubmitting ? "Encrypting & Submitting..." : "Submit Verified Response"}
        </button>
        <button 
          onClick={onCancel} 
          style={{ flex: 1, padding: '12px', background: '#e9ecef', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SurveyView;

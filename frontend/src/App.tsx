import { useState } from 'react';
import VerificationView from './VerificationView';
import DashboardView from './DashboardView';
import SurveyView from './SurveyView';
import './App.css';

const MOCK_SURVEYS = [
  { 
    id: 1, 
    title: "Eco-Product Feedback", 
    description: "Help us refine our sustainable product line with verified real user feedback.",
    questions: ["Which eco-friendly feature is most important to you?", "How likely are you to recommend our products?"]
  },
  { 
    id: 2, 
    title: "Governance Proposal #14", 
    description: "Official vote for the decentralized protocol treasury allocation.",
    questions: ["Should we allocate 10% of fees to the developer fund?", "Which project should receive the next ecosystem grant?"]
  },
  { 
    id: 3, 
    title: "Digital Nomad Lifestyle", 
    description: "A research survey on remote work trends for verified humans only.",
    questions: ["How many countries have you worked from in the last 12 months?", "What is your biggest challenge while working remotely?"]
  }
];

type AppState = 'verification' | 'dashboard' | 'survey';

function App() {
  const [appState, setAppState] = useState<AppState>('verification');
  const [issuerSignature, setIssuerSignature] = useState<string | null>(null);
  const [selectedSurveyId, setSelectedSurveyId] = useState<number | null>(null);

  const handleVerify = (signature: string) => {
    setIssuerSignature(signature);
    setAppState('dashboard');
  };

  const handleSelectSurvey = (id: number) => {
    setSelectedSurveyId(id);
    setAppState('survey');
  };

  const selectedSurvey = MOCK_SURVEYS.find(s => s.id === selectedSurveyId);

  return (
    <div className="App" style={{ minHeight: '100vh', padding: '20px', background: '#f8f9fa' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ margin: '0', color: '#333' }}>Stellar VerifySurvey</h1>
          <p style={{ color: '#666' }}>Secure, Private, and Verified Human Feedback</p>
          {issuerSignature && (
            <div style={{ display: 'inline-block', marginTop: '10px', padding: '4px 12px', background: '#d4edda', color: '#155724', borderRadius: '20px', fontSize: '12px' }}>
              ✓ Verified Real Person
            </div>
          )}
        </header>

        <main>
          {appState === 'verification' && (
            <VerificationView onVerify={handleVerify} />
          )}

          {appState === 'dashboard' && (
            <DashboardView surveys={MOCK_SURVEYS} onSelect={handleSelectSurvey} />
          )}

          {appState === 'survey' && selectedSurvey && issuerSignature && (
            <SurveyView 
              surveyId={selectedSurvey.id}
              title={selectedSurvey.title}
              questions={selectedSurvey.questions}
              issuerSignature={issuerSignature}
              onComplete={() => setAppState('dashboard')}
              onCancel={() => setAppState('dashboard')}
            />
          )}
        </main>

        <footer style={{ marginTop: '60px', textAlign: 'center', fontSize: '12px', color: '#999', borderTop: '1px solid #ddd', padding: '20px' }}>
          Powered by Soroban Smart Contracts. All PII stays local. Only encrypted proofs on-chain.
        </footer>
      </div>
    </div>
  );
}

export default App;

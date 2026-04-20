import { useState, useEffect } from 'react';
import { isConnected, getAddress, setAllowed, getNetworkDetails } from '@stellar/freighter-api';
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
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isSimulation, setIsSimulation] = useState<boolean>(true); // Default to simulation for UI walkthrough

  const checkConnection = async (prompt: boolean = false) => {
    try {
      const connected = await isConnected();
      if (connected && connected.isConnected) {
        if (prompt) {
          await setAllowed();
        }
        
        const addressObj = await getAddress();
        if (addressObj && addressObj.address) {
          setUserAddress(addressObj.address);
          setWalletError(null);
          
          const netDetails = await getNetworkDetails();
          setNetwork(netDetails.network);
          if (netDetails.network !== "TESTNET") {
            setWalletError("Freighter is not set to TESTNET. Please switch networks.");
          }
        } else {
          setWalletError("Account not found. Ensure your wallet is unlocked.");
        }
      } else {
        setWalletError("Freighter extension not found.");
      }
    } catch (err: any) {
      console.error(err);
      setWalletError(`Failed to connect: ${err.message || 'Unknown error'}`);
    }
  };

  useEffect(() => {
    checkConnection(false);
  }, []);

  const handleVerify = (signature: string) => {
    if (!userAddress && !isSimulation) {
      alert("Please connect your Freighter wallet first.");
      return;
    }
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
          
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', color: '#666', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isSimulation} 
                  onChange={() => setIsSimulation(!isSimulation)} 
                  style={{ marginRight: '5px' }}
                />
                Enable Simulation Mode (No Live Contract)
              </label>
            </div>

            {userAddress ? (
              <div style={{ display: 'inline-block', padding: '12px 24px', background: '#e9ecef', borderRadius: '8px', fontSize: '14px', border: '1px solid #ddd' }}>
                <div><b>Address:</b> {userAddress.slice(0, 8)}...{userAddress.slice(-6)}</div>
                <div style={{ marginTop: '5px', color: network === "TESTNET" ? "#28a745" : "#dc3545" }}>
                  <b>Network:</b> {network || "Unknown"}
                </div>
                {issuerSignature && (
                  <div style={{ marginTop: '5px', color: '#28a745' }}>✓ Verified Human</div>
                )}
                <button 
                  onClick={() => checkConnection(true)}
                  style={{ marginTop: '10px', fontSize: '12px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Refresh Connection
                </button>
              </div>
            ) : (
              <button 
                onClick={() => checkConnection(true)}
                style={{ padding: '12px 24px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
              >
                Connect Freighter Wallet
              </button>
            )}
            
            {walletError && !isSimulation && (
              <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '15px', padding: '10px', background: '#fff5f5', borderRadius: '4px', border: '1px solid #ffc9c9' }}>
                {walletError} <br/>
                <a href="https://laboratory.stellar.org/#account-creator?network=testnet" target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>Fund your account here</a>
              </div>
            )}
          </div>
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
              isSimulation={isSimulation}
              onComplete={() => setAppState('dashboard')}
              onCancel={() => setAppState('dashboard')}
            />
          )}
        </main>

        <footer style={{ marginTop: '60px', textAlign: 'center', fontSize: '12px', color: '#999', borderTop: '1px solid #ddd', padding: '20px' }}>
          Powered by Soroban. Simulation Mode is {isSimulation ? 'ON' : 'OFF'}.
        </footer>
      </div>
    </div>
  );
}

export default App;

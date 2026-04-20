import { useState } from 'react';

interface VerificationViewProps {
  onVerify: (signature: string) => void;
}

const VerificationView = ({ onVerify }: VerificationViewProps) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate Gov ID verification process
    setTimeout(() => {
      const mockSignature = "0".repeat(128); // Mock Proof-of-Humanity signature from trusted issuer
      setIsVerifying(false);
      onVerify(mockSignature);
    }, 2000);
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2>Identity Verification</h2>
      <p>To ensure surveys are conducted by real people, please verify your identity using a Government ID.</p>
      <div style={{ margin: '30px 0', padding: '40px', border: '2px dashed #ccc', borderRadius: '8px' }}>
        <p>Drop your ID photo here or click to upload</p>
        <input type="file" style={{ display: 'none' }} id="gov-id-upload" />
        <label htmlFor="gov-id-upload" style={{ cursor: 'pointer', color: '#007bff' }}>Browse Files</label>
      </div>
      <button 
        onClick={handleVerify} 
        disabled={isVerifying}
        style={{ padding: '12px 24px', fontSize: '16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {isVerifying ? "Verifying..." : "Confirm & Verify Identity"}
      </button>
      <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>Your ID is processed locally. We only store a cryptographic proof on the blockchain.</p>
    </div>
  );
};

export default VerificationView;

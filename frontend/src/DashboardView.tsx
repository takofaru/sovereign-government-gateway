interface SurveyMetadata {
  id: number;
  title: string;
  description: string;
}

interface DashboardViewProps {
  surveys: SurveyMetadata[];
  onSelect: (id: number) => void;
}

const DashboardView = ({ surveys, onSelect }: DashboardViewProps) => {
  return (
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2>Available Surveys</h2>
        <p>Verified account. Choose a survey and share your feedback securely.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {surveys.map((s) => (
          <div 
            key={s.id} 
            style={{ 
              padding: '24px', 
              background: '#fff', 
              border: '1px solid #eee', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onClick={() => onSelect(s.id)}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{s.title}</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>{s.description}</p>
            <span style={{ fontSize: '12px', background: '#e9ecef', padding: '4px 8px', borderRadius: '4px' }}>On-Chain Protected</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardView;

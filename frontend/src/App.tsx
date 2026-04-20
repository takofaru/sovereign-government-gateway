import { useState } from 'react';
import SurveyStage from './SurveyStage';
import './App.css';

const SURVEYS = [
  {
    id: 1,
    stages: [
      { id: 1, topic: "User Experience Foundations", questions: ["How often do you use dApps?", "What is your primary wallet?"] },
      { id: 2, topic: "Security Awareness", questions: ["Do you use hardware wallets?", "How do you store your seed phrases?"] },
      { id: 3, topic: "Future Expectations", questions: ["What feature is missing in Stellar?", "Rate your interest in Soroban (1-10)"] },
    ]
  }
];

function App() {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const survey = SURVEYS[0];
  const allStagesCompleted = currentStageIdx >= survey.stages.length;

  return (
    <div className="App" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
      <header>
        <h1>Stellar Privacy Survey</h1>
        <p>A multi-stage, fragmented survey application powered by <b>Soroban</b>.</p>
      </header>

      {!allStagesCompleted ? (
        <>
          <div style={{ marginBottom: '20px', background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
            <strong>Progress:</strong> Stage {currentStageIdx + 1} of {survey.stages.length}
            <div style={{ width: '100%', background: '#eee', height: '10px', borderRadius: '5px', marginTop: '5px' }}>
              <div style={{ width: `${((currentStageIdx + 1) / survey.stages.length) * 100}%`, background: '#28a745', height: '100%', borderRadius: '5px' }}></div>
            </div>
          </div>

          <SurveyStage 
            surveyId={survey.id}
            stageId={survey.stages[currentStageIdx].id}
            topic={survey.stages[currentStageIdx].topic}
            questions={survey.stages[currentStageIdx].questions}
            onComplete={() => setCurrentStageIdx(currentStageIdx + 1)}
          />
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', background: '#e9ecef', borderRadius: '8px' }}>
          <h2>Survey Complete! 🎉</h2>
          <p>Thank you for your responses. Every stage has been independently verified on the Stellar network.</p>
        </div>
      )}
    </div>
  );
}

export default App;

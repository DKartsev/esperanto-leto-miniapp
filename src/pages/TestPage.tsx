import { useState } from 'react';
import TestIntro from '../components/TestIntro';
import TestInterface, { type TestResults as FullTestResults } from '../components/TestInterface';
import TestResults from '../components/TestResults';
import { saveTestResults } from '../services/progressService';
import { useAuth } from '../components/SupabaseAuthProvider';

const TestPage = () => {
  const [testView, setTestView] = useState<'intro' | 'test' | 'results'>('intro');
  const [testResults, setTestResults] = useState<FullTestResults | null>(null);
  const { profile, refreshStats } = useAuth();

  const handleStartTest = () => {
    setTestView('test');
  };

  const handleTestComplete = async (results: FullTestResults) => {
    setTestResults(results);
    const correct = results.answers?.filter(a => a.isCorrect).length || 0;
    const total = results.totalQuestions || 1;
    const timeSpent = results.timeSpent || 0;
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
      try {
        await saveTestResults(0, 0, correct, total, timeSpent);
        await refreshStats();
      } catch (err) {
        console.error('Error saving progress', err);
      }
    }
    setTestView('results');
  };

  const handleRetakeTest = () => {
    setTestView('intro');
    setTestResults(null);
  };

  const handleBackFromTest = () => {
    setTestView('intro');
    setTestResults(null);
  };

  switch (testView) {
    case 'intro':
      return <TestIntro onStartTest={handleStartTest} />;
    case 'test':
      return <TestInterface onComplete={handleTestComplete} onBack={handleBackFromTest} />;
    case 'results':
      return <TestResults results={testResults!} onSaveResults={() => {}} onRetakeTest={handleRetakeTest} />;
    default:
      return null;
  }
};

export default TestPage;

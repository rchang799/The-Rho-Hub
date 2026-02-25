import { useState } from 'react';
import { evaluateAnswer } from '../services/geminiService';
import Markdown from 'react-markdown';

const starQuestions = [
  "Tell me about a time you had to work with a difficult team member.",
  "Describe a situation where you had to take initiative and lead a project.",
  "Give an example of a time you faced a major setback and how you handled it.",
  "Tell me about a time you had to persuade someone to see your point of view.",
  "Describe a complex problem you solved and the steps you took.",
  "Give an example of a time you went above and beyond the requirements of a project.",
  "Tell me about a time you made a mistake and what you learned from it.",
  "Describe a situation where you had to manage conflicting priorities.",
  "Give an example of a time you had to adapt to a significant change at work or school.",
  "Tell me about a time you worked on a team and had to compromise.",
  "Describe a time you received difficult feedback and how you responded."
];

export default function ProCoach() {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startInterview = () => {
    setIsInterviewActive(true);
    setCurrentQuestionIndex(0);
    setAnswer('');
    setFeedback('');
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setIsLoading(true);
    const question = starQuestions[currentQuestionIndex];
    const evaluation = await evaluateAnswer(question, answer);
    setFeedback(evaluation);
    setIsLoading(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < starQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer('');
      setFeedback('');
    } else {
      // End of interview
      setIsInterviewActive(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Pro-Coach</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        {!isInterviewActive ? (
          <div>
            <p className="text-slate-600 mb-4">Practice your interview skills with our AI-powered Pro-Coach. Get instant feedback on your STAR method responses.</p>
            <button 
              onClick={startInterview}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start Mock Interview
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Question {currentQuestionIndex + 1} of {starQuestions.length}</h3>
            <p className="text-slate-700 mb-4 font-medium">{starQuestions[currentQuestionIndex]}</p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Your answer..."
              disabled={isLoading || !!feedback}
            />
            <div className="mt-4 flex space-x-4">
              <button 
                onClick={handleSubmitAnswer}
                disabled={isLoading || !answer.trim() || !!feedback}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Evaluating...' : 'Submit Answer'}
              </button>
              {feedback && (
                <button 
                  onClick={handleNextQuestion}
                  className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {currentQuestionIndex < starQuestions.length - 1 ? 'Next Question' : 'Finish Interview'}
                </button>
              )}
            </div>
            {feedback && (
              <div className="mt-6 p-4 border-t border-slate-200">
                <h4 className="text-lg font-bold text-slate-800 mb-2">Feedback:</h4>
                <div className="prose prose-slate max-w-none">
                  <Markdown>{feedback}</Markdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

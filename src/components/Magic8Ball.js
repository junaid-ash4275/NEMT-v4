import React, { useState } from 'react';

const Magic8Ball = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const answers = [
    "It is certain.",
    "It is decidedly so.",
    "Without a doubt.",
    "Yes - definitely.",
    "You may rely on it.",
    "As I see it, yes.",
    "Most likely.",
    "Outlook good.",
    "Yes.",
    "Signs point to yes.",
    "Reply hazy, try again.",
    "Ask again later.",
    "Better not tell you now.",
    "Cannot predict now.",
    "Concentrate and ask again.",
    "Don't count on it.",
    "My reply is no.",
    "My sources say no.",
    "Outlook not so good.",
    "Very doubtful."
  ];

  const askQuestion = () => {
    if (!question.trim()) return;

    setIsShaking(true);
    setAnswer('');
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * answers.length);
      setAnswer(answers[randomIndex]);
      setIsShaking(false);
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center min-h-[400px] p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-10 rounded-xl max-w-md w-full text-center shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
          Magic 8 Ball
        </h2>

        <div className="mb-6">
          <input
            type="text"
            className="w-full p-3 border-2 border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300"
            placeholder="Ask a yes/no question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
          />
        </div>

        <div 
          className={`mx-auto mb-8 w-48 h-48 bg-gray-900 rounded-full flex items-center justify-center shadow-inner relative transition-transform duration-100 ${isShaking ? 'animate-bounce' : ''}`}
          style={isShaking ? { transform: 'rotate(10deg)' } : {}}
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center relative overflow-hidden transform rotate-45">
               <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-800 opacity-50"></div>
               <div className="transform -rotate-45 text-center px-1 z-10">
                 {answer ? (
                   <span className="text-white text-xs font-bold leading-tight block drop-shadow-md">
                     {answer}
                   </span>
                 ) : (
                   <span className="text-white text-4xl font-bold font-serif opacity-80">
                     8
                   </span>
                 )}
               </div>
            </div>
          </div>
        </div>

        <button
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none py-3 px-8 text-base font-semibold rounded-full cursor-pointer transition-all duration-300 uppercase tracking-wider hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-400/50 active:transform-none disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={askQuestion}
          disabled={!question.trim() || isShaking}
        >
          {isShaking ? 'Thinking...' : 'Ask the 8 Ball'}
        </button>
      </div>
    </div>
  );
};

export default Magic8Ball;

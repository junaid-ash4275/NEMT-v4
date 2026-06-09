import React, { useState, useEffect } from 'react';

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation",
  "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat",
  "duis", "aute", "irure", "reprehenderit", "in", "voluptate", "velit", "esse",
  "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat",
  "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt",
  "mollit", "anim", "id", "est", "laborum"
];

const LoremIpsumGenerator = () => {
  const [count, setCount] = useState(3);
  const [type, setType] = useState('paragraphs');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const generateWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

  const generateSentence = () => {
    const wordCount = Math.floor(Math.random() * 10) + 5;
    let sentence = [];
    for (let i = 0; i < wordCount; i++) {
      sentence.push(generateWord());
    }
    let res = sentence.join(' ') + '.';
    return res.charAt(0).toUpperCase() + res.slice(1);
  };

  const generateParagraph = () => {
    const sentenceCount = Math.floor(Math.random() * 5) + 3;
    let paragraph = [];
    for (let i = 0; i < sentenceCount; i++) {
      paragraph.push(generateSentence());
    }
    return paragraph.join(' ');
  };

  const handleGenerate = () => {
    let result = [];
    let parsedCount = parseInt(count, 10);
    if (isNaN(parsedCount) || parsedCount <= 0) parsedCount = 1;
    if (parsedCount > 100) parsedCount = 100; // max limit

    for (let i = 0; i < parsedCount; i++) {
      if (type === 'words') {
        result.push(generateWord());
      } else if (type === 'sentences') {
        result.push(generateSentence());
      } else {
        result.push(generateParagraph());
      }
    }

    if (type === 'words') {
      setText(result.join(' '));
    } else if (type === 'sentences') {
      setText(result.join(' '));
    } else {
      setText(result.join('\n\n'));
    }
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate initial text
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-xl max-w-3xl w-full shadow-2xl border border-white/20">
        <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent text-center">
          Lorem Ipsum Generator
        </h2>

        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-semibold">Count:</label>
            <input 
              type="number" 
              min="1" 
              max="100"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-20 border-2 border-gray-200 rounded-md p-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-semibold">Type:</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border-2 border-gray-200 rounded-md p-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-2 px-6 rounded-md hover:opacity-90 transition-opacity shadow-md active:scale-95"
          >
            Generate
          </button>
        </div>

        <div className="relative group">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[200px] max-h-[400px] overflow-y-auto font-serif text-gray-700 leading-relaxed whitespace-pre-wrap shadow-inner selection:bg-purple-200">
            {text}
          </div>
          <button 
            onClick={handleCopy}
            className={`absolute top-4 right-4 border p-2 rounded-md shadow-sm transition-all focus:outline-none flex items-center gap-2 ${
              copied 
                ? 'bg-green-100 border-green-300 text-green-700' 
                : 'bg-white border-gray-200 text-gray-600 hover:text-purple-600 hover:bg-gray-50 opacity-0 group-hover:opacity-100'
            }`}
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold">Copied!</span>
              </>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoremIpsumGenerator;

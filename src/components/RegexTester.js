import React, { useState, useEffect } from 'react';

const RegexTester = () => {
  const [regex, setRegex] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!regex) {
      setMatches([]);
      setError(null);
      return;
    }

    try {
      const re = new RegExp(regex, flags);
      const newMatches = [];
      let match;
      
      if (re.global) {
        while ((match = re.exec(testString)) !== null) {
          newMatches.push({
            value: match[0],
            index: match.index,
          });
          // Prevent infinite loop if regex matches empty string
          if (match.index === re.lastIndex) {
            re.lastIndex++;
          }
        }
      } else {
        match = re.exec(testString);
        if (match) {
          newMatches.push({
            value: match[0],
            index: match.index,
          });
        }
      }
      
      setMatches(newMatches);
      setError(null);
    } catch (err) {
      setError(err.message);
      setMatches([]);
    }
  }, [regex, flags, testString]);

  // Highlighting logic
  const renderHighlightedText = () => {
    if (!testString || matches.length === 0 || error) return <div className="p-4 text-gray-500 italic">No matches found or empty test string.</div>;

    let lastIndex = 0;
    const elements = [];

    matches.forEach((match, i) => {
      // Add text before match
      if (match.index > lastIndex) {
        elements.push(<span key={`text-${i}`}>{testString.substring(lastIndex, match.index)}</span>);
      }
      
      // Add highlighted match
      elements.push(
        <span key={`match-${i}`} className="bg-indigo-200 text-indigo-900 font-medium rounded px-1 border-b-2 border-indigo-500 shadow-sm transition-all hover:bg-indigo-300">
          {match.value}
        </span>
      );
      
      lastIndex = match.index + match.value.length;
    });

    // Add remaining text
    if (lastIndex < testString.length) {
      elements.push(<span key="text-end">{testString.substring(lastIndex)}</span>);
    }

    return <div className="p-4 whitespace-pre-wrap font-mono text-gray-800 leading-relaxed">{elements}</div>;
  };

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-3xl w-full shadow-2xl transition-all duration-300 border border-white/20 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent mb-3 drop-shadow-sm">
            Regex Tester
          </h2>
          <p className="text-gray-500 text-sm font-medium">
            Test regular expressions in real-time with syntax highlighting
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Regular Expression</label>
              <div className="flex bg-gray-50 rounded-xl border-2 border-indigo-100 overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                <span className="flex items-center px-4 bg-gray-100 text-gray-500 font-mono text-lg border-r border-indigo-100">/</span>
                <input
                  type="text"
                  value={regex}
                  onChange={(e) => setRegex(e.target.value)}
                  placeholder="pattern"
                  className="w-full p-3 font-mono text-gray-800 bg-transparent focus:outline-none"
                />
                <span className="flex items-center px-4 bg-gray-100 text-gray-500 font-mono text-lg border-l border-indigo-100">/</span>
              </div>
            </div>
            
            <div className="w-full md:w-32">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Flags</label>
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="g, i, m..."
                className="w-full p-3 rounded-xl font-mono text-gray-800 bg-gray-50 border-2 border-indigo-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-center"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm font-medium animate-pulse">
              Invalid Regular Expression: {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Test String</label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test your regex against..."
              className="w-full p-4 rounded-xl font-mono text-gray-800 bg-gray-50 border-2 border-indigo-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all min-h-[120px] resize-y"
            ></textarea>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-sm font-bold text-gray-700">Match Results</label>
              <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                {matches.length} {matches.length === 1 ? 'match' : 'matches'}
              </span>
            </div>
            <div className="w-full rounded-xl bg-gray-50 border-2 border-gray-100 min-h-[120px] overflow-hidden shadow-inner">
              {renderHighlightedText()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;

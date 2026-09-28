import React, { useState, useEffect } from 'react';

const RegexTester = () => {
  const [regex, setRegex] = useState('[A-Z]\\w+');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('Hello World, this is a Regex Test!');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [highlightedText, setHighlightedText] = useState([]);

  useEffect(() => {
    try {
      if (!regex) {
        setMatches([]);
        setError('');
        setHighlightedText([{ text: testString, isMatch: false }]);
        return;
      }

      const re = new RegExp(regex, flags);
      setError('');

      let match;
      const newMatches = [];
      let lastIndex = 0;
      const parts = [];

      // Create a new regex for iteration to avoid infinite loops if missing 'g' flag
      const iterRe = new RegExp(regex, flags.includes('g') ? flags : flags + 'g');

      while ((match = iterRe.exec(testString)) !== null) {
        if (match[0].length === 0) {
            iterRe.lastIndex++;
            continue; // Prevent infinite loops on zero-length matches
        }
        newMatches.push(match);

        // Add non-matching part
        if (match.index > lastIndex) {
          parts.push({
            text: testString.substring(lastIndex, match.index),
            isMatch: false,
          });
        }

        // Add matching part
        parts.push({
          text: match[0],
          isMatch: true,
        });

        lastIndex = match.index + match[0].length;

        if (!flags.includes('g')) break; // Only first match if no 'g' flag
      }

      // Add remaining text
      if (lastIndex < testString.length) {
        parts.push({
          text: testString.substring(lastIndex),
          isMatch: false,
        });
      }

      setMatches(newMatches);
      setHighlightedText(parts.length > 0 ? parts : [{ text: testString, isMatch: false }]);
      
    } catch (err) {
      setError(err.message);
      setMatches([]);
      setHighlightedText([{ text: testString, isMatch: false }]);
    }
  }, [regex, flags, testString]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
          🔍 Developer Tool
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Regex <span className="text-blue-600">Tester</span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
          Write and test regular expressions in real-time with syntax highlighting.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col gap-6">
        {/* Regular Expression Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Regular Expression</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow flex items-stretch">
              <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-lg font-mono">
                /
              </span>
              <input
                type="text"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
                className="flex-grow p-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-lg text-gray-800"
                placeholder="Enter regex here..."
              />
              <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-lg font-mono">
                /
              </span>
            </div>
            <div className="flex-shrink-0 relative w-full sm:w-24">
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-lg text-center"
                placeholder="Flags"
              />
              <div className="absolute -top-6 left-0 text-xs text-gray-500 font-semibold">Flags (g,i,m)</div>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
        </div>

        {/* Test String Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Test String</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-base text-gray-800 min-h-[120px] resize-y"
            placeholder="Enter text to test your regex against..."
          />
        </div>

        {/* Highlighted Results */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Match Results</label>
          <div className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 font-mono text-base text-gray-800 min-h-[120px] whitespace-pre-wrap break-words">
            {highlightedText.map((part, i) => (
              <span
                key={i}
                className={part.isMatch ? "bg-blue-200 text-blue-900 rounded px-0.5 border-b-2 border-blue-400" : ""}
              >
                {part.text}
              </span>
            ))}
            {!testString && <span className="text-gray-400 italic">Enter some text above to see matches...</span>}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;

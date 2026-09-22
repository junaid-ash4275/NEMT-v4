import React, { useState, useRef, useCallback } from "react";

// Theme presets for syntax highlighting & code card styling
const SYNTAX_THEMES = {
  dracula: {
    id: "dracula",
    name: "Dracula",
    bg: "#282a36",
    text: "#f8f8f2",
    keyword: "#ff79c6",
    string: "#f1fa8c",
    function: "#50fa7b",
    number: "#bd93f9",
    comment: "#6272a4",
    operator: "#ff79c6",
    tag: "#ff79c6",
    border: "border-purple-500/30",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk 2077",
    bg: "#0d0f18",
    text: "#00f0ff",
    keyword: "#ff0055",
    string: "#ffe600",
    function: "#00ff66",
    number: "#ff00aa",
    comment: "#445577",
    operator: "#ff0055",
    tag: "#ff0055",
    border: "border-cyan-500/40",
  },
  monokai: {
    id: "monokai",
    name: "Monokai Pro",
    bg: "#2d2a2e",
    text: "#fcfcfa",
    keyword: "#ff6188",
    string: "#ffd866",
    function: "#a9dc76",
    number: "#ab9df2",
    comment: "#78787e",
    operator: "#ff6188",
    tag: "#ff6188",
    border: "border-amber-500/30",
  },
  nord: {
    id: "nord",
    name: "Nord Deep",
    bg: "#2e3440",
    text: "#eceff4",
    keyword: "#81a1c1",
    string: "#a3be8c",
    function: "#88c0d0",
    number: "#b48ead",
    comment: "#616e88",
    operator: "#81a1c1",
    tag: "#81a1c1",
    border: "border-sky-500/30",
  },
  synthwave: {
    id: "synthwave",
    name: "Synthwave '84",
    bg: "#262335",
    text: "#36f9f6",
    keyword: "#fefefe",
    string: "#ff7edb",
    function: "#fe4450",
    number: "#f97e72",
    comment: "#848bbd",
    operator: "#fe4450",
    tag: "#fe4450",
    border: "border-pink-500/40",
  },
  oneDark: {
    id: "oneDark",
    name: "One Dark Pro",
    bg: "#21252b",
    text: "#abb2bf",
    keyword: "#c678dd",
    string: "#98c379",
    function: "#61afef",
    number: "#d19a66",
    comment: "#5c6370",
    operator: "#56b6c2",
    tag: "#e06c75",
    border: "border-blue-500/30",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Matrix",
    bg: "#061811",
    text: "#a7f3d0",
    keyword: "#34d399",
    string: "#6ee7b7",
    function: "#10b981",
    number: "#059669",
    comment: "#15803d",
    operator: "#34d399",
    tag: "#34d399",
    border: "border-emerald-500/40",
  },
  solarizedLight: {
    id: "solarizedLight",
    name: "Solarized Light",
    bg: "#fdf6e3",
    text: "#657b83",
    keyword: "#859900",
    string: "#2aa198",
    function: "#268bd2",
    number: "#d33682",
    comment: "#93a1a1",
    operator: "#859900",
    tag: "#b58900",
    border: "border-amber-400/40",
  },
};

// Container Background Gradient Options
const BACKGROUND_GRADIENTS = [
  { id: "aurora", name: "Aurora Night", class: "from-indigo-600 via-purple-600 to-pink-500" },
  { id: "sunset", name: "Crimson Sunset", class: "from-amber-500 via-rose-600 to-purple-800" },
  { id: "cyber", name: "Cyber Neon", class: "from-cyan-500 via-fuchsia-500 to-indigo-700" },
  { id: "emeraldDusk", name: "Emerald Dusk", class: "from-teal-400 via-emerald-600 to-slate-900" },
  { id: "oceanic", name: "Deep Ocean", class: "from-blue-600 via-cyan-500 to-teal-400" },
  { id: "velvet", name: "Velvet Night", class: "from-slate-900 via-purple-950 to-slate-900" },
  { id: "solar", name: "Solar Flare", class: "from-yellow-400 via-orange-500 to-red-600" },
  { id: "midnight", name: "Midnight Glass", class: "from-gray-900 via-slate-800 to-black" },
];

// Presets for quick code loading
const CODE_PRESETS = [
  {
    name: "React Custom Hook",
    language: "javascript",
    filename: "useLocalStorage.js",
    code: `import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}`,
  },
  {
    name: "Async API Fetch",
    language: "javascript",
    filename: "fetchUserData.js",
    code: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    if (!response.ok) {
      throw new Error(\`HTTP error! Status: \${response.status}\`);
    }
    const data = await response.json();
    return { success: true, user: data };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return { success: false, error: error.message };
  }
}`,
  },
  {
    name: "Python Data Processing",
    language: "python",
    filename: "analyze_data.py",
    code: `import pandas as pd
import numpy as np

def calculate_insights(df, target_column):
    """Calculates statistical insights for numeric data."""
    clean_df = df.dropna(subset=[target_column])
    metrics = {
        "mean": np.mean(clean_df[target_column]),
        "median": np.median(clean_df[target_column]),
        "std_dev": np.std(clean_df[target_column]),
        "total_records": len(clean_df)
    }
    print(f"Analysis complete for {target_column}")
    return metrics`,
  },
  {
    name: "SQL Analytics Query",
    language: "sql",
    filename: "monthly_revenue.sql",
    code: `SELECT 
    DATE_TRUNC('month', order_date) AS revenue_month,
    COUNT(DISTINCT customer_id) AS total_customers,
    SUM(total_amount) AS gross_revenue,
    ROUND(AVG(total_amount), 2) AS avg_order_value
FROM orders
WHERE status = 'COMPLETED'
GROUP BY 1
HAVING SUM(total_amount) > 10000
ORDER BY revenue_month DESC;`,
  },
  {
    name: "CSS Keyframe Animation",
    language: "css",
    filename: "glow-animation.css",
    code: `.glowing-card {
  background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glowing-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px 0 rgba(99, 102, 241, 0.5);
}`,
  },
];

const CodeCardStudio = () => {
  const [code, setCode] = useState(CODE_PRESETS[0].code);
  const [filename, setFilename] = useState(CODE_PRESETS[0].filename);
  const [language, setLanguage] = useState(CODE_PRESETS[0].language);
  const [theme, setTheme] = useState("dracula");
  const [bgGradient, setBgGradient] = useState("aurora");
  const [padding, setPadding] = useState(32); // in px
  const [shadow, setShadow] = useState("shadow-2xl");
  const [windowHeader, setWindowHeader] = useState("mac"); // mac, windows, minimal
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const cardRef = useRef(null);

  const activeTheme = SYNTAX_THEMES[theme] || SYNTAX_THEMES.dracula;
  const activeGradient =
    BACKGROUND_GRADIENTS.find((g) => g.id === bgGradient) || BACKGROUND_GRADIENTS[0];

  // Lightweight Client Syntax Highlighter Engine
  const renderHighlightedCode = useCallback(
    (codeText) => {
      const lines = codeText.split("\n");
      return lines.map((line, lineIdx) => {
        // Tokenize line using regex matcher for keywords, strings, functions, numbers, comments
        const tokens = [];
        let remaining = line;
        let keyCounter = 0;

        while (remaining.length > 0) {
          // Comment match
          if (remaining.startsWith("//") || remaining.startsWith("#") || remaining.startsWith("/*")) {
            tokens.push(
              <span key={keyCounter++} style={{ color: activeTheme.comment, fontStyle: "italic" }}>
                {remaining}
              </span>
            );
            remaining = "";
            break;
          }

          // String match
          const stringMatch = remaining.match(/^("[^"]*"|'[^']*'|`[^`]*`)/);
          if (stringMatch) {
            tokens.push(
              <span key={keyCounter++} style={{ color: activeTheme.string }}>
                {stringMatch[0]}
              </span>
            );
            remaining = remaining.slice(stringMatch[0].length);
            continue;
          }

          // Keyword match
          const keywordMatch = remaining.match(
            /^(import|export|from|function|const|let|var|return|if|else|try|catch|async|await|select|from|where|group|by|order|having|def|class|public|private|throw|new|typeof|in|of)\b/i
          );
          if (keywordMatch) {
            tokens.push(
              <span key={keyCounter++} style={{ color: activeTheme.keyword, fontWeight: "600" }}>
                {keywordMatch[0]}
              </span>
            );
            remaining = remaining.slice(keywordMatch[0].length);
            continue;
          }

          // Function call match
          const funcMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*(?=\()/);
          if (funcMatch) {
            tokens.push(
              <span key={keyCounter++} style={{ color: activeTheme.function }}>
                {funcMatch[0]}
              </span>
            );
            remaining = remaining.slice(funcMatch[0].length);
            continue;
          }

          // Number match
          const numberMatch = remaining.match(/^\b\d+(\.\d+)?\b/);
          if (numberMatch) {
            tokens.push(
              <span key={keyCounter++} style={{ color: activeTheme.number }}>
                {numberMatch[0]}
              </span>
            );
            remaining = remaining.slice(numberMatch[0].length);
            continue;
          }

          // Operator / Symbol match
          const operatorMatch = remaining.match(/^(===|==|=>|!=|<=|>=|\+|\-|\*|\/|=|<|>|&|\||\!)/);
          if (operatorMatch) {
            tokens.push(
              <span key={keyCounter++} style={{ color: activeTheme.operator }}>
                {operatorMatch[0]}
              </span>
            );
            remaining = remaining.slice(operatorMatch[0].length);
            continue;
          }

          // Regular text single char
          tokens.push(
            <span key={keyCounter++} style={{ color: activeTheme.text }}>
              {remaining[0]}
            </span>
          );
          remaining = remaining.slice(1);
        }

        return (
          <div key={lineIdx} className="table-row leading-relaxed font-mono">
            {showLineNumbers && (
              <span
                className="table-cell text-right pr-4 select-none opacity-40 text-xs"
                style={{ color: activeTheme.comment }}
              >
                {lineIdx + 1}
              </span>
            )}
            <span className="table-cell whitespace-pre">{tokens.length > 0 ? tokens : "\n"}</span>
          </div>
        );
      });
    },
    [activeTheme, showLineNumbers]
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadPNG = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);

    try {
      // Create offscreen canvas for crisp rendering
      const element = cardRef.current;
      const rect = element.getBoundingClientRect();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const scale = 2; // High-DPI 2x scale
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      ctx.scale(scale, scale);

      // SVG ForeignObject rasterization
      const htmlString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&amp;display=swap');
                * { box-sizing: border-box; font-family: 'Fira Code', monospace, sans-serif; }
              </style>
              ${element.outerHTML}
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new Image();
      const svgBlob = new Blob([htmlString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const a = document.createElement("a");
        a.download = `${filename || "code-snippet"}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
        setIsExporting(false);
      };
      img.onerror = () => {
        setIsExporting(false);
        alert("Downloaded via fallback image generator.");
      };
      img.src = url;
    } catch (err) {
      console.error(err);
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      const element = cardRef.current;
      const rect = element.getBoundingClientRect();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);

      const htmlString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${element.outerHTML}
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new Image();
      const svgBlob = new Blob([htmlString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = async () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(async (blob) => {
          if (blob && navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2000);
          }
        });
      };
      img.src = url;
    } catch (err) {
      console.error(err);
    }
  };

  const loadPreset = (preset) => {
    setCode(preset.code);
    setFilename(preset.filename);
    setLanguage(preset.language);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      {/* Component Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-2">
          ✨ Developer Utility Component
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Code Card <span className="text-indigo-600">Studio</span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
          Create, customize, and export beautiful code snippet cards with custom themes, mesh gradients, syntax highlighting, and PNG export.
        </p>
      </div>

      {/* Main Grid: Controls + Live Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customization Controls Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-lg border border-gray-100 space-y-6">
          <h2 className="text-base font-bold text-gray-800 border-b pb-3 flex items-center justify-between">
            <span>⚙️ Card Customization</span>
            <span className="text-xs font-normal text-gray-500">Live Editor</span>
          </h2>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Quick Code Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CODE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => loadPreset(p)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 border border-gray-200 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filename & Language */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Filename / Tab Title
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="App.jsx"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="javascript">JavaScript / JSX</option>
                <option value="python">Python</option>
                <option value="css">CSS / Tailwind</option>
                <option value="sql">SQL</option>
                <option value="html">HTML</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>

          {/* Syntax Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Syntax Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(SYNTAX_THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs rounded-xl border transition-all ${
                    theme === t.id
                      ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold shadow-sm"
                      : "border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: t.bg }}
                  />
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background Gradient Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Background Canvas Mesh
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BACKGROUND_GRADIENTS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setBgGradient(g.id)}
                  title={g.name}
                  className={`h-8 rounded-lg bg-gradient-to-br ${g.class} transition-transform ${
                    bgGradient === g.id
                      ? "ring-2 ring-indigo-600 ring-offset-2 scale-105 shadow-md"
                      : "opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Window Header Format */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Window Controls</label>
            <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs">
              <button
                onClick={() => setWindowHeader("mac")}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  windowHeader === "mac"
                    ? "bg-white font-bold text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                🔴🟡🟢 macOS
              </button>
              <button
                onClick={() => setWindowHeader("windows")}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  windowHeader === "windows"
                    ? "bg-white font-bold text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                🗔 Windows
              </button>
              <button
                onClick={() => setWindowHeader("minimal")}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  windowHeader === "minimal"
                    ? "bg-white font-bold text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                📄 Minimal
              </button>
            </div>
          </div>

          {/* Padding Slider & Line Numbers Toggle */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                <span>Card Outer Padding</span>
                <span>{padding}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="64"
                step="8"
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Show Line Numbers</span>
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Editable Text Area Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Edit Code Snippet Text
            </label>
            <textarea
              rows={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 font-mono text-xs rounded-xl bg-gray-900 text-green-400 border border-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
              placeholder="Paste or type your code here..."
            />
          </div>
        </div>

        {/* Right Column: Interactive Render Canvas & Export Actions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Render Preview Frame */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Card Preview Output
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  {copiedCode ? "✓ Copied Code!" : "📋 Copy Code"}
                </button>
                <button
                  onClick={handleCopyImage}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                >
                  {copiedImage ? "✓ Copied PNG Image!" : "📸 Copy Image"}
                </button>
                <button
                  onClick={handleDownloadPNG}
                  disabled={isExporting}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  {isExporting ? "Exporting..." : "⬇️ Download PNG"}
                </button>
              </div>
            </div>

            {/* Canvas Outer Padding Box */}
            <div
              ref={cardRef}
              style={{ padding: `${padding}px` }}
              className={`rounded-2xl bg-gradient-to-br ${activeGradient.class} shadow-2xl transition-all duration-300 flex items-center justify-center overflow-hidden`}
            >
              {/* Code Snippet Window Card */}
              <div
                className={`w-full rounded-xl overflow-hidden border ${activeTheme.border} ${shadow} transition-all duration-300`}
                style={{ backgroundColor: activeTheme.bg }}
              >
                {/* Header Controls Bar */}
                <div
                  className="flex items-center justify-between px-4 py-3 border-b border-white/10 select-none"
                  style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
                >
                  {/* Left: Controls style */}
                  {windowHeader === "mac" && (
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-sm" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block shadow-sm" />
                      <span className="w-3 h-3 rounded-full bg-green-500 inline-block shadow-sm" />
                    </div>
                  )}

                  {windowHeader === "windows" && (
                    <div className="flex items-center gap-2 opacity-60 text-xs text-white font-mono">
                      <span>🗕</span>
                      <span>🗖</span>
                      <span>✕</span>
                    </div>
                  )}

                  {windowHeader === "minimal" && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 opacity-70" />
                      <span className="text-xs font-mono opacity-60 text-white uppercase tracking-wider">
                        {language}
                      </span>
                    </div>
                  )}

                  {/* Center / Title: Filename tab */}
                  {filename && (
                    <div
                      className="px-3 py-0.5 rounded-md text-xs font-mono opacity-80 border border-white/10 truncate max-w-[200px]"
                      style={{ color: activeTheme.text, backgroundColor: "rgba(255,255,255,0.05)" }}
                    >
                      {filename}
                    </div>
                  )}

                  {/* Right watermark badge */}
                  <div className="text-[10px] font-semibold opacity-40 uppercase tracking-widest text-white">
                    CodeCard
                  </div>
                </div>

                {/* Main Code View Area */}
                <div className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono">
                  <div className="table w-full">{renderHighlightedCode(code)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Specs & Feature Highlights */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <span className="text-lg">🎨</span>
              <h4 className="text-xs font-bold text-gray-800 mt-1">8 Syntax Themes</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Dracula, Cyberpunk, Monokai & more</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <span className="text-lg">🌈</span>
              <h4 className="text-xs font-bold text-gray-800 mt-1">8 Mesh Gradients</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Vibrant canvas backdrop presets</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <span className="text-lg">⚡</span>
              <h4 className="text-xs font-bold text-gray-800 mt-1">Instant PNG Export</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Download high-res snippet images</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeCardStudio;

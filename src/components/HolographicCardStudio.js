import React, { useState, useEffect, useRef } from "react";

const THEMES = {
  aurora: {
    id: "aurora",
    name: "Cosmic Aurora",
    bgGradient: "from-slate-900 via-indigo-950 to-purple-950",
    cardBg: "from-teal-500/20 via-purple-500/20 to-pink-500/20",
    border: "border-teal-400/40",
    glow: "shadow-teal-500/30",
    textGradient: "from-teal-200 via-cyan-300 to-indigo-200",
    accent: "bg-teal-500",
    accentText: "text-teal-300",
    foilColor: "rgba(45, 212, 191, 0.4)",
    badgeBg: "bg-teal-500/20 text-teal-300 border-teal-400/50",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    bgGradient: "from-gray-950 via-purple-950 to-slate-900",
    cardBg: "from-cyan-500/20 via-fuchsia-500/20 to-yellow-500/20",
    border: "border-cyan-400/40",
    glow: "shadow-cyan-500/30",
    textGradient: "from-cyan-300 via-fuchsia-300 to-yellow-200",
    accent: "bg-cyan-500",
    accentText: "text-cyan-300",
    foilColor: "rgba(6, 182, 212, 0.4)",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-400/50",
  },
  gold: {
    id: "gold",
    name: "Solar Gold",
    bgGradient: "from-stone-950 via-amber-950 to-stone-900",
    cardBg: "from-amber-500/20 via-yellow-500/20 to-orange-500/20",
    border: "border-amber-400/40",
    glow: "shadow-amber-500/30",
    textGradient: "from-amber-200 via-yellow-300 to-orange-200",
    accent: "bg-amber-500",
    accentText: "text-amber-300",
    foilColor: "rgba(245, 158, 11, 0.4)",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/50",
  },
  prism: {
    id: "prism",
    name: "Prismatic Diamond",
    bgGradient: "from-slate-950 via-slate-900 to-sky-950",
    cardBg: "from-rose-400/20 via-sky-400/20 to-emerald-400/20",
    border: "border-sky-300/40",
    glow: "shadow-sky-400/30",
    textGradient: "from-white via-sky-200 to-pink-200",
    accent: "bg-sky-400",
    accentText: "text-sky-300",
    foilColor: "rgba(56, 189, 248, 0.4)",
    badgeBg: "bg-sky-400/20 text-sky-200 border-sky-300/50",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Nebula",
    bgGradient: "from-gray-950 via-emerald-950 to-teal-950",
    cardBg: "from-emerald-500/20 via-teal-500/20 to-lime-500/20",
    border: "border-emerald-400/40",
    glow: "shadow-emerald-500/30",
    textGradient: "from-emerald-200 via-teal-200 to-lime-200",
    accent: "bg-emerald-500",
    accentText: "text-emerald-300",
    foilColor: "rgba(16, 185, 129, 0.4)",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/50",
  },
};

const RARITIES = [
  { level: "Common", color: "from-slate-400 to-gray-500", border: "border-gray-400" },
  { level: "Rare", color: "from-blue-400 to-indigo-500", border: "border-blue-400" },
  { level: "Epic", color: "from-purple-400 to-fuchsia-500", border: "border-purple-400" },
  { level: "Legendary", color: "from-amber-400 to-orange-500", border: "border-amber-400" },
  { level: "Mythic", color: "from-rose-500 to-red-600", border: "border-rose-500" },
];

const EMBLEMS = [
  { id: "sparkles", name: "Sparkle", icon: "✨" },
  { id: "shield", name: "Shield", icon: "🛡️" },
  { id: "rocket", name: "Rocket", icon: "🚀" },
  { id: "flame", name: "Flame", icon: "🔥" },
  { id: "crystal", name: "Crystal", icon: "💎" },
  { id: "crown", name: "Crown", icon: "👑" },
  { id: "skull", name: "Cyber Skull", icon: "⚡" },
  { id: "dragon", name: "Dragon", icon: "🐉" },
];

const PATTERNS = [
  { id: "stripes", name: "Diagonal Foil Lines" },
  { id: "mesh", name: "Hexagon Grid" },
  { id: "sparkle", name: "Star Cluster" },
  { id: "waves", name: "Quantum Waves" },
];

const HolographicCardStudio = () => {
  const [title, setTitle] = useState(() => localStorage.getItem("holo_title") || "QUANTUM ARCHITECT");
  const [subtitle, setSubtitle] = useState(() => localStorage.getItem("holo_sub") || "Legendary Creator • Pass #042");
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem("holo_theme") || "aurora");
  const [rarityIndex, setRarityIndex] = useState(() => Number(localStorage.getItem("holo_rarity")) || 3);
  const [emblem, setEmblem] = useState(() => localStorage.getItem("holo_emblem") || "sparkles");
  const [pattern, setPattern] = useState(() => localStorage.getItem("holo_pattern") || "stripes");
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("holo_stats");
    return saved ? JSON.parse(saved) : { PWR: 95, AGI: 88, INT: 99, MAG: 92 };
  });
  const [sheenOpacity, setSheenOpacity] = useState(() => Number(localStorage.getItem("holo_sheen")) || 0.65);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const activeTheme = THEMES[themeKey] || THEMES.aurora;
  const activeRarity = RARITIES[rarityIndex] || RARITIES[3];
  const activeEmblem = EMBLEMS.find((e) => e.id === emblem) || EMBLEMS[0];

  useEffect(() => {
    localStorage.setItem("holo_title", title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem("holo_sub", subtitle);
  }, [subtitle]);

  useEffect(() => {
    localStorage.setItem("holo_theme", themeKey);
  }, [themeKey]);

  useEffect(() => {
    localStorage.setItem("holo_rarity", String(rarityIndex));
  }, [rarityIndex]);

  useEffect(() => {
    localStorage.setItem("holo_emblem", emblem);
  }, [emblem]);

  useEffect(() => {
    localStorage.setItem("holo_pattern", pattern);
  }, [pattern]);

  useEffect(() => {
    localStorage.setItem("holo_stats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem("holo_sheen", String(sheenOpacity));
  }, [sheenOpacity]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const px = mouseX / width;
    const py = mouseY / height;

    const rotX = (0.5 - py) * 24; // tilt pitch
    const rotY = (px - 0.5) * 24; // tilt yaw

    setRotate({ x: rotX, y: rotY });
    setGlarePos({ x: px * 100, y: py * 100, opacity: sheenOpacity });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const randomizeCard = () => {
    const themeKeys = Object.keys(THEMES);
    const randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
    const randomRarity = Math.floor(Math.random() * RARITIES.length);
    const randomEmblem = EMBLEMS[Math.floor(Math.random() * EMBLEMS.length)].id;
    const randomPattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)].id;

    setThemeKey(randomTheme);
    setRarityIndex(randomRarity);
    setEmblem(randomEmblem);
    setPattern(randomPattern);
    setStats({
      PWR: Math.floor(Math.random() * 40) + 60,
      AGI: Math.floor(Math.random() * 40) + 60,
      INT: Math.floor(Math.random() * 40) + 60,
      MAG: Math.floor(Math.random() * 40) + 60,
    });
  };

  const copyCSS = () => {
    const cssCode = `/* 3D Holographic Card Styling */
.holo-card {
  width: 320px;
  height: 480px;
  border-radius: 24px;
  background: linear-gradient(135deg, ${activeTheme.foilColor}, rgba(255,255,255,0.05));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px ${activeTheme.foilColor};
  transition: transform 0.1s ease-out, box-shadow 0.3s ease;
  transform-style: preserve-3d;
}

.holo-card:hover {
  transform: perspective(1000px) rotateX(10deg) rotateY(-10deg) scale(1.03);
}

.holo-shine {
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, ${sheenOpacity}) 0%,
    rgba(255, 255, 255, 0) 70%
  );
}`;
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex justify-center items-center min-h-[640px] p-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 rounded-2xl m-5 shadow-2xl">
      <div className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl max-w-4xl w-full shadow-2xl border border-white/10 text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Studio Lab
              </span>
              <span className="text-xs text-slate-400">3D Interactive Engine</span>
            </div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-indigo-300">
              Holographic Card Studio
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Design, customize, and inspect interactive 3D holographic cards with physics glare.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={randomizeCard}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>🎲</span> Randomize
            </button>
            <button
              onClick={copyCSS}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all active:scale-95 shadow-lg shadow-teal-500/20"
            >
              {copied ? "✓ Copied CSS!" : "⚡ Export CSS"}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Card Preview Container */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
            <div style={{ perspective: 1200 }} className="w-full flex justify-center py-4">
              <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative w-80 h-[470px] rounded-3xl p-6 cursor-pointer select-none transition-transform duration-100 ease-out border shadow-2xl ${activeTheme.border} ${activeTheme.glow}`}
                style={{
                  transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
                  transformStyle: "preserve-3d",
                  background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))`,
                }}
              >
                {/* Background Holographic Foil */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none opacity-40 mix-blend-color-dodge transition-opacity duration-300"
                  style={{
                    background:
                      pattern === "stripes"
                        ? "repeating-linear-gradient(45deg, #ff007f 0px, #00f0ff 20px, #00ff66 40px, #ff007f 60px)"
                        : pattern === "mesh"
                        ? "radial-gradient(circle, #00f0ff 10%, transparent 20%), radial-gradient(circle, #ff007f 10%, transparent 20%)"
                        : pattern === "sparkle"
                        ? "radial-gradient(circle at 50% 50%, #ffffff 0%, #00f0ff 30%, transparent 70%)"
                        : "linear-gradient(90deg, #ff007f, #7928ca, #0070f3, #00df72, #ff4e00)",
                    backgroundSize: pattern === "mesh" ? "16px 16px" : "200% 200%",
                  }}
                />

                {/* Glare Sheen Layer */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-150"
                  style={{
                    opacity: glarePos.opacity,
                    background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0) 65%)`,
                    mixBlendMode: "overlay",
                  }}
                />

                {/* Card Content - Front */}
                {!isFlipped ? (
                  <div className="relative z-10 h-full flex flex-col justify-between" style={{ transform: "translateZ(30px)" }}>
                    {/* Top Row: Rarity & Emblem */}
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${activeRarity.border} ${activeTheme.badgeBg}`}>
                        {activeRarity.level}
                      </span>
                      <span className="text-2xl filter drop-shadow-md">{activeEmblem.icon}</span>
                    </div>

                    {/* Center Artwork Frame */}
                    <div className="my-auto py-6 flex flex-col items-center justify-center relative">
                      <div className={`w-28 h-28 rounded-2xl bg-gradient-to-tr ${activeTheme.cardBg} border border-white/20 flex items-center justify-center text-5xl shadow-inner relative group`}>
                        <span className="filter drop-shadow-lg transition-transform group-hover:scale-110 duration-300">
                          {activeEmblem.icon}
                        </span>
                        <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-xs" />
                      </div>

                      <h3 className={`mt-4 text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r ${activeTheme.textGradient} text-center`}>
                        {title}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5 text-center">
                        {subtitle}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-1.5 p-2.5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-md">
                      {Object.entries(stats).map(([key, val]) => (
                        <div key={key} className="flex flex-col items-center p-1 rounded-xl bg-white/5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{key}</span>
                          <span className="text-sm font-black text-white">{val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 text-[10px] text-center text-slate-400 font-mono">
                      Click to flip card ⚡
                    </div>
                  </div>
                ) : (
                  /* Card Content - Back */
                  <div className="relative z-10 h-full flex flex-col justify-between p-2" style={{ transform: "translateZ(30px)" }}>
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">Card Specifications</span>
                      <span className="text-xs font-mono text-teal-400">#042-AUTH</span>
                    </div>

                    <div className="space-y-3 my-auto text-xs text-slate-300">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Primary Attribute</div>
                        <div className="font-semibold text-white mt-0.5">{activeTheme.name} Core Matrix</div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Foil Surface</div>
                        <div className="font-semibold text-white mt-0.5">{PATTERNS.find(p => p.id === pattern)?.name}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Power Index</div>
                        <div className="font-semibold text-teal-300 mt-0.5">
                          {Object.values(stats).reduce((a, b) => a + b, 0)} Total Rating
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>VERIFIED METRIC</span>
                      <span className="text-teal-400">Click to flip back</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customization Control Panel */}
          <div className="lg:col-span-7 space-y-6 bg-slate-950/50 p-6 rounded-2xl border border-white/5">
            {/* Row 1: Text inputs */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Card Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Subtitle / Role
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Theme & Rarity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Holographic Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.values(THEMES).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeKey(t.id)}
                    className={`p-2 rounded-xl text-xs font-bold text-center border transition-all ${
                      themeKey === t.id
                        ? "bg-slate-800 border-teal-400 text-teal-300 shadow-md scale-105"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Emblem Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Emblem Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {EMBLEMS.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setEmblem(e.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      emblem === e.id
                        ? "bg-slate-800 border-teal-400 text-white scale-105"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span>{e.icon}</span>
                    <span>{e.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rarity Selector */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Rarity Tier</label>
                <span className="text-xs font-bold text-teal-300">{activeRarity.level}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {RARITIES.map((r, idx) => (
                  <button
                    key={r.level}
                    onClick={() => setRarityIndex(idx)}
                    className={`py-1.5 rounded-xl text-[11px] font-black border transition-all ${
                      rarityIndex === idx
                        ? `bg-gradient-to-r ${r.color} text-white border-transparent shadow-md scale-105`
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {r.level}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Sliders */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Attribute Stats
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(stats).map(([statKey, val]) => (
                  <div key={statKey} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-slate-300">{statKey}</span>
                      <span className="text-xs font-mono text-teal-400 font-bold">{val}</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={99}
                      value={val}
                      onChange={(e) =>
                        setStats((prev) => ({ ...prev, [statKey]: Number(e.target.value) }))
                      }
                      className="w-full accent-teal-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Sheen intensity slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Holographic Glare Opacity
                </label>
                <span className="text-xs font-mono text-slate-400">{Math.round(sheenOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={0.9}
                step={0.05}
                value={sheenOpacity}
                onChange={(e) => setSheenOpacity(Number(e.target.value))}
                className="w-full accent-teal-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolographicCardStudio;

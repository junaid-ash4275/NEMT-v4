import React, { useState, useCallback, useMemo } from 'react';

const MeshGradientGenerator = () => {
    const [points, setPoints] = useState([
        { id: 1, x: 20, y: 20, color: '#4f46e5', size: 60 },
        { id: 2, x: 80, y: 30, color: '#ec4899', size: 55 },
        { id: 3, x: 30, y: 70, color: '#f59e0b', size: 50 },
        { id: 4, x: 70, y: 80, color: '#10b981', size: 65 },
    ]);
    const [activeId, setActiveId] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleMouseMove = useCallback((e) => {
        if (activeId === null) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 0), 100);
        const y = Math.min(Math.max(((e.clientY - rect.top) / rect.height) * 100, 0), 100);

        setPoints(prev => prev.map(p => p.id === activeId ? { ...p, x, y } : p));
    }, [activeId]);

    const handleMouseUp = () => setActiveId(null);

    const updatePoint = (id, updates) => {
        setPoints(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const addPoint = () => {
        const newPoint = {
            id: Date.now(),
            x: 50,
            y: 50,
            color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
            size: 50
        };
        setPoints([...points, newPoint]);
    };

    const removePoint = (id) => {
        if (points.length <= 2) return;
        setPoints(points.filter(p => p.id !== id));
    };

    const meshStyle = useMemo(() => {
        const gradients = points.map(p => 
            `radial-gradient(circle at ${p.x}% ${p.y}%, ${p.color} 0%, transparent ${p.size}%)`
        ).join(', ');
        return {
            backgroundImage: gradients,
            backgroundColor: '#0f172a'
        };
    }, [points]);

    const cssCode = useMemo(() => {
        const gradients = points.map(p => 
            `radial-gradient(circle at ${p.x}% ${p.y}%, ${p.color} 0%, transparent ${p.size}%)`
        ).join(',\n    ');
        return `background-color: #0f172a;\nbackground-image: \n    ${gradients};`;
    }, [points]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(cssCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex justify-center items-center min-h-[700px] p-8 bg-[#0a0a0a] rounded-[3rem] m-5 shadow-2xl relative overflow-hidden group font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-7xl relative z-10">
                
                {/* Sidebar Controls */}
                <div className="lg:col-span-4 bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8 max-h-[650px] overflow-y-auto custom-scrollbar">
                    <header>
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40 mb-2">Mesh Studio</h2>
                        <p className="text-gray-500 font-medium text-sm">Design organic, fluid mesh gradients</p>
                    </header>

                    <div className="space-y-6">
                        {points.map((point, index) => (
                            <div key={point.id} className="p-5 bg-white/[0.05] rounded-3xl border border-white/10 space-y-4 hover:border-white/20 transition-all group/item">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Point {index + 1}</span>
                                    <button 
                                        onClick={() => removePoint(point.id)}
                                        className="text-white/20 hover:text-red-400 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="relative group/color">
                                        <input 
                                            type="color" 
                                            value={point.color}
                                            onChange={(e) => updatePoint(point.id, { color: e.target.value })}
                                            className="w-12 h-12 rounded-2xl bg-transparent cursor-pointer border-2 border-white/10 hover:border-white/30 transition-all overflow-hidden"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">Spread</label>
                                            <span className="text-white/60 font-mono text-[10px]">{point.size}%</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="10" max="150" 
                                            value={point.size} 
                                            onChange={(e) => updatePoint(point.id, { size: parseInt(e.target.value) })}
                                            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={addPoint}
                        className="w-full py-4 rounded-2xl bg-white/5 border border-dashed border-white/20 text-white/50 font-bold hover:bg-white/10 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Gradient Point
                    </button>

                    <button 
                        onClick={copyToClipboard}
                        className={`w-full py-5 rounded-3xl font-black transition-all duration-500 shadow-2xl flex items-center justify-center gap-3 ${
                            copied 
                            ? 'bg-emerald-500 text-white scale-[0.98]' 
                            : 'bg-white text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95'
                        }`}
                    >
                        {copied ? 'Copied to Clipboard' : 'Copy Mesh CSS'}
                    </button>
                </div>

                {/* Interactive Preview Canvas */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div 
                        className="w-full aspect-[16/10] lg:aspect-auto lg:flex-1 rounded-[3rem] shadow-2xl relative cursor-crosshair overflow-hidden border border-white/5 group/canvas"
                        style={meshStyle}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* Interactive Handle Overlays */}
                        <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover/canvas:opacity-100 transition-opacity duration-500">
                            {points.map(p => (
                                <div 
                                    key={p.id}
                                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                    className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 border-white shadow-2xl pointer-events-auto cursor-grab active:cursor-grabbing transition-transform hover:scale-125 flex items-center justify-center ${activeId === p.id ? 'scale-150' : ''}`}
                                    onMouseDown={() => setActiveId(p.id)}
                                >
                                    <div className="w-3 h-3 rounded-full bg-white shadow-sm"></div>
                                </div>
                            ))}
                        </div>

                        {/* Glossy Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                        
                        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end pointer-events-none">
                            <div className="bg-black/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                                <span className="text-white font-bold text-lg tracking-tight">Live Canvas</span>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">Drag points to transform</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 text-center">
                            <span className="block text-2xl font-black text-white">{points.length}</span>
                            <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Active Points</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 text-center">
                            <span className="block text-2xl font-black text-white">4K</span>
                            <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Output Res</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 text-center">
                            <span className="block text-2xl font-black text-white">CSS3</span>
                            <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Standard</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

export default MeshGradientGenerator;

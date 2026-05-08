import React, { useState, useCallback } from "react";

const GRID_SIZES = [8, 12, 16, 24];
const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#000000", "#ffffff",
  "#6b7280", "#92400e",
];

const createGrid = (size) =>
  Array.from({ length: size }, () => Array(size).fill("#f3f4f6"));

const PixelArtMaker = () => {
  const [gridSize, setGridSize] = useState(16);
  const [grid, setGrid] = useState(() => createGrid(16));
  const [currentColor, setCurrentColor] = useState("#3b82f6");
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("draw"); // draw | erase | fill
  const [history, setHistory] = useState([]);
  const [showGrid, setShowGrid] = useState(true);

  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-19), grid.map((r) => [...r])]);
  }, [grid]);

  const paint = useCallback(
    (row, col) => {
      const color = tool === "erase" ? "#f3f4f6" : currentColor;
      setGrid((prev) => {
        if (prev[row][col] === color) return prev;
        const next = prev.map((r) => [...r]);
        next[row][col] = color;
        return next;
      });
    },
    [currentColor, tool]
  );

  const floodFill = useCallback(
    (row, col) => {
      const target = grid[row][col];
      const replacement = currentColor;
      if (target === replacement) return;

      const next = grid.map((r) => [...r]);
      const stack = [[row, col]];

      while (stack.length > 0) {
        const [r, c] = stack.pop();
        if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) continue;
        if (next[r][c] !== target) continue;
        next[r][c] = replacement;
        stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
      }

      setGrid(next);
    },
    [grid, currentColor, gridSize]
  );

  const handleCellDown = (row, col) => {
    pushHistory();
    if (tool === "fill") {
      floodFill(row, col);
    } else {
      setIsDrawing(true);
      paint(row, col);
    }
  };

  const handleCellEnter = (row, col) => {
    if (isDrawing) paint(row, col);
  };

  const handleMouseUp = () => setIsDrawing(false);

  const undo = () => {
    if (history.length === 0) return;
    setGrid(history[history.length - 1]);
    setHistory((prev) => prev.slice(0, -1));
  };

  const clearCanvas = () => {
    pushHistory();
    setGrid(createGrid(gridSize));
  };

  const changeGridSize = (size) => {
    setGridSize(size);
    setGrid(createGrid(size));
    setHistory([]);
  };

  const exportAsPNG = () => {
    const scale = 16;
    const canvas = document.createElement("canvas");
    canvas.width = gridSize * scale;
    canvas.height = gridSize * scale;
    const ctx = canvas.getContext("2d");

    grid.forEach((row, r) => {
      row.forEach((color, c) => {
        ctx.fillStyle = color;
        ctx.fillRect(c * scale, r * scale, scale, scale);
      });
    });

    const link = document.createElement("a");
    link.download = "pixel-art.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const pixelSize = Math.max(12, Math.min(28, Math.floor(320 / gridSize)));

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-fuchsia-500 via-violet-600 to-indigo-700 rounded-2xl m-5 shadow-2xl transition-all duration-300">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl max-w-2xl w-full shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
              Pixel Art Maker
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Create pixel-perfect masterpieces 🎨
            </p>
          </div>
          <span className="text-4xl animate-bounce">🖌️</span>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Tools */}
          {[
            { id: "draw", label: "✏️ Draw" },
            { id: "erase", label: "🧹 Erase" },
            { id: "fill", label: "🪣 Fill" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                tool === t.id
                  ? "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Undo */}
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↩ Undo
          </button>

          {/* Clear */}
          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 rounded-lg text-sm font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-all active:scale-95"
          >
            🗑 Clear
          </button>

          {/* Export */}
          <button
            onClick={exportAsPNG}
            className="px-3 py-1.5 rounded-lg text-sm font-bold bg-green-50 text-green-600 hover:bg-green-100 transition-all active:scale-95 ml-auto"
          >
            📥 Export PNG
          </button>
        </div>

        {/* Color palette & grid size */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex items-center gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCurrentColor(c);
                  if (tool === "erase") setTool("draw");
                }}
                className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${
                  currentColor === c && tool !== "erase"
                    ? "border-violet-500 scale-110 shadow-md"
                    : "border-gray-200"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={currentColor}
              onChange={(e) => {
                setCurrentColor(e.target.value);
                if (tool === "erase") setTool("draw");
              }}
              className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
              title="Custom color"
            />
          </div>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Grid size */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
              Grid
            </span>
            {GRID_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => changeGridSize(s)}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  gridSize === s
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
              >
                {s}×{s}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Grid toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
              showGrid
                ? "bg-violet-100 text-violet-700"
                : "bg-gray-50 text-gray-400"
            }`}
          >
            {showGrid ? "▦ Grid On" : "▢ Grid Off"}
          </button>
        </div>

        {/* Canvas */}
        <div
          className="flex justify-center mb-5"
          onMouseLeave={() => setIsDrawing(false)}
          onMouseUp={handleMouseUp}
        >
          <div
            className="inline-grid bg-white rounded-lg overflow-hidden shadow-inner border border-gray-200"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, ${pixelSize}px)`,
              gridTemplateRows: `repeat(${gridSize}, ${pixelSize}px)`,
            }}
          >
            {grid.map((row, r) =>
              row.map((color, c) => (
                <div
                  key={`${r}-${c}`}
                  onMouseDown={() => handleCellDown(r, c)}
                  onMouseEnter={() => handleCellEnter(r, c)}
                  className="transition-colors duration-75 cursor-crosshair"
                  style={{
                    backgroundColor: color,
                    width: pixelSize,
                    height: pixelSize,
                    outline: showGrid ? "1px solid rgba(0,0,0,0.06)" : "none",
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-6 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full" />
            Draw &amp; Fill Tools
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
            Undo History
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            PNG Export
          </span>
        </div>
      </div>
    </div>
  );
};

export default PixelArtMaker;

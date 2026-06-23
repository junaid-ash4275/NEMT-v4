import React, { useState, useEffect } from "react";

const VirtualPet = () => {
  const [petName, setPetName] = useState("Pixel");
  const [hunger, setHunger] = useState(50);
  const [happiness, setHappiness] = useState(50);
  const [energy, setEnergy] = useState(50);
  const [status, setStatus] = useState("Happy");

  useEffect(() => {
    const timer = setInterval(() => {
      setHunger((prev) => Math.min(prev + 2, 100));
      setHappiness((prev) => Math.max(prev - 1, 0));
      setEnergy((prev) => Math.max(prev - 1, 0));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (hunger > 80) {
      setStatus("Hungry 😩");
    } else if (energy < 20) {
      setStatus("Sleepy 😴");
    } else if (happiness < 30) {
      setStatus("Sad 😢");
    } else {
      setStatus("Happy 😄");
    }
  }, [hunger, happiness, energy]);

  const feed = () => {
    setHunger((prev) => Math.max(prev - 30, 0));
    setEnergy((prev) => Math.min(prev + 5, 100));
  };

  const play = () => {
    setHappiness((prev) => Math.min(prev + 20, 100));
    setEnergy((prev) => Math.max(prev - 15, 0));
    setHunger((prev) => Math.min(prev + 10, 100));
  };

  const sleep = () => {
    setEnergy((prev) => Math.min(prev + 40, 100));
    setHunger((prev) => Math.min(prev + 10, 100));
  };

  const getBarColor = (value, inverse = false) => {
    if (inverse) {
      if (value < 30) return "bg-green-500";
      if (value < 70) return "bg-yellow-500";
      return "bg-red-500";
    } else {
      if (value > 70) return "bg-green-500";
      if (value > 30) return "bg-yellow-500";
      return "bg-red-500";
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[500px] p-5 bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-green-600 bg-clip-text text-transparent">
            Virtual Pet
          </h2>
          <span className="text-2xl">🐾</span>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">
            {status.includes("Happy") ? "😺" : status.includes("Sad") ? "😿" : status.includes("Sleepy") ? "😽" : "🙀"}
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{petName}</h3>
          <p className="text-gray-500 font-medium">{status}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
              <span>Hunger</span>
              <span>{hunger}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getBarColor(hunger, true)}`}
                style={{ width: `${hunger}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
              <span>Happiness</span>
              <span>{happiness}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getBarColor(happiness)}`}
                style={{ width: `${happiness}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
              <span>Energy</span>
              <span>{energy}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getBarColor(energy)}`}
                style={{ width: `${energy}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={feed}
            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all duration-300 flex flex-col items-center gap-1"
          >
            <span className="text-xl">🍖</span>
            Feed
          </button>
          <button
            onClick={play}
            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-300 flex flex-col items-center gap-1"
          >
            <span className="text-xl">🎾</span>
            Play
          </button>
          <button
            onClick={sleep}
            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-all duration-300 flex flex-col items-center gap-1"
          >
            <span className="text-xl">sZ</span>
            Sleep
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualPet;

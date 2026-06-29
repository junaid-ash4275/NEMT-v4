import React, { useState } from 'react';

const NumberBaseConverter = () => {
  const [values, setValues] = useState({
    decimal: '',
    binary: '',
    hex: '',
    octal: ''
  });
  const [copiedField, setCopiedField] = useState(null);
  const [error, setError] = useState('');

  const handleCopy = (text, field) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    }
  };

  const handleChange = (e, base) => {
    const value = e.target.value;
    if (value === '') {
      setValues({ decimal: '', binary: '', hex: '', octal: '' });
      setError('');
      return;
    }

    try {
      let decimalValue;
      if (base === 'decimal') {
        if (!/^\d*$/.test(value)) throw new Error('Invalid decimal number');
        decimalValue = parseInt(value, 10);
      } else if (base === 'binary') {
        if (!/^[01]*$/.test(value)) throw new Error('Invalid binary number');
        decimalValue = parseInt(value, 2);
      } else if (base === 'hex') {
        if (!/^[0-9A-Fa-f]*$/.test(value)) throw new Error('Invalid hexadecimal number');
        decimalValue = parseInt(value, 16);
      } else if (base === 'octal') {
        if (!/^[0-7]*$/.test(value)) throw new Error('Invalid octal number');
        decimalValue = parseInt(value, 8);
      }

      if (isNaN(decimalValue)) {
        throw new Error('Invalid number');
      }

      setValues({
        decimal: decimalValue.toString(10),
        binary: decimalValue.toString(2),
        hex: decimalValue.toString(16).toUpperCase(),
        octal: decimalValue.toString(8)
      });
      setError('');
    } catch (err) {
      setError(err.message);
      // Keep the current typed value but empty others if it's invalid
      setValues(prev => ({
        decimal: base === 'decimal' ? value : '',
        binary: base === 'binary' ? value : '',
        hex: base === 'hex' ? value : '',
        octal: base === 'octal' ? value : ''
      }));
    }
  };

  const handleClear = () => {
    setValues({ decimal: '', binary: '', hex: '', octal: '' });
    setError('');
  };

  return (
    <div className="flex justify-center items-center min-h-[600px] p-5 bg-gradient-to-br from-teal-400 via-emerald-500 to-green-500 rounded-2xl m-5 shadow-2xl">
      <div className="bg-white p-8 rounded-xl max-w-4xl w-full shadow-xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-green-500 bg-clip-text text-transparent mb-2">
            Number Base Converter
          </h2>
          <p className="text-gray-500 text-sm">
            Convert numbers instantly between Decimal, Binary, Hexadecimal, and Octal
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClear}
              className="px-6 py-2 border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 font-bold rounded-xl transition-colors text-sm"
            >
              Clear All
            </button>
            {error && (
              <span className="text-red-500 text-sm font-semibold">{error}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Decimal Input */}
            <div className="relative group">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Decimal (Base 10)</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={values.decimal}
                  onChange={(e) => handleChange(e, 'decimal')}
                  placeholder="e.g. 255"
                  className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-teal-400 focus:ring-0 outline-none transition-colors text-gray-700 font-mono text-lg"
                />
                <button
                  onClick={() => handleCopy(values.decimal, 'decimal')}
                  className={`absolute right-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedField === 'decimal'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-teal-50 text-teal-600 hover:bg-teal-100 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {copiedField === 'decimal' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Binary Input */}
            <div className="relative group">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Binary (Base 2)</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={values.binary}
                  onChange={(e) => handleChange(e, 'binary')}
                  placeholder="e.g. 11111111"
                  className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-teal-400 focus:ring-0 outline-none transition-colors text-gray-700 font-mono text-lg"
                />
                <button
                  onClick={() => handleCopy(values.binary, 'binary')}
                  className={`absolute right-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedField === 'binary'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-teal-50 text-teal-600 hover:bg-teal-100 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {copiedField === 'binary' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Hexadecimal Input */}
            <div className="relative group">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Hexadecimal (Base 16)</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={values.hex}
                  onChange={(e) => handleChange(e, 'hex')}
                  placeholder="e.g. FF"
                  className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-teal-400 focus:ring-0 outline-none transition-colors text-gray-700 font-mono text-lg uppercase"
                />
                <button
                  onClick={() => handleCopy(values.hex, 'hex')}
                  className={`absolute right-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedField === 'hex'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-teal-50 text-teal-600 hover:bg-teal-100 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {copiedField === 'hex' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Octal Input */}
            <div className="relative group">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Octal (Base 8)</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={values.octal}
                  onChange={(e) => handleChange(e, 'octal')}
                  placeholder="e.g. 377"
                  className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-teal-400 focus:ring-0 outline-none transition-colors text-gray-700 font-mono text-lg"
                />
                <button
                  onClick={() => handleCopy(values.octal, 'octal')}
                  className={`absolute right-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedField === 'octal'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-teal-50 text-teal-600 hover:bg-teal-100 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {copiedField === 'octal' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberBaseConverter;

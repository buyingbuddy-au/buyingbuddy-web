import React, { useState } from 'react';

export default function LemonChecker() {
  const [carModel, setCarModel] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carModel.trim()) return;
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 font-sans">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Is your dream car a lemon?</h2>
      <p className="text-gray-600 mb-6 text-sm">Enter a make and model to check for known catastrophic failures before you buy.</p>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <input
            type="text"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            placeholder="e.g. 2014 Jeep Grand Cherokee"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
            required
          />
          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isSearching ? 'Checking...' : 'Check'}
          </button>
        </div>
      </form>

      {hasSearched && !isSearching && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <h3 className="text-lg font-bold text-red-800 flex items-center">
              <span className="mr-2">⚠️</span> Warning: High Risk
            </h3>
            <ul className="mt-2 text-red-700 text-sm list-disc list-inside space-y-1">
              <li>Notorious transmission failure ($5,000+ repair)</li>
              <li>Electrical TIPM issues</li>
              <li>Premature engine ticking/lifter failure</li>
            </ul>
            <p className="mt-3 text-xs text-red-600 italic">*Example data based on search</p>
          </div>

          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Don't buy a money pit.</h4>
            <p className="text-sm text-gray-600 mb-4">Get an expert on your side before you hand over your cash.</p>
            <button className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
              Book a Pre-Purchase Inspection (PPI)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

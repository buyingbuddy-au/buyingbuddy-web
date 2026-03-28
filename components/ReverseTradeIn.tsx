import React, { useState } from 'react';

export default function ReverseTradeIn() {
  const [formData, setFormData] = useState({
    carDetails: '',
    year: '',
    mileage: '',
    currentOffer: '',
    email: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this submits to the backend/CRM
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 font-sans">
      <div className="bg-gray-900 p-8 sm:p-10 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Getting insulted by a dealer trade-in?
        </h2>
        <p className="text-xl sm:text-2xl text-yellow-400 font-bold mb-4">
          We'll beat it by $500 cash.
        </p>
        <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto">
          Don't leave money on the table. Tell us what you've got and the BS offer they gave you. We'll give you a real valuation.
        </p>
      </div>

      <div className="p-6 sm:p-8 bg-gray-50">
        {submitted ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Details received.</h3>
            <p className="text-gray-600">We're crunching the numbers and will be in touch shortly with a better offer.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="carDetails" className="block text-sm font-medium text-gray-700">Make & Model</label>
                <input 
                  type="text" 
                  id="carDetails" 
                  name="carDetails" 
                  required 
                  value={formData.carDetails} 
                  onChange={handleChange} 
                  placeholder="e.g. Toyota Hilux SR5" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                <input 
                  type="number" 
                  id="year" 
                  name="year" 
                  required 
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year} 
                  onChange={handleChange} 
                  placeholder="e.g. 2019" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">Mileage (km)</label>
                <input 
                  type="number" 
                  id="mileage" 
                  name="mileage" 
                  required 
                  min="0"
                  value={formData.mileage} 
                  onChange={handleChange} 
                  placeholder="e.g. 85000" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="currentOffer" className="block text-sm font-medium text-gray-700">Current Trade-in Offer ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input 
                    type="number" 
                    id="currentOffer" 
                    name="currentOffer" 
                    required 
                    min="0"
                    value={formData.currentOffer} 
                    onChange={handleChange} 
                    placeholder="25000" 
                    className="w-full pl-9 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="your@email.com" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 mt-2 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Beat My Offer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

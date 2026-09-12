'use client';

import { useState } from 'react';
import { FactCheckResponse } from '@/types';

export default function Home() {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FactCheckResponse | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim) return;
    setLoading(true);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim }),
      });
      const data: FactCheckResponse = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-emerald-400">Sach-Kya AI</h1>
      
      <form onSubmit={handleVerify} className="space-y-4 mb-8">
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Paste news claim or rumor here..."
          className="w-full p-4 rounded bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded disabled:opacity-50"
        >
          {loading ? 'Analyzing Claim...' : 'Verify Claim'}
        </button>
      </form>

      {result && (
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Verdict: {result.verdict}</span>
            <span className="text-2xl font-black text-emerald-400">{result.trustScore}/100</span>
          </div>
          <p className="text-neutral-300">{result.summary}</p>
        </div>
      )}
    </main>
  );
}
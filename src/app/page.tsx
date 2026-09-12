'use client';

import { useState } from 'react';
import { FactCheckResponse } from '@/types';

export default function Home() {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FactCheckResponse | null>(null);
  const [theme, setTheme] = useState<'default' | 'light' | 'dark'>('default');

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
    <main
      className={`min-h-screen p-6 md:p-12 transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-slate-950 text-slate-100'
          : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900'
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-300 dark:border-slate-800">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-emerald-600">
              Sach-Kya AI
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Autonomous Multi-Agent Fact Verification Platform
            </p>
          </div>

          {/* Theme Dropdown */}
          <div className="relative inline-block text-left">
            <select
              value={theme}
              onChange={(e) =>
                setTheme(e.target.value as 'default' | 'light' | 'dark')
              }
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm py-2 pl-4 pr-9 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="default">Default (Light Mode)</option>
              <option value="light">☀️ Light Mode</option>
              <option value="dark">🌙 Dark Mode</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Input & Form Area */}
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Enter Claim or Viral News Text
          </label>
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Paste news headline, statement, or social media rumor to verify..."
            className={`w-full p-4 rounded-xl border font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm'
            }`}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Executing Agent Pipeline...' : 'Verify Claim'}
          </button>
        </form>

        {/* Results Dashboard Grid */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            {/* Main Verdict Card (Takes 2 Columns) */}
            <div
              className={`lg:col-span-2 p-6 rounded-2xl border transition shadow-md space-y-6 ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-center border-b pb-4 border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Final Verdict
                  </span>
                  <h2 className="text-2xl font-black text-amber-500 mt-1">
                    {result.verdict}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Trust Score
                  </span>
                  <div className="text-4xl font-black text-emerald-500">
                    {result.trustScore}
                    <span className="text-lg text-slate-400">/100</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Executive Summary
                </h3>
                <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Sources Section */}
              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Verified Sources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 transition"
                    >
                      🔗 {src.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Agent Logs Sidebar (Takes 1 Column) */}
            <div
              className={`p-6 rounded-2xl border transition shadow-md space-y-4 ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-3 border-slate-200 dark:border-slate-800">
                Agent Execution Pipeline
              </h3>
              <div className="space-y-4">
                {result.agentLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {log.agentName}
                      </span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {log.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
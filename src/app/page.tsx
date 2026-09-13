'use client';

import { useState } from 'react';
import { FactCheckResponse } from '@/types';

export default function Home() {
  const [claim, setClaim] = useState('');
  const [inputType, setInputType] = useState<'text' | 'audio' | 'image'>('text');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FactCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'default' | 'light' | 'dark'>('default');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputType === 'text' && !claim) return;
    if (inputType !== 'text' && !file) return;
    setLoading(true);
    setError(null);

    try {
      const res =
        inputType === 'text'
          ? await fetch('/api/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ input_type: 'text', content: claim }),
            })
          : await fetch('/api/verify-file', {
              method: 'POST',
              body: buildFilePayload(inputType, file),
            });
      const data = await res.json();
      if (!res.ok) {
        setResult(null);
        setError(getErrorMessage(data));
        return;
      }
      setResult(data as FactCheckResponse);
    } catch (err) {
      console.error(err);
      setResult(null);
      setError('Verification backend is unavailable. Check backend logs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <main
      className={`min-h-screen p-4 sm:p-6 md:p-12 transition-colors duration-300 font-sans ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation Bar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 dark:border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                Sach-Kya AI
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Autonomous Multi-Agent Fact Verification Platform
            </p>
          </div>

          <div className="relative inline-block text-left w-full sm:w-auto">
            <select
              value={theme}
              onChange={(e) =>
                setTheme(e.target.value as 'default' | 'light' | 'dark')
              }
              className={`w-full sm:w-auto appearance-none font-bold text-xs sm:text-sm py-2.5 pl-4 pr-10 rounded-xl border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-850'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
              }`}
            >
              <option value="default">Default Light</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </header>

        {/* Form Controls */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Enter Claim or Viral News Text
            </label>

            {/* Input Type Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-900 rounded-xl border border-slate-300/60 dark:border-slate-800 w-fit">
              {(['text', 'audio', 'image'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setInputType(type);
                    setFile(null);
                    setError(null);
                    setResult(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    inputType === type
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {inputType === 'text' ? (
            <div className="relative">
              <textarea
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="Paste news headline, statement, or social media rumor to verify..."
                className={`w-full p-4 sm:p-5 rounded-2xl border font-medium text-sm sm:text-base leading-relaxed transition focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[140px] shadow-sm ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500/50'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                }`}
              />
            </div>
          ) : (
            <div
              className={`flex flex-col sm:flex-row items-center justify-between gap-4 w-full p-6 rounded-2xl border border-dashed transition-all shadow-sm ${
                isDark
                  ? 'bg-slate-900/60 border-slate-800 text-slate-100 hover:border-emerald-500/50'
                  : 'bg-white border-slate-300 text-slate-900 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  {inputType === 'audio' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {file ? file.name : `Select an ${inputType} file to analyze`}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : `Supports standard ${inputType} formats`}
                  </p>
                </div>
              </div>

              <input
                id="media-upload"
                type="file"
                accept={inputType === 'audio' ? 'audio/*' : 'image/*'}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
              <label
                htmlFor="media-upload"
                className="w-full sm:w-auto text-center cursor-pointer rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-black text-white uppercase tracking-wider transition shadow-md shadow-emerald-600/20 active:scale-95"
              >
                Add {inputType === 'audio' ? 'Audio' : 'Image'} File
              </label>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || (inputType === 'text' ? !claim : !file)}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {loading ? 'Executing Agent Pipeline...' : 'Verify Claim'}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-sm font-bold">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </form>

        {/* Dynamic Verification Dashboard */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Left Column: Verdict & Summary Card */}
            <div
              className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border transition shadow-xl space-y-8 ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-slate-950/50'
                  : 'bg-white border-slate-200/80 text-slate-900 shadow-slate-200/50'
              }`}
            >
              {/* Verdict Header Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-6 border-slate-200 dark:border-slate-800 gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Final Verdict
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h2
                      className={`text-3xl sm:text-4xl font-black capitalize tracking-tight ${
                        result.verdict.toLowerCase() === 'unverified'
                          ? 'text-amber-500'
                          : result.verdict.toLowerCase() === 'false'
                          ? 'text-rose-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {result.verdict}
                    </h2>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-3">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Verdict Confidence
                    </span>
                    <div className="text-2xl font-black text-emerald-500 leading-none mt-1">
                      {result.trust_score}
                      <span className="text-xs font-bold text-slate-400 ml-0.5">/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Summaries */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Executive Summary
                </h3>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/80 space-y-4">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                    {result.summary.english}
                  </p>
                  {result.summary.urdu && (
                    <p
                      className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-loose text-right border-t border-slate-200 dark:border-slate-800 pt-4"
                      dir="rtl"
                    >
                      {result.summary.urdu}
                    </p>
                  )}
                </div>
              </div>

              {/* Extracted File Text (OCR/Whisper) */}
              {result.extracted_text && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Extracted Media Text
                  </h3>
                  <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 text-sm">
                    {result.extracted_text}
                  </p>
                </div>
              )}

              {/* Key Findings Bullet List */}
              {result.key_findings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Key Findings
                  </h3>
                  <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80">
                    {result.key_findings.map((finding, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 text-sm font-semibold text-slate-800 dark:text-slate-200"
                      >
                        <span className="text-emerald-500 font-bold mt-0.5">•</span>
                        <span className="leading-snug">{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Web Sources */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Verified Sources
                </h3>
                {result.sources.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {result.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-950/80 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 transition-all shadow-sm flex items-center gap-2 hover:border-emerald-500/40"
                      >
                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>{src.title}</span>
                        {src.credibility && (
                          <span className="text-[10px] opacity-60 font-medium">({src.credibility})</span>
                        )}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-medium text-slate-400 italic">
                    No external sources retrieved for this search query.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Agent Execution Pipeline Sidebar */}
            <div
              className={`p-6 rounded-3xl border transition shadow-xl space-y-5 h-fit ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-slate-950/50'
                  : 'bg-white border-slate-200/80 text-slate-900 shadow-slate-200/50'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Agent Execution Pipeline
                </h3>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>

              <div className="space-y-3">
                {result.agent_logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2 shadow-sm"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                        {log.agent_name}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          log.status.toLowerCase() === 'failed'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                      {log.message}
                    </p>
                  </div>
                ))}

                {result.is_cached && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    <p className="text-xs font-black flex items-center gap-1.5">
                      <span>⚡</span> Served directly from duplicate-claim cache.
                    </p>
                  </div>
                )}

                {result.warnings?.map((warning, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300"
                  >
                    <p className="text-xs font-bold leading-snug flex items-start gap-1.5">
                      <span>⚠️</span>
                      <span>{warning}</span>
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

function buildFilePayload(inputType: 'audio' | 'image', file: File | null) {
  const formData = new FormData();
  formData.append('input_type', inputType);
  if (file) {
    formData.append('file', file);
  }
  return formData;
}

function getErrorMessage(data: unknown) {
  if (
    data &&
    typeof data === 'object' &&
    'detail' in data &&
    typeof data.detail === 'string'
  ) {
    return data.detail;
  }

  return 'Verification request failed. Please try a different file or claim.';
}
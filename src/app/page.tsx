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
        isDark ? 'bg-slate-950 text-slate-200' : 'bg-[#f8fafc] text-slate-800'
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation Bar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-300 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-500">
                Sach-Kya AI
              </h1>
            </div>
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-emerald-400">
              ⚡ Autonomous Multi-Agent Fact Verification Platform
            </p>
          </div>
        </div>

          <div className="relative inline-block text-left w-full sm:w-auto">
            <select
              value={theme}
              onChange={(e) =>
                setTheme(e.target.value as 'default' | 'light' | 'dark')
              }
              className={`w-full sm:w-auto appearance-none font-extrabold text-xs sm:text-sm py-2.5 pl-4 pr-10 rounded-xl border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="default">Default Light</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 dark:text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </header>

        {/* Form Controls */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Analyze a Claim or Viral Media
            </label>

            {/* Input Type Selector Tabs */}
            <div className={`flex items-center gap-1.5 p-1 rounded-xl border shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'
            }`}>
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
                  className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                    inputType === type
                      ? 'bg-emerald-600 text-white shadow-md'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-slate-800 hover:text-emerald-700 hover:bg-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {inputType === 'text' ? (
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="Paste news headline, statement, or social media rumor to verify..."
              className={`w-full p-4 sm:p-5 rounded-2xl border font-bold text-sm sm:text-base leading-relaxed transition focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[140px] shadow-sm ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          ) : (
            <div
              className={`flex flex-col sm:flex-row items-center justify-between gap-4 w-full p-6 rounded-2xl border border-dashed transition shadow-sm ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
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
                  <p className={`text-sm font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {file ? file.name : `Select an ${inputType} file to analyze`}
                  </p>
                  <p className={`text-xs font-bold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
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
                className="w-full sm:w-auto text-center cursor-pointer rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-black text-white uppercase tracking-wider transition shadow-md"
              >
                Add {inputType === 'audio' ? 'Audio' : 'Image'} File
              </label>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || (inputType === 'text' ? !claim : !file)}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm font-extrabold">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </form>

          {/* Dynamic Verification Dashboard */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
            {/* Left Column: Verdict & Summary Card */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Verdict Header Card */}
              <div
                className={`p-6 sm:p-8 rounded-3xl transition-all shadow-sm ${
                  isDark
                    ? 'bg-slate-900/90 ring-1 ring-slate-800 text-slate-100'
                    : 'bg-white ring-1 ring-slate-300 text-slate-900 shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Final Verdict
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className={`h-4 w-4 rounded-full ${
                        result.verdict.toLowerCase() === 'unverified' ? 'bg-amber-500' : 
                        result.verdict.toLowerCase() === 'false' ? 'bg-rose-500' : 
                        'bg-emerald-500'
                      }`}></div>
                      <h2
                        className={`text-4xl sm:text-5xl font-black capitalize tracking-tight ${
                          result.verdict.toLowerCase() === 'unverified'
                            ? 'text-amber-600'
                            : result.verdict.toLowerCase() === 'false'
                            ? 'text-rose-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {result.verdict}
                      </h2>
                    </div>
                  </div>

                  <div className={`px-6 py-4 rounded-2xl flex flex-col items-end ${
                    isDark ? 'bg-slate-800/80 ring-1 ring-slate-700' : 'bg-slate-100 ring-1 ring-slate-300'
                  }`}>
                    <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Confidence Score
                    </span>
                    <div className={`text-3xl font-black mt-1 flex items-baseline gap-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {result.trust_score}
                      <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-3">
                <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Executive Summary
                </h3>
                <div className={`p-6 rounded-3xl space-y-5 transition-all ${
                  isDark ? 'bg-slate-900/90 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-300 shadow-md'
                }`}>
                  <p className={`font-bold text-base leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    {result.summary.english}
                  </p>
                  {result.summary.urdu && (
                    <p
                      className={`font-bold text-lg leading-loose text-right pt-5 border-t ${
                        isDark ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-900'
                      }`}
                      dir="rtl"
                    >
                      {result.summary.urdu}
                    </p>
                  )}
                </div>
              </div>

              {/* Extracted File Text */}
              {result.extracted_text && (
                <div className="space-y-3">
                  <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                    Extracted Media Content
                  </h3>
                  <div className={`p-5 rounded-2xl ${
                    isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-slate-100 ring-1 ring-slate-300'
                  }`}>
                    <p className={`font-semibold text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                      "{result.extracted_text}"
                    </p>
                  </div>
                </div>
              )}

              {/* Key Findings */}
              {result.key_findings.length > 0 && (
                <div className="space-y-3">
                  <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Key Findings
                  </h3>
                  <div className="space-y-3">
                    {result.key_findings.map((finding, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${
                          isDark ? 'bg-slate-900/90 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-300 shadow-md'
                        }`}
                      >
                        <div className="mt-1 bg-emerald-500/20 p-1 rounded-full text-emerald-600">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className={`text-sm font-bold leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Web Sources */}
              <div className="space-y-3">
                <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Verified Sources
                </h3>
                {result.sources.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {result.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                          isDark
                            ? 'bg-slate-900 ring-1 ring-slate-700 text-emerald-400'
                            : 'bg-white ring-1 ring-slate-300 text-emerald-700 hover:shadow-md'
                        }`}
                      >
                        <span className="text-emerald-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                        <span>{src.title}</span>
                        {src.credibility && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'}`}>
                            {src.credibility}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm font-semibold italic px-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    No external sources retrieved for this search query.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Agent Execution Pipeline Sidebar */}
            <div className="space-y-4">
              <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Agent Telemetry
              </h3>
              
              <div className={`p-5 rounded-3xl h-fit space-y-4 transition-all ${
                isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-slate-200/50 ring-1 ring-slate-300'
              }`}>
                {result.agent_logs.map((log, idx) => {
                  const isFailed = log.status.toLowerCase() === 'failed';
                  return (
                    <div
                      key={idx}
                      className={`relative overflow-hidden p-4 rounded-2xl transition-all ${
                        isDark ? 'bg-slate-900 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-300 shadow-md'
                      }`}
                    >
                      {/* Left color accent line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        isFailed ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}></div>
                      
                      <div className="flex justify-between items-center gap-2 pl-2 mb-2">
                        <span className={`text-xs font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {log.agent_name}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                            isFailed
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <p className={`text-xs font-bold pl-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {log.message}
                      </p>
                    </div>
                  );
                })}

                {result.is_cached && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-xs">Served directly from cache.</p>
                  </div>
                )}

                {result.warnings?.map((warning, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-100 text-amber-900 font-bold border border-amber-300"
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs leading-relaxed">{warning}</p>
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
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Layers,
  ShieldCheck,
  Flame,
  ExternalLink,
  Sparkles,
  Share2,
  Globe,
} from 'lucide-react';

export const CapacitorGuideView: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'To install directly on Android:\n1. Open this page in Google Chrome on your phone.\n2. Tap the Chrome menu (⋮) in the top-right corner.\n3. Tap "Install app" or "Add to Home screen".\n\nKidha Lagce will install with a native app icon, standalone full-screen window, and offline caching!'
      );
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Use public preview URL for cloud builders like PWABuilder
  const publicProductionUrl = 'https://ais-pre-7ydssoxfsodvltgqzhe4g5-766996537238.asia-northeast1.run.app';
  const appUrl = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('ais-dev'))
    ? window.location.origin
    : publicProductionUrl;
  const pwabuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  const steps = [
    {
      title: '1. Install Capacitor & Android Dependencies',
      desc: 'Add the official Capacitor tooling packages to your project',
      code: 'npm install @capacitor/core @capacitor/cli @capacitor/android',
    },
    {
      title: '2. Build Production Web Assets',
      desc: 'Compile the optimized React bundle into the `dist/` directory',
      code: 'npm run build',
    },
    {
      title: '3. Add Android Native Project',
      desc: 'Generates the native Gradle Android project in the `/android` directory',
      code: 'npx cap add android\nnpx cap sync android',
    },
    {
      title: '4. Build Signed APK or Google Play Store AAB',
      desc: 'Open Android Studio and click: Build > Build Bundle(s) / APK(s) > Build APK(s)',
      code: 'npx cap open android\n# Or command line build directly:\ncd android && ./gradlew assembleDebug',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 pb-24">
      {/* Hero Header */}
      <div className="bg-[#181922] border border-[#252838] rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#f4511e] flex items-center justify-center shrink-0 shadow-lg shadow-orange-950/40">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
              Android APK & Production Package
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Kidha Lagce – Android APK & App Installation
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 leading-relaxed">
              Package ID: <strong className="text-white font-mono">com.kidhalagce.app</strong> • Android 7.0 to 14 (API 24–34)
            </p>
          </div>
        </div>

        {/* 1-Tap Install Button */}
        <button
          onClick={handleInstallApp}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-xl shadow-emerald-950/50 flex items-center gap-2 shrink-0 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Install on Android Phone (1-Tap)</span>
        </button>
      </div>

      {installSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Kidha Lagce successfully installed on your Android device! Check your home screen.</span>
        </div>
      )}

      {/* 3 Fast Ways: Cloud APK, Native Capacitor, and Source Code Download */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Option A: Cloud APK Generator */}
        <div className="bg-[#181922] border border-[#252838] hover:border-emerald-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-3 transition-all">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">
                A
              </span>
              <h3 className="font-extrabold text-sm text-white">1-Click APK Generator (PWABuilder)</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Microsoft PWABuilder packages this live app into a signed <strong className="text-white">.apk</strong> (for testing/mobile install) and <strong className="text-white">.aab</strong> (for Play Store) in 60s.
            </p>
          </div>

          <a
            href={pwabuilderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl bg-[#222533] hover:bg-[#2c3042] text-emerald-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30 transition-all"
          >
            <span>Generate APK with PWABuilder</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Option B: Download Full Source Code ZIP */}
        <div className="bg-[#181922] border border-[#252838] hover:border-blue-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-3 transition-all">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-black text-xs flex items-center justify-center">
                B
              </span>
              <h3 className="font-extrabold text-sm text-white">Full Source Code Archive (.ZIP)</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Download the entire production codebase including all React components, Firebase services, Android Capacitor configs, and Tailwind styles in a single ZIP.
            </p>
          </div>

          <a
            href="/kidha-lagce-source-code.zip"
            download="kidha-lagce-source-code.zip"
            className="w-full py-3 rounded-xl bg-[#222533] hover:bg-[#2c3042] text-blue-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-blue-500/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Source Code (ZIP)</span>
          </a>
        </div>

        {/* Option C: Local Android Studio Build */}
        <div className="bg-[#181922] border border-[#252838] hover:border-[#FF6B35]/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-3 transition-all">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#FF6B35]/20 text-[#FF6B35] font-black text-xs flex items-center justify-center">
                C
              </span>
              <h3 className="font-extrabold text-sm text-white">Capacitor Android Studio (Native)</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Run Gradle build locally in Android Studio to output the compiled debug APK directly to <code className="text-[#FF6B35] bg-[#121319] px-1 py-0.5 rounded text-[10px]">android/app/build/outputs/apk/</code>.
            </p>
          </div>

          <button
            onClick={() => copyToClipboard('cd android && ./gradlew assembleDebug', 99)}
            className="w-full py-3 rounded-xl bg-[#222533] hover:bg-[#2c3042] text-[#FF6B35] hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#FF6B35]/30 transition-all"
          >
            {copiedIndex === 99 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedIndex === 99 ? 'Copied Gradle Command' : 'Copy ./gradlew assembleDebug'}</span>
          </button>
        </div>
      </div>

      {/* Package Identifier & App Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold">Package Identifier</div>
          <div className="text-sm font-black text-white mt-1 font-mono">com.kidhalagce.app</div>
        </div>
        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold">Target SDK</div>
          <div className="text-sm font-black text-emerald-400 mt-1 font-mono">Android 14 (API 34)</div>
        </div>
        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold">Min SDK Support</div>
          <div className="text-sm font-black text-[#FF6B35] mt-1 font-mono">Android 7.0 (API 24+)</div>
        </div>
      </div>

      {/* Step by step Terminal Instructions */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#FF6B35]" />
          <span>Step-by-Step Android Studio Commands</span>
        </h2>

        {steps.map((s, idx) => (
          <div
            key={s.title}
            className="bg-[#181922] border border-[#252838] rounded-3xl p-5 space-y-2.5 shadow-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">{s.title}</h3>
              <button
                onClick={() => copyToClipboard(s.code, idx)}
                className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#222432] transition-colors"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-400">{s.desc}</p>
            <pre className="bg-[#121319] border border-[#232535] rounded-2xl p-3 text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">
              {s.code}
            </pre>
          </div>
        ))}
      </div>

      {/* Android Permissions & Features */}
      <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Configured Android Permissions (AndroidManifest.xml)</span>
        </h3>
        <p className="text-xs text-neutral-400">
          Essential permissions configured for live real-time GPS tracking and push notifications:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-neutral-300">
          <div className="bg-[#14151d] p-2.5 rounded-xl border border-[#232535]">
            android.permission.INTERNET
          </div>
          <div className="bg-[#14151d] p-2.5 rounded-xl border border-[#232535]">
            android.permission.ACCESS_FINE_LOCATION
          </div>
          <div className="bg-[#14151d] p-2.5 rounded-xl border border-[#232535]">
            android.permission.POST_NOTIFICATIONS
          </div>
          <div className="bg-[#14151d] p-2.5 rounded-xl border border-[#232535]">
            android.permission.VIBRATE
          </div>
        </div>
      </div>
    </div>
  );
};

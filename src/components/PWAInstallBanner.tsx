import React, { useState } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onDismiss?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onDismiss }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or dismissed, hide
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General instructions for Android / mobile browsers
      alert(
        'To install Aura AI on your mobile phone:\n1. Tap your browser menu (⋮ or share icon).\n2. Select "Add to Home screen" or "Install App".'
      );
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900 to-cyan-950 border-b border-cyan-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-slate-200 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Smartphone className="w-4 h-4" />
          </span>
          <div>
            <span className="font-semibold text-white">Use Aura AI on Mobile:</span>{' '}
            <span className="text-slate-300 hidden sm:inline">
              Install as a native-like app with offline mode &amp; voice!
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition active:scale-95 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Install on Phone
          </button>

          <button
            onClick={() => {
              setDismissed(true);
              onDismiss?.();
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" /> Install on iPhone / iPad
              </h3>
              <button onClick={() => setShowIOSModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button{' '}
                  <Share2 className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> in the Safari toolbar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Scroll down and tap <strong className="text-white">Add to Home Screen</strong>{' '}
                  <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-cyan-400" />.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span>Tap <strong className="text-white">Add</strong> in the top right.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// src/pages/patient/ConsentGate.jsx
// Full-screen "please read and agree" shown to a signed-in patient who has not yet agreed
// to the current privacy and consent text (older accounts, or after the text changes).
// Nothing is shown if they have already agreed. If the check cannot be reached (no
// network), the patient is let through so offline logging keeps working; the check runs
// again the next time they open the app.
import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import ConsentText from '../../components/ConsentText.jsx';
import { getConsent, acceptConsent } from '../../api/consent.js';
import { CONSENT_VERSION } from '../../constants/consent.js';

const ConsentGate = ({ onSignOut }) => {
  const [needed, setNeeded] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getConsent()
      .then((c) => {
        if (alive) setNeeded(c.accepted_version !== c.current_version);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!needed) return null;

  const accept = async () => {
    setSaving(true);
    setError('');
    try {
      await acceptConsent(CONSENT_VERSION);
      setNeeded(false);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Could not save your agreement. Check your connection and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col" role="dialog" aria-modal="true">
      <div className="max-w-xl w-full mx-auto flex flex-col h-full">
        <div className="px-6 pt-8 pb-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 text-[#1A56DB]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B1739]">Before you continue</h1>
          <p className="text-gray-500 text-sm mt-1">
            Please read how HyperLink uses your information.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <ConsentText />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}
          <label className="flex items-start gap-3 text-sm text-[#0B1739] mb-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4"
            />
            <span>
              I have read and understood this. I agree that HyperLink may keep and use my
              information as described, and share my readings with doctors I accept.
            </span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={accept}
              disabled={!agreed || saving}
              className="flex-1 bg-[#0B1739] text-white font-medium py-3 rounded-lg hover:bg-[#0B1739]/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'I agree'}
            </button>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="px-4 py-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentGate;

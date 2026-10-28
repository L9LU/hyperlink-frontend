import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Stethoscope, Check, X } from 'lucide-react';
import {
  getPatientLinkRequests,
  respondToLinkRequest,
  unlinkDoctor,
} from '../../api/doctor.js';

const errorText = (err, fallback) => err?.response?.data?.error || fallback;

const fmtDay = (iso) => {
  if (!iso) return '';
  const s = /(Z|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : iso + 'Z';
  const d = new Date(s);
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Replaces the old "Connect with Your Doctor / Doctor's ID" box on the patient dashboard.
// Doctors now start the connection; the patient decides here.
const LinkRequestsCard = ({ onChanged }) => {
  const [linked, setLinked] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getPatientLinkRequests();
      setLinked(data.linked_doctor || null);
      setRequests(data.requests || []);
      setError('');
    } catch (err) {
      setError(errorText(err, 'Could not load your doctor connections.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Pick up a new request when the patient comes back to this tab or app.
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const respond = async (id, accept) => {
    setBusyId(id);
    setError('');
    setMessage('');
    try {
      await respondToLinkRequest(id, accept);
      setMessage(accept ? 'You are now connected with your doctor.' : 'Request declined.');
      await load();
      onChanged?.();
    } catch (err) {
      // Refresh first (load() clears errors on success), then show the reason.
      await load();
      setError(errorText(err, 'Something went wrong. Please try again.'));
    } finally {
      setBusyId(null);
    }
  };

  const handleUnlink = async () => {
    setBusyId('unlink');
    setError('');
    setMessage('');
    try {
      await unlinkDoctor();
      setConfirmUnlink(false);
      setMessage('You disconnected from your doctor. They can no longer see your readings.');
      await load();
      onChanged?.();
    } catch (err) {
      setError(errorText(err, 'Could not disconnect. Please try again.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="w-5 h-5 text-[#1A56DB]" />
        <h3 className="font-semibold text-[#0B1739]">Your Doctor</h3>
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : linked ? (
        <div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-[#1A56DB]" />
            </div>
            <div>
              <p className="font-medium text-[#0B1739]">{linked.name || 'Your doctor'}</p>
              <p className="text-sm text-gray-500">
                {[linked.specialty, linked.hospital].filter(Boolean).join(' · ')}
              </p>
              {linked.linked_at && (
                <p className="text-xs text-gray-400 mt-1">
                  Connected since {fmtDay(linked.linked_at)}
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Your doctor can see your blood pressure readings and profile.
          </p>

          {confirmUnlink ? (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-sm text-amber-800 mb-3">
                Stop sharing your readings with {linked.name || 'your doctor'}? They will lose
                access straight away.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleUnlink}
                  disabled={busyId === 'unlink'}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                >
                  {busyId === 'unlink' ? 'Disconnecting...' : 'Yes, disconnect'}
                </button>
                <button
                  onClick={() => setConfirmUnlink(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#0B1739] hover:bg-gray-50"
                >
                  Keep connected
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmUnlink(true)}
              className="mt-3 text-sm text-gray-500 hover:text-red-600 underline"
            >
              Disconnect from this doctor
            </button>
          )}
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="border border-gray-200 rounded-lg px-4 py-3">
              <p className="font-medium text-[#0B1739]">
                {r.doctor_name || 'A doctor'} wants to monitor your blood pressure
              </p>
              <p className="text-sm text-gray-500">
                {[r.doctor_specialty, r.doctor_hospital].filter(Boolean).join(' · ')}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                If you accept, they will be able to see your readings and profile. You can
                disconnect at any time.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => respond(r.id, true)}
                  disabled={busyId === r.id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A56DB] text-white text-sm font-medium hover:bg-[#1648b8] disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={() => respond(r.id, false)}
                  disabled={busyId === r.id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#0B1739] hover:bg-gray-50 disabled:opacity-60"
                >
                  <X className="w-4 h-4" />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No doctor connected yet. Your doctor can find you using the phone number or email you
          registered with and send you a request. It will appear here.
        </p>
      )}
    </div>
  );
};

export default LinkRequestsCard;

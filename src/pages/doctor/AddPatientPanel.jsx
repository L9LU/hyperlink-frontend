import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, X, Send, Clock } from 'lucide-react';
import {
  searchPatient,
  sendLinkRequest,
  getDoctorLinkRequests,
  cancelLinkRequest,
} from '../../api/doctor.js';

const errorText = (err, fallback) => err?.response?.data?.error || fallback;

const fmtWhen = (iso) => {
  if (!iso) return '';
  const s = /(Z|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : iso + 'Z';
  const d = new Date(s);
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
};

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-green-50 text-green-700',
  declined: 'bg-gray-100 text-gray-600',
  expired: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS = {
  pending: 'Waiting for patient',
  accepted: 'Connected',
  declined: 'Declined',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

const AddPatientPanel = ({ onClose, onChanged }) => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null); // null = not searched yet
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [requests, setRequests] = useState([]);

  const loadRequests = useCallback(async () => {
    try {
      const data = await getDoctorLinkRequests();
      setRequests(data.requests || []);
    } catch {
      // the list is a convenience; the search still works without it
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setResult(null);
    if (!query.trim()) return;
    setSearching(true);
    try {
      setResult(await searchPatient(query.trim()));
    } catch (err) {
      setError(errorText(err, 'Search failed. Please try again.'));
    } finally {
      setSearching(false);
    }
  };

  const handleSend = async () => {
    if (!result?.patient) return;
    setSending(true);
    setError('');
    try {
      await sendLinkRequest(result.patient.id);
      setNotice(
        `Request sent to ${result.patient.display_name}. They'll see it the next time they open HyperLink.`
      );
      setResult(null);
      setQuery('');
      await loadRequests();
      onChanged?.();
    } catch (err) {
      setError(errorText(err, 'Could not send the request. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (id) => {
    setError('');
    try {
      await cancelLinkRequest(id);
      await loadRequests();
    } catch (err) {
      setError(errorText(err, 'Could not cancel the request.'));
    }
  };

  const p = result?.patient;

  const statusMessage = {
    already_yours: 'This patient is already linked to you.',
    linked_elsewhere: 'This patient is already linked to a doctor.',
    request_pending: "You've already sent this patient a request. Waiting for them to accept.",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#1A56DB]" />
          <h3 className="font-semibold text-[#0B1739]">Add a patient</h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Search by the phone number or email the patient registered with. They'll get a request
        to accept in their app, and you'll see their readings once they do.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Patient's phone number or email"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0B1739] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/30"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A56DB] text-white text-sm font-medium hover:bg-[#1648b8] disabled:opacity-60"
        >
          <Search className="w-4 h-4" />
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}
      {notice && (
        <div className="mt-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2">
          {notice}
        </div>
      )}

      {result && !result.found && (
        <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
          {result.message ||
            'No patient found with that phone number or email. Ask them to register in the app first, then search again.'}
        </div>
      )}

      {p && (
        <div className="mt-3 border border-gray-200 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-[#0B1739]">{p.display_name}</p>
            <p className="text-sm text-gray-500">{p.contact_hint}</p>
          </div>
          {p.status === 'available' ? (
            <button
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A56DB] text-white text-sm font-medium hover:bg-[#1648b8] disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send request'}
            </button>
          ) : (
            <p className="text-sm text-gray-500 max-w-xs">{statusMessage[p.status]}</p>
          )}
        </div>
      )}

      {requests.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Your requests
          </p>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-[#0B1739] truncate">{r.patient_name}</span>
                  <span className="text-gray-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {fmtWhen(r.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {STATUS_LABELS[r.status] || r.status}
                  </span>
                  {r.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="text-xs text-gray-500 hover:text-red-600 underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPatientPanel;

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPatientDetail, markFollowupDone, reviewReading } from '../../api/doctor.js';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ChevronLeft, LogOut, Activity, User, Phone, MessageCircle, CheckCircle2,
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
// Backend stores naive UTC ISO strings; treat them as UTC unless they say otherwise.
const parseTs = (raw) => {
  if (!raw) return null;
  let s = String(raw);
  if (!/(Z|[+-]\d{2}:?\d{2})$/.test(s)) s += 'Z';
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const readingDate = (r) => parseTs(r.timestamp || r.created_at || r.date);

const fmtDateTime = (d) =>
  d
    ? d.toLocaleString('en-NG', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : 'Unknown date';

// Nigerian numbers -> wa.me format (digits only, country code first)
const waNumber = (phone) => {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '234' + digits.slice(1);
  else if (digits.length === 10) digits = '234' + digits;
  return digits || null;
};

const REVIEW_OUTCOMES = [
  { value: 'contacted_patient', label: 'Contacted patient' },
  { value: 'advised_clinic_visit', label: 'Advised clinic visit' },
  { value: 'medication_changed', label: 'Medication changed' },
  { value: 'suspected_bad_reading', label: 'Suspected bad reading' },
];

const outcomeLabel = (v) => REVIEW_OUTCOMES.find((o) => o.value === v)?.label || v;

const PatientDetail = () => {
  const { patientId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [rawReadings, setRawReadings] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [reviewingId, setReviewingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getPatientDetail(patientId, user.user_id);
      setPatient(data.patient || data);
      setRawReadings(data.readings || data.history || []);
      setFollowups(data.followups || []);
      setError('');
    } catch (err) {
      setError("Could not load this patient's details.");
    } finally {
      setLoading(false);
    }
  }, [patientId, user]);

  useEffect(() => {
    if (user?.user_id && patientId) load();
  }, [user, patientId, load]);

  // The API returns newest first. Sort oldest -> newest so the chart reads left
  // to right in time and "latest" really is the latest reading.
  const readings = useMemo(() => {
    return [...rawReadings].sort((a, b) => {
      const da = readingDate(a)?.getTime() ?? 0;
      const db = readingDate(b)?.getTime() ?? 0;
      return da - db;
    });
  }, [rawReadings]);

  const latest = readings[readings.length - 1];

  const chartData = readings.map((r) => ({
    label: fmtDateTime(readingDate(r)),
    systolic: r.systolic,
    diastolic: r.diastolic,
  }));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFollowup = async () => {
    setSaving(true);
    setActionMsg('');
    try {
      await markFollowupDone({
        doctor_id: user.user_id,
        patient_id: patientId,
        note: note.trim(),
      });
      setNote('');
      setActionMsg('Follow-up recorded.');
      await load();
    } catch (err) {
      setActionMsg('Could not record the follow-up. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (readingId, outcome) => {
    if (!outcome) return;
    setReviewingId(readingId);
    setActionMsg('');
    try {
      await reviewReading({
        doctor_id: user.user_id,
        patient_id: patientId,
        reading_id: readingId,
        outcome,
      });
      await load();
    } catch (err) {
      setActionMsg('Could not save the review. Try again.');
    } finally {
      setReviewingId(null);
    }
  };

  const riskBadge = (level) => {
    const styles = {
      CRISIS: 'bg-red-100 text-red-700',
      HIGH: 'bg-red-50 text-red-600',
      ELEVATED: 'bg-orange-50 text-orange-600',
      NORMAL: 'bg-green-50 text-green-600',
      // legacy labels, in case older records still carry them
      MODERATE: 'bg-orange-50 text-orange-600',
      LOW: 'bg-green-50 text-green-600',
    };
    return styles[level] || 'bg-gray-100 text-gray-600';
  };

  const firstName = (patient?.name || '').split(' ')[0];
  const phone = patient?.phone;
  const wa = waNumber(phone);
const doctorName = (user?.name || '').replace(/^dr\.?\s+/i, '').trim();
const waMessage = encodeURIComponent(
  `Hello ${firstName}, this is ${doctorName ? 'Dr. ' + doctorName : 'your doctor'} from HyperLink. ` +
    `I'm checking in on your blood pressure. How are you feeling?`
);

  const needsReview = (r) =>
    ['HIGH', 'CRISIS'].includes(r.risk_level) && !r.reviewed_at;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1A56DB] flex items-center justify-center">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <span className="text-lg font-semibold text-[#0B1739]">HyperLink</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Link
          to="/doctor/dashboard"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Loading patient details...</p>
        ) : (
          <>
            {/* Patient header + contact actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#1A56DB]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#0B1739]">
                    {patient?.name || 'Unknown Patient'}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    {patient?.age ? `${patient.age} years old` : ''}
                    {patient?.email ? ` • ${patient.email}` : ''}
                    {phone ? ` • ${phone}` : ''}
                  </p>
                </div>
              </div>

              {phone && (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-[#0B1739] hover:bg-gray-50"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  {wa && (
                    <a
                      href={`https://wa.me/${wa}?text=${waMessage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Latest reading */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-1">Systolic</p>
                <p className="text-2xl font-bold text-[#1A56DB]">
                  {latest?.systolic ?? '--'}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-1">Diastolic</p>
                <p className="text-2xl font-bold text-green-600">
                  {latest?.diastolic ?? '--'}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-1">Pulse</p>
                <p className="text-2xl font-bold text-orange-500">
                  {latest?.pulse ?? '--'}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-1">Risk Level</p>
                {patient?.risk_level ? (
                  <span
                    className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${riskBadge(patient.risk_level)}`}
                  >
                    {patient.risk_level}
                  </span>
                ) : (
                  <p className="text-2xl font-bold text-gray-300">--</p>
                )}
                {latest && (
                  <p className="text-xs text-gray-400 mt-2">
                    Latest reading: {fmtDateTime(readingDate(latest))}
                  </p>
                )}
              </div>
            </div>

            {/* Follow-up panel */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-[#0B1739] mb-1">Follow-up</h3>
              <p className="text-sm text-gray-500 mb-4">
                Record that you've contacted this patient. This also quiets the
                follow-up flag on your dashboard for a few days.
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Optional note, e.g. called, missed meds, advised clinic visit"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0B1739] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/30"
              />
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleFollowup}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A56DB] text-white text-sm font-medium hover:bg-[#1648b8] disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {saving ? 'Saving...' : 'I followed up'}
                </button>
                {actionMsg && <span className="text-sm text-gray-500">{actionMsg}</span>}
              </div>

              {followups.length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Past follow-ups
                  </p>
                  <div className="space-y-2">
                    {followups.map((f, i) => (
                      <div key={f.id || i} className="text-sm">
                        <span className="text-gray-500">{fmtDateTime(parseTs(f.at))}</span>
                        {f.note ? (
                          <span className="text-[#0B1739]"> — {f.note}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {readings.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                <p className="text-gray-500">This patient hasn't logged any readings yet.</p>
              </div>
            ) : (
              <>
                {/* Trend chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-[#1A56DB]" />
                    <h3 className="font-semibold text-[#0B1739]">Blood Pressure Trend</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="systolic" stroke="#1A56DB" strokeWidth={2} />
                      <Line type="monotone" dataKey="diastolic" stroke="#16A34A" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Full reading history (newest first) */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-[#0B1739] mb-4">Reading History</h3>
                  <div className="space-y-3">
                    {[...readings].reverse().map((r, i) => (
                      <div
                        key={r.id || i}
                        className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {fmtDateTime(readingDate(r))}
                          </span>
                          {r.risk_level && (
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskBadge(r.risk_level)}`}
                            >
                              {r.risk_level}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {r.reviewed_at ? (
                            <span className="text-xs text-gray-500">
                              Reviewed: {outcomeLabel(r.review_outcome)}
                            </span>
                          ) : (
                            needsReview(r) &&
                            r.id && (
                              <select
                                defaultValue=""
                                disabled={reviewingId === r.id}
                                onChange={(e) => handleReview(r.id, e.target.value)}
                                className="text-xs border border-gray-200 rounded-md px-2 py-1 text-[#0B1739] bg-white"
                              >
                                <option value="" disabled>
                                  Mark reviewed…
                                </option>
                                {REVIEW_OUTCOMES.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            )
                          )}
                          <span className="text-sm font-medium text-[#0B1739]">
                            {r.systolic}/{r.diastolic} mmHg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PatientDetail;

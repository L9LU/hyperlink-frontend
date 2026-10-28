import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDoctorPatients } from '../../api/doctor.js';
import AddPatientPanel from './AddPatientPanel.jsx';
import { Users, LogOut, AlertCircle, PhoneCall, Clock, UserPlus } from 'lucide-react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High' },
  { key: 'crisis', label: 'Crisis' },
  { key: 'followup', label: 'Follow-up' },
];

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      const data = await getDoctorPatients(user.user_id);
      setPatients(Array.isArray(data) ? data : data.patients || []);
      setSummary(Array.isArray(data) ? null : data.summary || null);
      setError('');
    } catch (err) {
      setError('Could not load your patient list.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.user_id) {
      fetchPatients();
    }
  }, [user, fetchPatients]);

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  // Counts: use the backend summary when present, otherwise work them out here.
  const count = (key, fallbackFn) =>
    summary && summary[key] !== undefined ? summary[key] : patients.filter(fallbackFn).length;

  const totals = {
    total: summary?.total ?? patients.length,
    crisis: count('crisis', (p) => p.risk_level === 'CRISIS'),
    high: count('high', (p) => p.risk_level === 'HIGH'),
    followup: count('needs_followup', (p) => p.needs_followup),
  };

  const filterCounts = {
    all: totals.total,
    high: totals.high + totals.crisis, // the "High" tab includes Crisis, like the backend filter
    crisis: totals.crisis,
    followup: totals.followup,
  };

  const visible = patients.filter((p) => {
    if (filter === 'high') return ['HIGH', 'CRISIS'].includes(p.risk_level);
    if (filter === 'crisis') return p.risk_level === 'CRISIS';
    if (filter === 'followup') return p.needs_followup;
    return true;
  });

  const followupText = (p) => {
    if (p.followup_reason === 'never_logged') {
      return p.days_since_linked != null
        ? `Never logged · linked ${p.days_since_linked}d ago`
        : 'Never logged';
    }
    return p.days_since_last_log != null
      ? `Stopped logging · ${p.days_since_last_log}d`
      : 'Stopped logging';
  };

  const emptyMessage = {
    high: 'No patients with a high or crisis reading.',
    crisis: 'No patients in crisis right now.',
    followup: 'No patients need a follow-up right now.',
  }[filter];

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
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1739] mb-1">
              Welcome back, Dr. {user?.name?.split(' ').slice(-1)[0] || ''}
            </h1>
            <p className="text-gray-500">Here's an overview of your patients.</p>
          </div>
          {!showAdd && (
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A56DB] text-white text-sm font-medium hover:bg-[#1648b8]"
            >
              <UserPlus className="w-4 h-4" />
              Add patient
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {showAdd && (
          <AddPatientPanel onClose={() => setShowAdd(false)} onChanged={fetchPatients} />
        )}

        {loading ? (
          <p className="text-gray-400">Loading your patients...</p>
        ) : patients.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-[#1A56DB]" />
            </div>
            <h2 className="text-lg font-semibold text-[#0B1739] mb-1">
              No patients linked yet
            </h2>
            <p className="text-gray-500 mb-6">
              Search for a patient by their phone number or email and send them a request.
              Once they accept, they'll appear here for monitoring.
            </p>
            {!showAdd && (
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A56DB] text-white text-sm font-medium hover:bg-[#1648b8]"
              >
                <UserPlus className="w-4 h-4" />
                Add patient
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-1">Total Patients</p>
                <p className="text-2xl font-bold text-[#0B1739]">{totals.total}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-1">Crisis</p>
                <p className="text-2xl font-bold text-red-700">{totals.crisis}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-1">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{totals.high}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-1">Needs Follow-up</p>
                <p className="text-2xl font-bold text-orange-500">{totals.followup}</p>
              </div>
            </div>

            {/* Patient list */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold text-[#0B1739]">Your Patients</h3>
                <div className="flex items-center gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition ${
                        filter === f.key
                          ? 'bg-[#1A56DB] border-[#1A56DB] text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {f.label}
                      <span className={filter === f.key ? 'ml-1.5 opacity-80' : 'ml-1.5 text-gray-400'}>
                        {filterCounts[f.key]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {visible.length === 0 ? (
                <p className="px-6 py-10 text-center text-gray-500 text-sm">
                  {emptyMessage}
                </p>
              ) : (
                <div>
                  {visible.map((p, i) => (
                    <div
                      key={p.id || i}
                      onClick={() => navigate(`/doctor/patient/${p.id}`)}
                      className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <span className="text-[#1A56DB] font-semibold text-sm">
                            {p.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[#0B1739]">{p.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">
                            {p.latest_reading
                              ? `${p.latest_reading.systolic}/${p.latest_reading.diastolic} mmHg`
                              : 'No readings yet'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {p.needs_followup && (
                          <span className="text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 bg-amber-50 text-amber-700">
                            <PhoneCall className="w-3 h-3" />
                            {followupText(p)}
                          </span>
                        )}
                        {!p.needs_followup && p.followup_snoozed && (
                          <span className="text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 bg-gray-100 text-gray-500">
                            <Clock className="w-3 h-3" />
                            Followed up
                          </span>
                        )}
                        {p.risk_level && (
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 ${riskBadge(p.risk_level)}`}
                          >
                            {['CRISIS', 'HIGH'].includes(p.risk_level) && (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            {p.risk_level}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;

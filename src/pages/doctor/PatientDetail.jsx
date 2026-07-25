import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPatientDetail } from '../../api/doctor.js';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ChevronLeft, LogOut, Activity, User } from 'lucide-react';

const PatientDetail = () => {
  const { patientId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getPatientDetail(patientId, user.user_id);
        setPatient(data.patient || data);
        setReadings(data.readings || data.history || []);
      } catch (err) {
        setError('Could not load this patient\'s details.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id && patientId) {
      fetchDetail();
    }
  }, [user, patientId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const chartData = readings.map((r) => ({
    date: r.date || r.created_at || '',
    systolic: r.systolic,
    diastolic: r.diastolic,
  }));

  const latest = readings[readings.length - 1];

  const riskBadge = (level) => {
    const styles = {
      HIGH: 'bg-red-50 text-red-600',
      MODERATE: 'bg-orange-50 text-orange-600',
      ELEVATED: 'bg-orange-50 text-orange-600',
      LOW: 'bg-green-50 text-green-600',
      NORMAL: 'bg-green-50 text-green-600',
    };
    return styles[level] || 'bg-gray-100 text-gray-600';
  };

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
            {/* Patient header */}
            <div className="flex items-center gap-4 mb-8">
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
                </p>
              </div>
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
              </div>
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
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="systolic" stroke="#1A56DB" strokeWidth={2} />
                      <Line type="monotone" dataKey="diastolic" stroke="#16A34A" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Full reading history */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-[#0B1739] mb-4">Reading History</h3>
                  <div className="space-y-3">
                    {[...readings].reverse().map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-sm text-gray-500">
                          {r.date || r.created_at || 'Unknown date'}
                        </span>
                        <span className="text-sm font-medium text-[#0B1739]">
                          {r.systolic}/{r.diastolic} mmHg
                        </span>
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
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDoctorPatients } from '../../api/doctor.js';
import { Users, LogOut, AlertCircle } from 'lucide-react';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getDoctorPatients(user.user_id);
        setPatients(Array.isArray(data) ? data : data.patients || []);
      } catch (err) {
        setError('Could not load your patient list.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchPatients();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <h1 className="text-2xl font-bold text-[#0B1739] mb-1">
          Welcome back, Dr. {user?.name?.split(' ').slice(-1)[0] || ''}
        </h1>
        <p className="text-gray-500 mb-8">
          Here's an overview of your patients.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
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
              Once patients link their account to you, they'll appear here for monitoring.
            </p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-1">Total Patients</p>
                <p className="text-2xl font-bold text-[#0B1739]">{patients.length}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-1">High Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {patients.filter((p) => p.risk_level === 'HIGH').length}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-1">Needs Attention</p>
                <p className="text-2xl font-bold text-orange-500">
                  {patients.filter((p) => ['HIGH', 'ELEVATED', 'MODERATE'].includes(p.risk_level)).length}
                </p>
              </div>
            </div>

            {/* Patient list */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-[#0B1739]">Your Patients</h3>
              </div>
              <div>
                {patients.map((p, i) => (
                  <div
                    key={p.id || i}
                    onClick={() => navigate(`/doctor/patient/${p.id}`)}
                    className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
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
                    {p.risk_level && (
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 ${riskBadge(p.risk_level)}`}
                      >
                        {['HIGH', 'ELEVATED'].includes(p.risk_level) && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {p.risk_level}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
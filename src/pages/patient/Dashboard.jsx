import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getHistory, getPrediction } from '../../api/records.js';
import { linkPatient } from '../../api/doctor.js';
import { updateMeasurements } from '../../api/patient.js';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Activity, Plus, LogOut, Heart, Shield, UserPlus, Ruler } from 'lucide-react';

const PatientDashboard = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [risk, setRisk] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState('');

  const [doctorId, setDoctorId] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState(false);

  // Height/weight prompt — shown when a risk check fails because BMI is missing
  const [needsMeasurements, setNeedsMeasurements] = useState(false);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [measurementsLoading, setMeasurementsLoading] = useState(false);
  const [measurementsError, setMeasurementsError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistory(user.user_id);
        setReadings(Array.isArray(data) ? data : data.readings || []);
      } catch (err) {
        setError('Could not load your reading history.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchHistory();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const latest = readings[readings.length - 1];

  const chartData = readings.map((r) => ({
    date: r.date || r.created_at || '',
    systolic: r.systolic,
    diastolic: r.diastolic,
  }));

  const runRiskCheck = async (patientData) => {
    const result = await getPrediction({
      patient_id: patientData.user_id,
      age: patientData.age,
      bmi: patientData.bmi,
      family_history: patientData.family_history,
      exercise_level: patientData.exercise_level,
      smoking_status: patientData.smoking_status,
      bp_history: patientData.bp_history,
      systolic: latest.systolic,
      diastolic: latest.diastolic,
      pulse: latest.pulse,
    });
    setRisk(result);
  };

  const handleCheckRisk = async () => {
    setRiskError('');
    setRiskLoading(true);
    try {
      await runRiskCheck(user);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Could not calculate risk score.';

      // If BMI is the specific problem, prompt for height/weight instead
      // of just showing a dead-end error message.
      if (message.toLowerCase().includes('bmi')) {
        setNeedsMeasurements(true);
      } else {
        setRiskError(message);
      }
    } finally {
      setRiskLoading(false);
    }
  };

  const handleSaveMeasurements = async (e) => {
    e.preventDefault();
    setMeasurementsError('');

    if (!heightCm || !weightKg) {
      setMeasurementsError('Please enter both height and weight.');
      return;
    }

    setMeasurementsLoading(true);
    try {
      const result = await updateMeasurements({
        patient_id: user.user_id,
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
      });

      // Update local user context so we don't need a fresh login to see the new BMI
      const updatedUser = { ...user, bmi: result.bmi, height_cm: Number(heightCm), weight_kg: Number(weightKg) };
      login(updatedUser);

      setNeedsMeasurements(false);
      setHeightCm('');
      setWeightKg('');

      // Now retry the risk check with the freshly-saved BMI
      setRiskLoading(true);
      await runRiskCheck(updatedUser);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Could not save your measurements. Please try again.';
      setMeasurementsError(message);
    } finally {
      setMeasurementsLoading(false);
      setRiskLoading(false);
    }
  };

  const handleLinkDoctor = async (e) => {
    e.preventDefault();
    setLinkError('');
    setLinkSuccess(false);

    if (!doctorId) {
      setLinkError('Please enter your doctor\'s ID.');
      return;
    }

    setLinkLoading(true);
    try {
      await linkPatient({
        patient_id: user.user_id,
        doctor_id: doctorId,
      });
      setLinkSuccess(true);
      setDoctorId('');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Could not link to this doctor. Please check the ID and try again.';
      setLinkError(message);
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
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
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-gray-500 mb-8">
          Here's an overview of your blood pressure health.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Loading your data...</p>
        ) : readings.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-[#1A56DB]" />
            </div>
            <h2 className="text-lg font-semibold text-[#0B1739] mb-1">
              No readings yet
            </h2>
            <p className="text-gray-500 mb-6">
              Log your first blood pressure reading to start tracking your health.
            </p>
            <button
              onClick={() => navigate('/patient/log-reading')}
              className="inline-flex items-center gap-2 bg-[#0B1739] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#0B1739]/90 transition"
            >
              <Plus className="w-4 h-4" />
              Log New Reading
            </button>
          </div>
        ) : (
          <>
            {/* Latest reading + action */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            </div>

            <button
              onClick={() => navigate('/patient/log-reading')}
              className="inline-flex items-center gap-2 bg-[#0B1739] text-white font-medium px-5 py-2.5 rounded-lg hover:bg-[#0B1739]/90 transition mb-8"
            >
              <Plus className="w-4 h-4" />
              Log New Reading
            </button>

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

            {/* Risk prediction */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-[#1A56DB]" />
                <h3 className="font-semibold text-[#0B1739]">Risk Assessment</h3>
              </div>

              {riskError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                  {riskError}
                </div>
              )}

              {needsMeasurements ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Ruler className="w-4 h-4 text-[#1A56DB]" />
                    <p className="text-sm font-medium text-[#0B1739]">
                      We need your height and weight to calculate your risk score.
                    </p>
                  </div>

                  {measurementsError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                      {measurementsError}
                    </div>
                  )}

                  <form onSubmit={handleSaveMeasurements} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="Height (cm)"
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                    />
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="Weight (kg)"
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                    />
                    <button
                      type="submit"
                      disabled={measurementsLoading}
                      className="bg-[#0B1739] text-white font-medium px-5 py-2.5 rounded-lg hover:bg-[#0B1739]/90 transition disabled:opacity-60 whitespace-nowrap"
                    >
                      {measurementsLoading ? 'Saving...' : 'Save & Check Risk'}
                    </button>
                  </form>
                </div>
              ) : risk ? (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Risk Score</p>
                  <p className="text-3xl font-bold text-[#0B1739] mb-2">
                    {risk.risk_score ?? risk.score ?? '--'}%
                  </p>
                  <span
                    className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
                      (risk.risk_level ?? risk.level) === 'HIGH'
                        ? 'bg-red-50 text-red-600'
                        : (risk.risk_level ?? risk.level) === 'MODERATE'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-green-50 text-green-600'
                    }`}
                  >
                    {risk.risk_level ?? risk.level ?? 'Unknown'}
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm mb-4">
                    Get an ML-powered assessment of your hypertension risk based on your latest reading.
                  </p>
                  <button
                    onClick={handleCheckRisk}
                    disabled={riskLoading}
                    className="inline-flex items-center gap-2 bg-[#1A56DB] text-white font-medium px-5 py-2.5 rounded-lg hover:bg-[#1A56DB]/90 transition disabled:opacity-60"
                  >
                    {riskLoading ? 'Calculating...' : 'Check My Risk'}
                  </button>
                </div>
              )}
            </div>

            {/* Link to a doctor */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-4 h-4 text-[#1A56DB]" />
                <h3 className="font-semibold text-[#0B1739]">Connect with Your Doctor</h3>
              </div>

              {linkError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                  {linkError}
                </div>
              )}

              {linkSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
                  Successfully linked! Your doctor can now see your readings.
                </div>
              )}

              <p className="text-gray-500 text-sm mb-4">
                Enter your doctor's ID to give them access to monitor your readings. Ask your doctor for their ID.
              </p>

              <form onSubmit={handleLinkDoctor} className="flex gap-3">
                <input
                  type="text"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  placeholder="Doctor's ID"
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
                <button
                  type="submit"
                  disabled={linkLoading}
                  className="bg-[#0B1739] text-white font-medium px-5 py-2.5 rounded-lg hover:bg-[#0B1739]/90 transition disabled:opacity-60 whitespace-nowrap"
                >
                  {linkLoading ? 'Linking...' : 'Link Doctor'}
                </button>
              </form>
            </div>

            {/* Recent readings list */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-[#0B1739] mb-4">Recent Readings</h3>
              <div className="space-y-3">
                {[...readings].reverse().slice(0, 5).map((r, i) => (
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
      </main>
    </div>
  );
};

export default PatientDashboard;
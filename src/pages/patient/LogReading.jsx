import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { logReading } from '../../api/records.js';
import { ChevronLeft, Activity, HeartPulse } from 'lucide-react';

const LogReading = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.systolic || !form.diastolic || !form.pulse) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await logReading({
        patient_id: user.user_id,
        systolic: Number(form.systolic),
        diastolic: Number(form.diastolic),
        pulse: Number(form.pulse),
      });

      navigate('/patient/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Could not save your reading. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1A56DB] flex items-center justify-center">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <span className="text-lg font-semibold text-[#0B1739]">HyperLink</span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-10">
        <Link
          to="/patient/dashboard"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-[#1A56DB]" />
          </div>

          <h1 className="text-2xl font-bold text-[#0B1739] mb-1">
            Log New Reading
          </h1>
          <p className="text-gray-500 mb-6">
            Enter your latest blood pressure measurement.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#0B1739] mb-1">
                  Systolic
                </label>
                <input
                  type="number"
                  value={form.systolic}
                  onChange={handleChange('systolic')}
                  placeholder="120"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0B1739] mb-1">
                  Diastolic
                </label>
                <input
                  type="number"
                  value={form.diastolic}
                  onChange={handleChange('diastolic')}
                  placeholder="80"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>
            </div>

            <label className="block text-sm font-medium text-[#0B1739] mb-1">
              Pulse (bpm)
            </label>
            <div className="relative mb-6">
              <HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={form.pulse}
                onChange={handleChange('pulse')}
                placeholder="72"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B1739] text-white font-medium py-3 rounded-lg hover:bg-[#0B1739]/90 transition disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Reading'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LogReading;
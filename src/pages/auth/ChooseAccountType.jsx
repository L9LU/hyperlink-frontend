import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout.jsx';
import { Heart, Stethoscope, ArrowRight, ChevronLeft } from 'lucide-react';

const ChooseAccountType = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) return;
    if (selected === 'patient') {
      navigate('/register/patient');
    } else if (selected === 'doctor') {
      navigate('/register/doctor');
    }
  };

  return (
    <AuthLayout>
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold text-[#0B1739] mb-1">
          Choose Your Account Type
        </h1>
        <p className="text-gray-500 mb-6">
          How would you like to use HyperLink?
        </p>

        <div className="space-y-4 mb-6">
          {/* Patient card */}
          <button
            type="button"
            onClick={() => setSelected('patient')}
            className={`w-full text-left border rounded-xl p-5 flex gap-4 transition ${
              selected === 'patient'
                ? 'border-[#1A56DB] ring-2 ring-[#1A56DB]/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0B1739] text-lg mb-1">
                Patient
              </h3>
              <p className="text-gray-500 text-sm">
                Track blood pressure, receive reminders, and stay connected with your doctor
              </p>
            </div>
          </button>

          {/* Doctor card */}
          <button
            type="button"
            onClick={() => setSelected('doctor')}
            className={`w-full text-left border rounded-xl p-5 flex gap-4 transition ${
              selected === 'doctor'
                ? 'border-[#1A56DB] ring-2 ring-[#1A56DB]/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <Stethoscope className="w-6 h-6 text-[#0B1739]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0B1739] text-lg mb-1">
                Doctor
              </h3>
              <p className="text-gray-500 text-sm">
                Monitor patients remotely and respond quickly to critical cases
              </p>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected}
          className="w-full bg-[#0B1739] text-white font-medium py-3 rounded-lg hover:bg-[#0B1739]/90 transition mb-4 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1A56DB] font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ChooseAccountType;
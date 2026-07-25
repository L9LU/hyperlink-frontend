import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const AccountReady = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleContinue = () => {
    if (user?.role === 'doctor') {
      navigate('/doctor/dashboard');
    } else {
      navigate('/patient/dashboard');
    }
  };

  return (
    <AuthLayout>
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={1.5} />
        </div>

        <span className="inline-block bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
          Account Verified
        </span>

        <h1 className="text-3xl font-bold text-[#0B1739] mb-2">
          Account Ready!
        </h1>
        <p className="text-gray-500 mb-8">
          Your account has been successfully created. You can now begin
          monitoring your health with HyperLink.
        </p>

        <button
          type="button"
          onClick={handleContinue}
          className="w-full bg-[#0B1739] text-white font-medium py-3 rounded-lg hover:bg-[#0B1739]/90 transition flex items-center justify-center gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </AuthLayout>
  );
};

export default AccountReady;
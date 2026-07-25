import AuthLayout from '../../components/AuthLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck } from 'lucide-react';

const PendingVerification = () => {
  const { user, logout } = useAuth();

  return (
    <AuthLayout>
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-7 h-7 text-[#1A56DB]" />
        </div>

        <h1 className="text-2xl font-bold text-[#0B1739] mb-2">
          Verification in Progress
        </h1>
        <p className="text-gray-500 mb-6">
          Thanks for registering, {user?.name || 'Doctor'}. We're verifying your
          medical license with the relevant regulatory body. This usually takes
          1–2 business days. You'll get full access to your dashboard once
          verified.
        </p>

        <button
          onClick={logout}
          className="w-full border border-gray-300 text-[#0B1739] font-medium py-3 rounded-lg hover:bg-gray-50 transition"
        >
          Sign Out
        </button>
      </div>
    </AuthLayout>
  );
};

export default PendingVerification;
import AuthLayout from '../../components/AuthLayout.jsx';

const Welcome = () => {
  return (
    <AuthLayout>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#1A56DB] flex items-center justify-center">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <span className="text-xl font-semibold text-[#0B1739]">HyperLink</span>
        </div>

        <div className="inline-block bg-blue-50 text-[#1A56DB] text-xs font-medium px-3 py-1 rounded-full mb-6">
          Trusted by 10,000+ Nigerians
        </div>

        <h1 className="text-3xl font-bold text-[#0B1739] mb-2">
          Welcome to HyperLink
        </h1>
        <p className="text-gray-500 mb-8">
          Your trusted platform for remote hypertension monitoring.
        </p>

        <div className="space-y-3">
          <button className="w-full bg-[#0B1739] text-white font-medium py-3 rounded-lg hover:bg-[#0B1739]/90 transition">
            Sign In
          </button>
          <button className="w-full border border-gray-300 text-[#0B1739] font-medium py-3 rounded-lg hover:bg-gray-50 transition">
            Create Account
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Welcome;
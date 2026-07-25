import AuthLayout from '../../components/AuthLayout.jsx';
import { Mail, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  return (
    <AuthLayout>
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <Mail className="w-16 h-16 text-[#1A56DB]" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold text-[#0B1739] mb-2">
          Verify Your Email
        </h1>
        <p className="text-gray-500 mb-8">
          We've sent a verification link to your email address. Please check
          your inbox to activate your account.
        </p>

        <a 
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#0B1739] text-white font-medium py-3 rounded-lg hover:bg-[#0B1739]/90 transition mb-3 flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Open Email
        </a>

        <button
          type="button"
          className="w-full border border-gray-300 text-[#0B1739] font-medium py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Resend Mail
        </button>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
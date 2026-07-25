import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout.jsx';
import { Phone } from 'lucide-react';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every((digit) => digit !== '');

  const handleVerify = () => {
    if (!isComplete) return;
    // TODO: call backend OTP verification endpoint once it exists
    navigate('/account-ready');
  };

  return (
    <AuthLayout>
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
          <Phone className="w-6 h-6 text-[#1A56DB]" />
        </div>

        <h1 className="text-2xl font-bold text-[#0B1739] mb-2">
          Verify Your Identity
        </h1>
        <p className="text-gray-500 mb-8">
          Enter the 6-digit code sent to your phone number.
        </p>

        <div className="flex justify-center gap-2 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/20"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={!isComplete}
          className="w-full bg-[#0B1739] text-white font-medium py-3 rounded-lg hover:bg-[#0B1739]/90 transition mb-4 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Verify Code
        </button>

        <p className="text-sm text-gray-500">
          Didn't receive the code?{' '}
          <button type="button" className="text-[#1A56DB] font-medium hover:underline">
            Resend Code
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;
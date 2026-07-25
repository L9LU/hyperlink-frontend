import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { loginUser } from '../../api/auth.js';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  const response = await loginUser({ email, password });
login(response);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
 const response = await loginUser({ email, password });
login(response);

if (response.role === 'doctor' || response.role === 'pharmacist') {
  if (response.verified === false) {
    navigate('/pending-verification');
  } else {
    navigate(response.role === 'doctor' ? '/doctor/dashboard' : '/pharmacist/dashboard');
  }
} else {
  navigate('/patient/dashboard');
}
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Login failed. Please check your credentials and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold text-[#0B1739] mb-1">
          Welcome Back!
        </h1>
        <p className="text-gray-500 mb-6">
          Sign in to continue monitoring your health.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Email Address
        </label>
        <div className="relative mb-4">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="akintunde@gmail.com"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
          />
        </div>

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Password
        </label>
        <div className="relative mb-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="text-right mb-4">
          <a href="#" className="text-sm text-[#1A56DB] hover:underline">
            Forgot Password?
          </a>
        </div>

        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-600">Remember me for 30 days</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0B1739] text-white font-medium py-3 rounded-lg hover:bg-[#0B1739]/90 transition mb-4 disabled:opacity-60"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          type="button"
          className="w-full border border-gray-300 rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition mb-4"
        >
          <span className="font-medium">Continue with Google</span>
        </button>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <a href="#" className="text-[#1A56DB] font-medium hover:underline">
            Create Account
          </a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout.jsx';
import { registerUser } from '../../api/auth.js';
import { UNITS } from '../../constants/units.js';
import { User, Mail, Phone, IdCard, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react';

const RegisterDoctor = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    hospital: '',
    unit: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !form.fullName.trim() || !form.email.trim() || !form.phone.trim() ||
      !form.licenseNumber.trim() || !form.hospital.trim() || !form.unit || !form.password
    ) {
      setError('Please fill in all required fields (marked with *).');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    // Spaces, dashes and brackets are fine; we only count the digits.
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setError('Enter a valid phone number, e.g. 0801 234 5678. Crisis alerts for your patients are sent to it.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        license_number: form.licenseNumber.trim(),
        hospital: form.hospital.trim(),
        unit: form.unit,
        // older backend versions read `department`, so send the unit's name there too
        department: UNITS.find((u) => u.code === form.unit)?.label || '',
        password: form.password,
        role: 'doctor',
      });

      navigate('/login');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} noValidate>
        <Link
          to="/choose-account-type"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold text-[#0B1739] mb-1">
          Create Doctor Account
        </h1>
        <p className="text-gray-500 mb-6">
          Create your professional account.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Full Name *
        </label>
        <div className="relative mb-4">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={form.fullName}
            onChange={handleChange('fullName')}
            placeholder="Dr. Akintunde Ola"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
          />
        </div>

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Email Address *
        </label>
        <div className="relative mb-4">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="akintunde@gmail.com"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
          />
        </div>

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Phone Number *
        </label>
        <div className="relative mb-4">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            placeholder="0801 234 5678"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
          />
        </div>
        <p className="text-xs text-gray-400 -mt-2 mb-4">
          Crisis alerts for your patients are sent to this number.
        </p>

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Medical License Number *
        </label>
        <div className="relative mb-4">
          <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={form.licenseNumber}
            onChange={handleChange('licenseNumber')}
            placeholder="MDCN/R/68971"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
          />
        </div>

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Hospital *
        </label>
        <input
          type="text"
          value={form.hospital}
          onChange={handleChange('hospital')}
          placeholder="Full name of your hospital"
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
        />
        <p className="text-xs text-gray-400 mt-1 mb-4">
          Use the hospital's full official name, so colleagues at the same hospital match.
        </p>

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Unit *
        </label>
        <select
          value={form.unit}
          onChange={handleChange('unit')}
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] text-gray-700 mb-4"
        >
          <option value="">Select your unit</option>
          {UNITS.map((u) => (
            <option key={u.code} value={u.code}>
              {u.label}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Password * <span className="text-gray-400 font-normal">(at least 8 characters)</span>
        </label>
        <div className="relative mb-4">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange('password')}
            placeholder="••••••••"
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

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Confirm Password *
        </label>
        <div className="relative mb-6">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0B1739] text-white font-medium py-3 rounded-lg hover:bg-[#0B1739]/90 transition disabled:opacity-60"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default RegisterDoctor;

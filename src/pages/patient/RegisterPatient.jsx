import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout.jsx';
import { registerUser } from '../../api/auth.js';
import { User, Mail, Phone, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react';

const RegisterPatient = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    heightCm: '',
    weightKg: '',
    hospital: '',
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

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Calculate BMI from height/weight if both are provided
    let bmi = null;
    if (form.heightCm && form.weightKg) {
      const heightM = Number(form.heightCm) / 100;
      bmi = Math.round((Number(form.weightKg) / (heightM * heightM)) * 10) / 10;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        phone: form.phone,
        age: form.age,
        gender: form.gender,
        height_cm: form.heightCm ? Number(form.heightCm) : null,
        weight_kg: form.weightKg ? Number(form.weightKg) : null,
        bmi: bmi,
        hospital: form.hospital,
        password: form.password,
        role: 'patient',
      });

      // Registration successful — send them to login to sign in with new credentials
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
      <form onSubmit={handleSubmit}>
        <Link
          to="/choose-account-type"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold text-[#0B1739] mb-1">
          Create Patient Account
        </h1>
        <p className="text-gray-500 mb-6">
          Let's get you started with your health profile.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#0B1739] mb-1">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.firstName}
                onChange={handleChange('firstName')}
                placeholder="Akintunde"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0B1739] mb-1">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.lastName}
                onChange={handleChange('lastName')}
                placeholder="Tijani"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              />
            </div>
          </div>
        </div>

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Email Address
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
          Phone Number
        </label>
        <div className="relative mb-4">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            placeholder="+234 123 456 7890"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#0B1739] mb-1">
              Age
            </label>
            <input
              type="number"
              value={form.age}
              onChange={handleChange('age')}
              placeholder="45"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0B1739] mb-1">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={handleChange('gender')}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] text-gray-700"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#0B1739] mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={form.heightCm}
              onChange={handleChange('heightCm')}
              placeholder="170"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0B1739] mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              value={form.weightKg}
              onChange={handleChange('weightKg')}
              placeholder="68"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2 mb-4">
          Used to calculate your BMI for risk assessment. You can add this later if you skip it now.
        </p>

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Hospital
        </label>
        <input
          type="text"
          value={form.hospital}
          onChange={handleChange('hospital')}
          placeholder="Select your hospital"
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] mb-4"
        />

        <label className="block text-sm font-medium text-[#0B1739] mb-1">
          Password
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
          Confirm Password
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

export default RegisterPatient;
import { useState } from 'react';
import { Languages } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateLanguage } from '../../api/settings.js';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../../constants/languages.js';

// Lets a patient choose the language their care assistant uses.
// Saved to their profile and kept in the signed-in session.
const LanguageCard = () => {
  const { user, login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const current = user?.language || DEFAULT_LANGUAGE;

  const handleChange = async (e) => {
    const language = e.target.value;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await updateLanguage(language);
      login({ ...user, language });
      setMessage('Saved.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save your language. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Languages className="w-5 h-5 text-[#1A56DB]" />
        <h3 className="font-semibold text-[#0B1739]">Care assistant language</h3>
      </div>
      <p className="text-sm text-gray-500 mb-3">
        Choose the language you would like to receive messages and reminders in.
      </p>
      <select
        value={current}
        onChange={handleChange}
        disabled={saving}
        aria-label="Preferred language"
        className="w-full sm:w-64 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] text-[#0B1739] disabled:opacity-60"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default LanguageCard;

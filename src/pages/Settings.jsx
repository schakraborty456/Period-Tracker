import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, saveUserProfile, deleteUserAllData } from '../services/firestore';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import BottomNav from '../components/BottomNav';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Settings() {
  const { currentUser, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Profile Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [dietPreference, setDietPreference] = useState('non-veg');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [language, setLanguage] = useState('en');
  const [aiConsent, setAiConsent] = useState(false);

  // Status & Modal States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Load existing profile
  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setName(profile.name || '');
          setAge(profile.age ? String(profile.age) : '');
          setDietPreference(profile.dietPreference || 'non-veg');
          setCycleLength(profile.avgCycleLength || 28);
          setPeriodLength(profile.avgPeriodLength || 5);
          setLanguage(profile.language || 'en');
          setAiConsent(Boolean(profile.aiConsent));
        }
      } catch (err) {
        console.error('Error loading settings profile:', err);
        setErrorMessage('Unable to load profile data.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [currentUser]);

  // Handle Profile Save
  async function handleSaveProfile(e) {
    if (e) e.preventDefault();
    if (!currentUser) return;

    // Validate inputs
    const numCycle = Number(cycleLength);
    const numPeriod = Number(periodLength);
    const numAge = Number(age);

    if (numCycle < 20 || numCycle > 45) {
      setErrorMessage('Cycle length must be between 20 and 45 days.');
      return;
    }
    if (numPeriod < 2 || numPeriod > 10) {
      setErrorMessage('Period duration must be between 2 and 10 days.');
      return;
    }
    if (age && (numAge < 10 || numAge > 70)) {
      setErrorMessage('Please enter a valid age between 10 and 70.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSaveSuccess(false);

      await saveUserProfile(currentUser.uid, {
        name,
        age: numAge || '',
        dietPreference,
        avgCycleLength: numCycle,
        avgPeriodLength: numPeriod,
        language,
        aiConsent,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update profile settings:', err);
      setErrorMessage('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Handle Account & Data Deletion (GDPR & Privacy Compliance)
  async function handleDeleteAccountAndData() {
    if (!currentUser) return;

    try {
      setDeleting(true);
      setErrorMessage('');

      // 1. Delete all Firestore data (periods, dailyLogs, profile)
      await deleteUserAllData(currentUser.uid);

      // 2. Delete Firebase Auth user
      await deleteAccount();

      // 3. Redirect to signup
      navigate('/signup', { replace: true });
    } catch (err) {
      console.error('Error deleting account and data:', err);
      if (err.code === 'auth/requires-recent-login') {
        setErrorMessage(
          'For security, you must have logged in recently to delete your account. Please sign out, sign in again, and retry.'
        );
      } else {
        setErrorMessage(
          err.message || 'An error occurred while deleting your account. Please try again.'
        );
      }
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  const diets = [
    { key: 'non-veg', label: 'Non-Veg', icon: '🍗' },
    { key: 'veg', label: 'Vegetarian', icon: '🥗' },
    { key: 'eggetarian', label: 'Eggetarian', icon: '🥚' },
  ];

  return (
    <div className="min-h-screen bg-background text-textMain px-4 pt-6 pb-28 md:pb-12">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Top Header */}
        <header className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-9 h-9 rounded-xl bg-white border border-pink-100 flex items-center justify-center text-textMuted hover:text-textMain hover:border-primary/40 transition-colors shadow-xs"
              aria-label="Back to Dashboard"
            >
              ←
            </Link>
            <div>
              <h1 className="text-lg font-bold font-heading text-textMain leading-tight">
                Settings & Privacy
              </h1>
              <p className="text-xs text-textMuted truncate max-w-[220px]">
                {currentUser?.email}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-primary bg-primary-soft/50 px-2.5 py-1 rounded-full border border-pink-100 flex items-center gap-1">
            <span>⚙️</span>
            <span>Account</span>
          </span>
        </header>

        {/* Feedback Messages */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccess && (
          <div
            role="status"
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between shadow-xs animate-fade-in"
          >
            <span className="flex items-center gap-2 font-medium">
              <span>🌸</span>
              <span>Profile settings saved successfully!</span>
            </span>
            <span className="text-xs text-emerald-700 font-bold">✓ Updated</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <Card className="text-center p-8 space-y-2">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-textMuted">Loading settings...</p>
          </Card>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* 1. PROFILE & CYCLE PREFERENCES */}
            <Card className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-pink-50">
                <span className="text-lg">👤</span>
                <h2 className="text-sm font-bold font-heading text-textMain uppercase tracking-wider">
                  Profile & Cycle Preferences
                </h2>
              </div>

              <div className="space-y-3.5">
                <Input
                  label="Display Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sarah"
                />

                <Input
                  label="Age (years)"
                  type="number"
                  min="10"
                  max="70"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g., 24"
                />

                {/* Diet Preference Chips */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-textMain">
                    Dietary Preference
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {diets.map((d) => {
                      const isSelected = dietPreference === d.key;
                      return (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => setDietPreference(d.key)}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'border-primary bg-primary-soft/60 shadow-xs ring-1 ring-primary/40 font-semibold text-primary'
                              : 'border-pink-100/90 bg-white hover:border-pink-200 text-textMuted'
                          }`}
                        >
                          <span className="text-lg">{d.icon}</span>
                          <span className="text-[11px] font-medium leading-tight text-textMain">
                            {d.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Input
                    label="Typical Cycle Length"
                    type="number"
                    min="20"
                    max="45"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(e.target.value)}
                    helperText="20–45 days"
                  />

                  <Input
                    label="Typical Period Duration"
                    type="number"
                    min="2"
                    max="10"
                    value={periodLength}
                    onChange={(e) => setPeriodLength(e.target.value)}
                    helperText="2–10 days"
                  />
                </div>

                {/* Language preference */}
                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-semibold text-textMain">
                    Preferred Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-pink-100 bg-background text-textMain focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="en">English</option>
                    <option value="bn">Bengali (বাংলা) - Preview</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={saving}
                  className="shadow-xs"
                >
                  Save Profile Changes
                </Button>
              </div>
            </Card>

            {/* 2. PRIVACY & AI CONSENT */}
            <Card className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-pink-50">
                <span className="text-lg">🔒</span>
                <h2 className="text-sm font-bold font-heading text-textMain uppercase tracking-wider">
                  Privacy & Data Consent
                </h2>
              </div>

              <div className="p-3.5 rounded-xl bg-pink-50/40 border border-pink-100 space-y-2 text-xs">
                <p className="font-semibold text-textMain">
                  Your cycle and health data belongs only to you.
                </p>
                <p className="text-[11px] text-textMuted leading-relaxed">
                  Data is secured behind personal user Firestore security rules. Your health entries are never sold or shared with advertisers.
                </p>
              </div>

              {/* AI Consent Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={aiConsent}
                  onChange={(e) => setAiConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-textMain block">
                    Allow AI Assistant Context (Version 2)
                  </span>
                  <span className="text-[11px] text-textMuted block leading-relaxed">
                    Allows anonymous cycle phase and diet context for tailored assistant answers. Your name, email, and personal identifiers are strictly excluded.
                  </span>
                </div>
              </label>

              <div className="pt-1 text-center border-t border-pink-50">
                <Link
                  to="/privacy"
                  className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>🛡️</span>
                  <span>Read Full Privacy Policy & Data Guarantees →</span>
                </Link>
              </div>
            </Card>

            {/* 3. ACCOUNT ACTIONS */}
            <Card className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-pink-50">
                <span className="text-lg">🚪</span>
                <h2 className="text-sm font-bold font-heading text-textMain uppercase tracking-wider">
                  Session & Sign Out
                </h2>
              </div>

              <p className="text-xs text-textMuted">
                Signed in as <strong className="text-textMain">{currentUser?.email}</strong>
              </p>

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => logout()}
                className="text-xs"
              >
                Sign Out
              </Button>
            </Card>

            {/* 4. DANGER ZONE: DELETE ACCOUNT & ALL DATA */}
            <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-3">
              <div className="flex items-center gap-2 text-rose-950 font-bold text-xs uppercase tracking-wider">
                <span>⚠️</span>
                <span>Danger Zone</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-rose-950">
                  Delete Account and Wipe All Data
                </p>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Permanently deletes your account, personal profile, logged periods, cycle history, and all daily symptom logs. This action cannot be undone.
                </p>
              </div>

              <Button
                type="button"
                variant="danger"
                fullWidth
                onClick={() => {
                  setDeleteConfirmationText('');
                  setShowDeleteModal(true);
                }}
                className="text-xs shadow-xs"
              >
                Delete Account & All Data
              </Button>
            </div>
          </form>
        )}

        {/* Global Medical Disclaimer Banner */}
        <DisclaimerBanner variant="footer" className="mt-4" />
      </div>

      {/* CONFIRMATION MODAL FOR ACCOUNT DELETION */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
        >
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-rose-200 p-5 sm:p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold font-heading text-rose-950">
                Are you absolutely sure?
              </h3>
              <p className="text-xs text-textMuted leading-relaxed">
                This action is <strong>irreversible</strong>. It will permanently wipe your profile, all period records, cycle averages, and daily symptoms from our database.
              </p>
            </div>

            <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-100 text-[11px] text-rose-900 space-y-1">
              <p className="font-semibold">Type "DELETE" below to confirm:</p>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full text-xs p-2 rounded-lg border border-rose-200 bg-white focus:outline-none focus:ring-1 focus:ring-danger text-center font-bold text-rose-950 tracking-wider"
              />
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="danger"
                fullWidth
                disabled={deleteConfirmationText !== 'DELETE'}
                loading={deleting}
                onClick={handleDeleteAccountAndData}
                className="text-xs shadow-xs"
              >
                Yes, Delete All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}


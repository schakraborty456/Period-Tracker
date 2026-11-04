import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { saveOnboardingData } from '../services/firestore';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Onboarding({ onComplete }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const minDateStr = format(subDays(new Date(), 90), 'yyyy-MM-dd');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    lastPeriodDate: '',
    cycleLength: 28,
    periodLength: 5,
    name: '',
    age: '',
    dietPreference: 'non-veg', // 'veg' | 'non-veg' | 'eggetarian'
    aiConsent: true,
    termsConsent: false,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }

  function validateStep(currentStep) {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.lastPeriodDate) {
        newErrors.lastPeriodDate = 'Please select the first day of your last period.';
      } else if (formData.lastPeriodDate > todayStr) {
        newErrors.lastPeriodDate = 'Period date cannot be in the future.';
      }

      const cycle = Number(formData.cycleLength);
      if (!cycle || cycle < 20 || cycle > 60) {
        newErrors.cycleLength = 'Average cycle length is usually between 21 and 45 days (enter 20-60).';
      }

      const period = Number(formData.periodLength);
      if (!period || period < 2 || period > 12) {
        newErrors.periodLength = 'Period length is usually between 3 and 7 days (enter 2-12).';
      } else if (cycle && period >= cycle) {
        newErrors.periodLength = 'Period length must be shorter than your total cycle length.';
      }
    }

    if (currentStep === 2) {
      const ageNum = Number(formData.age);
      if (!formData.age || isNaN(ageNum) || ageNum < 12 || ageNum > 80) {
        newErrors.age = 'Please enter a valid age between 12 and 80.';
      }
      if (!formData.dietPreference) {
        newErrors.dietPreference = 'Please select your diet preference.';
      }
    }

    if (currentStep === 3) {
      if (!formData.termsConsent) {
        newErrors.termsConsent = 'You must agree to the disclaimer and terms to continue.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  }

  function handleBack() {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep(3)) return;

    if (!currentUser) {
      setSubmitError('You must be signed in to save your onboarding information.');
      return;
    }

    try {
      setSaving(true);
      setSubmitError('');
      await saveOnboardingData(currentUser.uid, formData);
      if (onComplete) {
        onComplete(formData);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Error saving onboarding data:', err);
      setSubmitError('Failed to save your details to Firebase. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  const dietOptions = [
    {
      value: 'non-veg',
      label: 'Non-Vegetarian',
      desc: 'Fish, meat, eggs, and plants',
      icon: '🍗',
    },
    {
      value: 'veg',
      label: 'Vegetarian',
      desc: 'Plant-based foods and dairy',
      icon: '🥗',
    },
    {
      value: 'eggetarian',
      label: 'Eggetarian',
      desc: 'Plant foods, dairy, and eggs',
      icon: '🥚',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-textMain px-4 py-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-[480px]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-soft text-primary rounded-2xl flex items-center justify-center mx-auto mb-2.5 text-2xl shadow-xs">
            🌸
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-textMain">
            Personalize Your Experience
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1">
            Step {step} of 3 • {step === 1 ? 'Cycle Details' : step === 2 ? 'About You' : 'Consent & Terms'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-pink-100 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step Card */}
        <div className="bg-surface rounded-2xl shadow-sm border border-pink-100 p-6 sm:p-7">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Cycle Details */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold font-heading text-textMain mb-1">
                    When did your last period start?
                  </h2>
                  <p className="text-xs text-textMuted mb-3">
                    This helps us predict your next cycle, ovulation, and current phase.
                  </p>
                  <Input
                    id="lastPeriodDate"
                    label="First day of last period"
                    type="date"
                    value={formData.lastPeriodDate}
                    max={todayStr}
                    min={minDateStr}
                    onChange={(e) => updateField('lastPeriodDate', e.target.value)}
                    error={errors.lastPeriodDate}
                    required
                  />
                </div>

                <div className="pt-2 border-t border-pink-50">
                  <h2 className="text-base font-semibold font-heading text-textMain mb-1">
                    Cycle & Period Lengths
                  </h2>
                  <p className="text-xs text-textMuted mb-3">
                    If you're not sure, standard averages (28 and 5 days) are a good starting point.
                  </p>

                  <div className="space-y-4">
                    <Input
                      id="cycleLength"
                      label="Average cycle length (days)"
                      type="number"
                      value={formData.cycleLength}
                      onChange={(e) => updateField('cycleLength', e.target.value)}
                      min={20}
                      max={60}
                      error={errors.cycleLength}
                      helperText="Count from Day 1 of one period to Day 1 of the next (typical: 28 days)"
                      required
                    />

                    <Input
                      id="periodLength"
                      label="Average period length (days)"
                      type="number"
                      value={formData.periodLength}
                      onChange={(e) => updateField('periodLength', e.target.value)}
                      min={2}
                      max={12}
                      error={errors.periodLength}
                      helperText="How many days bleeding usually lasts (typical: 3-7 days)"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: About You */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold font-heading text-textMain mb-1">
                    Tell us about yourself
                  </h2>
                  <p className="text-xs text-textMuted mb-3">
                    Used to tailor nutrition recommendations for your life stage and diet.
                  </p>
                </div>

                <Input
                  id="name"
                  label="Name or nickname (optional)"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="How should we call you?"
                />

                <Input
                  id="age"
                  label="Your age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  placeholder="e.g. 24"
                  min={12}
                  max={80}
                  error={errors.age}
                  required
                />

                <div className="pt-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textMuted block mb-2">
                    Diet Preference <span className="text-danger">*</span>
                  </label>
                  <div className="space-y-2.5">
                    {dietOptions.map((opt) => {
                      const isSelected = formData.dietPreference === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField('dietPreference', opt.value)}
                          className={`w-full p-3.5 rounded-xl border text-left transition-all duration-150 flex items-center justify-between min-h-[48px] ${
                            isSelected
                              ? 'border-primary bg-primary-soft/50 ring-1 ring-primary'
                              : 'border-pink-100 bg-white hover:bg-pink-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{opt.icon}</span>
                            <div>
                              <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-textMain'}`}>
                                {opt.label}
                              </p>
                              <p className="text-xs text-textMuted">{opt.desc}</p>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected ? 'border-primary bg-primary' : 'border-pink-200'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.dietPreference && (
                    <p className="text-xs text-danger font-medium mt-1">{errors.dietPreference}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Consent & Disclaimer */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold font-heading text-textMain mb-1">
                    Health Disclaimer & Consent
                  </h2>
                  <p className="text-xs text-textMuted mb-3">
                    Please review our medical disclaimer and privacy terms.
                  </p>
                </div>

                {/* Disclaimer banner */}
                <div className="p-4 rounded-xl bg-pink-50/70 border border-pink-200 text-textMain text-xs leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <span>🛡️</span>
                    <span>Important Health Notice</span>
                  </div>
                  <p className="text-textMuted">
                    This app provides general cycle tracking, lifestyle, and nutrition information only. It is{' '}
                    <strong className="text-textMain">not a substitute for professional medical advice</strong>, diagnosis, or contraception planning.
                  </p>
                  <p className="text-textMuted">
                    If you experience very heavy bleeding, severe pain, or missed periods, please consult a qualified healthcare professional.
                  </p>
                </div>

                {/* Consent checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-pink-50/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.aiConsent}
                      onChange={(e) => updateField('aiConsent', e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary rounded border-pink-300 focus:ring-primary accent-primary"
                    />
                    <div className="text-xs text-textMuted leading-snug">
                      <span className="font-medium text-textMain">Personalized Tips & AI Assistant Consent</span>
                      <p className="mt-0.5">
                        Allow the app to use your phase and diet preferences to personalize nutrition tips and assistant answers (your name & email are never shared with AI).
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-pink-50/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.termsConsent}
                      onChange={(e) => updateField('termsConsent', e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary rounded border-pink-300 focus:ring-primary accent-primary"
                      required
                    />
                    <div className="text-xs text-textMuted leading-snug">
                      <span className="font-medium text-textMain">
                        I understand and agree to the disclaimer <span className="text-danger">*</span>
                      </span>
                      <p className="mt-0.5">
                        I acknowledge that predictions are estimates and this app is for informational tracking only.
                      </p>
                    </div>
                  </label>
                  {errors.termsConsent && (
                    <p className="text-xs text-danger font-medium">{errors.termsConsent}</p>
                  )}
                  {submitError && (
                    <div
                      role="alert"
                      className="p-3 rounded-xl bg-red-50 border border-red-200 text-danger text-xs font-medium flex items-start gap-2"
                    >
                      <span>⚠️</span>
                      <span>{submitError}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-pink-100">
              {step > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  disabled={saving}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  className="flex-1"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  loading={saving}
                  disabled={!formData.termsConsent || saving}
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


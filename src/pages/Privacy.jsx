import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-textMain px-4 pt-6 pb-16">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-white border border-pink-100 flex items-center justify-center text-textMuted hover:text-textMain hover:border-primary/40 transition-colors shadow-xs"
              aria-label="Go back"
            >
              ←
            </button>
            <div>
              <h1 className="text-lg font-bold font-heading text-textMain leading-tight">
                Privacy Policy & Data Security
              </h1>
              <p className="text-xs text-textMuted">
                Last updated: November 2026 • Version 1.0
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="text-xs font-semibold text-primary hover:underline hidden sm:block"
          >
            Dashboard
          </Link>
        </header>

        {/* Hero Card */}
        <Card className="space-y-3 bg-gradient-to-br from-white to-pink-50/40 border-pink-100">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <span>🛡️</span>
            <span>Our Privacy Commitment</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-heading text-textMain">
            Your intimate health and cycle data belongs solely to you.
          </h2>
          <p className="text-xs text-textMuted leading-relaxed">
            Menstrual and reproductive health information is among the most sensitive personal data. We are committed to absolute transparency, zero data monetization, and giving you complete control over your health records.
          </p>
        </Card>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="p-4 space-y-1.5 bg-white border-pink-100/90 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-primary flex items-center justify-center text-base">
              🔒
            </div>
            <h3 className="text-xs font-bold text-textMain font-heading">
              Zero Data Monetization
            </h3>
            <p className="text-[11px] text-textMuted leading-relaxed">
              We never sell, rent, trade, or share your health records, cycle entries, or symptom logs with advertisers or third-party data brokers.
            </p>
          </Card>

          <Card className="p-4 space-y-1.5 bg-white border-pink-100/90 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-base">
              🛡️
            </div>
            <h3 className="text-xs font-bold text-textMain font-heading">
              Strict Isolation & Rules
            </h3>
            <p className="text-[11px] text-textMuted leading-relaxed">
              Your entries are strictly isolated under your personal user account. Enforced Firestore security rules guarantee that no other user can access your data.
            </p>
          </Card>

          <Card className="p-4 space-y-1.5 bg-white border-pink-100/90 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-base">
              🤖
            </div>
            <h3 className="text-xs font-bold text-textMain font-heading">
              AI Anonymization
            </h3>
            <p className="text-[11px] text-textMuted leading-relaxed">
              If you opt into AI Assistant features, only anonymous cycle context (e.g. current phase and diet) is used. Your name, email, and identity are never passed to the AI.
            </p>
          </Card>

          <Card className="p-4 space-y-1.5 bg-white border-pink-100/90 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center text-base">
              🗑️
            </div>
            <h3 className="text-xs font-bold text-textMain font-heading">
              Right to Permanent Erasure
            </h3>
            <p className="text-[11px] text-textMuted leading-relaxed">
              You can wipe your entire profile, all recorded periods, cycle predictions, and daily logs at any time from your Settings page with immediate effect.
            </p>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-4">
          {/* Section 1 */}
          <Card className="space-y-2">
            <h3 className="text-sm font-bold font-heading text-textMain flex items-center gap-2">
              <span>1.</span>
              <span>Information We Collect</span>
            </h3>
            <div className="text-xs text-textMuted leading-relaxed space-y-2">
              <p>When you register and use the app, we collect only the information necessary to provide accurate tracking:</p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                <li><strong className="text-textMain">Account Details:</strong> Email address and optional display name for login authentication.</li>
                <li><strong className="text-textMain">Cycle Baseline:</strong> First day of last period, typical cycle length, and bleeding duration.</li>
                <li><strong className="text-textMain">Daily Health Logs:</strong> Flow intensity (light, medium, heavy, spotting), symptoms, mood emojis, water intake, and personal notes.</li>
                <li><strong className="text-textMain">Dietary Preference:</strong> Vegetarian, non-vegetarian, or eggetarian choice for filtering nutrition recommendations.</li>
              </ul>
            </div>
          </Card>

          {/* Section 2 */}
          <Card className="space-y-2">
            <h3 className="text-sm font-bold font-heading text-textMain flex items-center gap-2">
              <span>2.</span>
              <span>How We Use Your Data</span>
            </h3>
            <div className="text-xs text-textMuted leading-relaxed space-y-1.5 text-[11px]">
              <p>
                <strong>Pure Rule-Based Cycle Predictions:</strong> Predictions for next period dates, fertile windows, and ovulation days are calculated using pure, deterministic mathematical formulas in your browser. We never use AI or machine learning algorithms to guess cycle dates.
              </p>
              <p>
                <strong>Static Nutrition Guidance:</strong> Food suggestions are loaded from a reviewed static content repository filtered by your phase and diet choice.
              </p>
            </div>
          </Card>

          {/* Section 3 */}
          <Card className="space-y-2">
            <h3 className="text-sm font-bold font-heading text-textMain flex items-center gap-2">
              <span>3.</span>
              <span>AI Assistant Privacy Safeguards (Version 2)</span>
            </h3>
            <div className="text-xs text-textMuted leading-relaxed space-y-1.5 text-[11px]">
              <p>
                When you use the AI Assistant feature in future updates, privacy protections include:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Explicit opt-in consent required before any context is shared.</li>
                <li>Zero personal identifiers (no name, email, user ID, or IP address).</li>
                <li>API keys are stored strictly server-side and never exposed in client code.</li>
                <li>All AI answers include a mandatory disclaimer and redirect red-flag symptoms to a medical doctor.</li>
              </ul>
            </div>
          </Card>

          {/* Section 4 */}
          <Card className="space-y-2">
            <h3 className="text-sm font-bold font-heading text-textMain flex items-center gap-2">
              <span>4.</span>
              <span>Your Rights & Data Management (GDPR Compliance)</span>
            </h3>
            <div className="text-xs text-textMuted leading-relaxed space-y-1.5 text-[11px]">
              <p>
                Under privacy regulations including GDPR and CCPA, you have full control over your data:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li><strong className="text-textMain">Access & Edit:</strong> You can view and edit your profile, period lengths, and logs anytime in Settings and Daily Log.</li>
                <li><strong className="text-textMain">Consent Withdrawal:</strong> You can revoke AI assistant consent at any time via Settings.</li>
                <li><strong className="text-textMain">Irreversible Erasure:</strong> Clicking "Delete Account & All Data" in Settings permanently removes all Firestore documents and deletes your authentication account.</li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Medical Disclaimer Banner */}
        <DisclaimerBanner variant="footer" className="mt-4" />

        {/* Back navigation */}
        <div className="text-center pt-2">
          <Link to="/" className="inline-block">
            <Button variant="secondary" className="text-xs !py-2.5 !px-5">
              ← Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

/**
 * AiConsentModal - Mandatory AI Assistant Consent Gate (Task 6.4b).
 *
 * Displays the required Google processing disclosure and privacy commitments
 * before granting access to the Gemini AI assistant.
 *
 * @param {object} props
 * @param {boolean} props.isOpen Whether the modal is visible
 * @param {Function} props.onConsent Callback when the user agrees to the terms
 * @param {Function} props.onClose Callback when the user cancels or closes
 * @param {boolean} [props.isSubmitting=false] Whether consent is currently saving
 */
export default function AiConsentModal({
  isOpen,
  onConsent,
  onClose,
  isSubmitting = false,
}) {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !isSubmitting && onClose) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-consent-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && onClose) {
          onClose();
        }
      }}
    >
      <div className="bg-surface max-w-md w-full rounded-2xl shadow-xl border border-pink-100 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-primary-soft/40 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" role="img" aria-label="AI Guide">
              🌸
            </span>
            <div>
              <h2
                id="ai-consent-modal-title"
                className="text-base font-bold font-heading text-textMain"
              >
                AI Assistant &amp; Privacy Terms
              </h2>
              <p className="text-[11px] text-textMuted">
                Educational cycle, nutrition, and self-care information
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white text-textMuted hover:text-textMain border border-pink-100 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs leading-relaxed">
          {/* Mandatory Disclosure Banner */}
          <div className="p-4 rounded-xl bg-pink-50/80 border border-pink-200 text-textMain space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <span className="text-base">🛡️</span>
              <span>Mandatory Service Disclosure</span>
            </div>
            <p className="font-semibold text-textMain text-xs sm:text-sm">
              &ldquo;Your question and cycle context are processed by Google and may be reviewed.&rdquo;
            </p>
            <p className="text-textMuted text-[11px]">
              Our assistant uses Google&apos;s Gemini Developer API. Under Google&apos;s terms, questions and sanitized cycle details are processed by Google and may be reviewed by human reviewers to ensure service quality and safety.
            </p>
          </div>

          {/* Privacy & Zero-PII Guarantees */}
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold text-sm mt-0.5" aria-hidden="true">
                ✓
              </span>
              <div>
                <strong className="text-textMain block font-semibold">
                  Sanitized Cycle Context Only
                </strong>
                <span className="text-textMuted">
                  We send only your current phase, cycle day, diet preference, recent symptom tags (last 7 days), and non-diagnostic pattern flags to tailor tips.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-rose-500 font-bold text-sm mt-0.5" aria-hidden="true">
                ✕
              </span>
              <div>
                <strong className="text-textMain block font-semibold">
                  Zero Personal Identifiers (No PII)
                </strong>
                <span className="text-textMuted">
                  Your name, email address, account user ID, date of birth, and personal log notes are <strong>never</strong> shared with Google or the AI model.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-primary font-bold text-sm mt-0.5" aria-hidden="true">
                ℹ
              </span>
              <div>
                <strong className="text-textMain block font-semibold">
                  General Information, Not Medical Advice
                </strong>
                <span className="text-textMuted">
                  The assistant cannot provide medical diagnoses, prescribe medications or dosages, or offer contraception planning. Always consult a doctor for medical concerns.
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Link */}
          <p className="text-[11px] text-textMuted text-center pt-2 border-t border-pink-100">
            For more information, see our{' '}
            <Link
              to="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold underline hover:text-primary-dark"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-background border-t border-pink-100 space-y-2">
          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={onConsent}
            disabled={isSubmitting}
            className="min-h-[44px]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Saving Preferences...</span>
              </span>
            ) : (
              'I Agree & Continue'
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={isSubmitting}
            className="min-h-[44px] text-textMuted hover:text-textMain"
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  );
}

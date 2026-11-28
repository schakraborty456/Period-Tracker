import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AiConsentModal from './AiConsentModal';

describe('AiConsentModal.jsx - AI Consent Gate Modal (Task 6.4b)', () => {
  const onConsentMock = vi.fn();
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderModal(props = {}) {
    return render(
      <MemoryRouter>
        <AiConsentModal
          isOpen={true}
          onConsent={onConsentMock}
          onClose={onCloseMock}
          {...props}
        />
      </MemoryRouter>
    );
  }

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MemoryRouter>
        <AiConsentModal isOpen={false} onConsent={onConsentMock} onClose={onCloseMock} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog with accessibility attributes when isOpen is true', () => {
    renderModal();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('ai-consent-modal-title');
    expect(screen.getByText(/AI Assistant & Privacy Terms/i)).toBeTruthy();
  });

  it('prominently displays the mandatory disclosure verbatim', () => {
    renderModal();

    // Must match: "Your question and cycle context are processed by Google and may be reviewed."
    const disclosure = screen.getByText(
      /Your question and cycle context are processed by Google and may be reviewed\./i
    );
    expect(disclosure).toBeTruthy();
  });

  it('explains Zero-PII principles (no name, email, userId, notes)', () => {
    renderModal();

    expect(screen.getByText(/Zero Personal Identifiers/i)).toBeTruthy();
    expect(screen.getByText(/name, email address, account user ID/i)).toBeTruthy();
  });

  it('contains a link pointing to /privacy', () => {
    renderModal();

    const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
    expect(privacyLink).toBeTruthy();
    expect(privacyLink.getAttribute('href')).toBe('/privacy');
  });

  it('calls onConsent when user clicks "I Agree & Continue"', () => {
    renderModal();

    const agreeButton = screen.getByRole('button', { name: /I Agree & Continue/i });
    fireEvent.click(agreeButton);

    expect(onConsentMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when user clicks "Not Now"', () => {
    renderModal();

    const notNowButton = screen.getByRole('button', { name: /Not Now/i });
    fireEvent.click(notNowButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when user clicks the close icon button', () => {
    renderModal();

    const closeButton = screen.getByRole('button', { name: /Close dialog/i });
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when user presses Escape key', () => {
    renderModal();

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('disables buttons and shows loading text when isSubmitting is true', () => {
    renderModal({ isSubmitting: true });

    expect(screen.getByText(/Saving Preferences\.\.\./i)).toBeTruthy();
    const agreeButton = screen.getByRole('button', { name: /Saving Preferences\.\.\./i });
    expect(agreeButton.disabled).toBe(true);

    const notNowButton = screen.getByRole('button', { name: /Not Now/i });
    expect(notNowButton.disabled).toBe(true);
  });
});

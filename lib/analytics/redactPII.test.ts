import { describe, expect, it } from 'vitest';
import { redactPII } from './redactPII';

describe('redactPII', () => {
  it('redacts email addresses', () => {
    expect(redactPII('Contact support@example.com for help')).toBe(
      'Contact [redacted] for help',
    );
  });

  it('redacts multiple emails', () => {
    expect(redactPII('a@b.com and c@d.co')).toBe('[redacted] and [redacted]');
  });

  it('redacts phone numbers', () => {
    expect(redactPII('Call 555-123-4567 now')).toBe('Call [redacted] now');
  });

  it('redacts phone numbers with country code', () => {
    expect(redactPII('reach me at +1 202 555 0147')).toBe('reach me at [redacted]');
  });

  it('redacts emails and phones together', () => {
    expect(redactPII('user@site.com 415-555-2671')).toBe('[redacted] [redacted]');
  });

  it('leaves clean text untouched', () => {
    expect(redactPII('bitcoin trending up')).toBe('bitcoin trending up');
  });

  it('handles empty string', () => {
    expect(redactPII('')).toBe('');
  });
});

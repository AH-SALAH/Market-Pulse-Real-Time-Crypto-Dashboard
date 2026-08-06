const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const PHONE_PATTERN = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;

export function redactPII(text: string): string {
  return text.replace(EMAIL_PATTERN, '[redacted]').replace(PHONE_PATTERN, '[redacted]');
}

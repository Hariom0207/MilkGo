/** Indian mobile: 10 digits, starting 6-9. Shared by every phone field. */
export const PHONE_RE = /^[6-9]\d{9}$/
export const PHONE_ERROR = 'Enter a valid 10-digit mobile number (starting with 6-9)'
export const isValidPhone = (v: string) => PHONE_RE.test(v)

/** Keep only digits, drop +91 prefix, cap at 10 digits. */
export function sanitizePhone(v: string): string {
  let d = v.replace(/\D/g, '')
  if (d.length > 10 && d.startsWith('91')) d = d.slice(2)
  return d.slice(0, 10)
}

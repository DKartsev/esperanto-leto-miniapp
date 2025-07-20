const USERNAME_ENV = import.meta.env.VITE_ADMIN_USERNAME || ''
const EMAIL_ENV = import.meta.env.VITE_ADMIN_EMAIL || ''

export const ADMIN_USERNAMES = USERNAME_ENV
  ? USERNAME_ENV.split(',').map((u: string) => u.trim().toLowerCase())
  : []
export const ADMIN_EMAILS = EMAIL_ENV
  ? EMAIL_ENV.split(',').map((e: string) => e.trim().toLowerCase())
  : []

export function isAdmin(username?: string | null, email?: string | null): boolean {
  const uname = username?.toLowerCase() || '';
  const emailLower = email?.toLowerCase() || '';
  return ADMIN_USERNAMES.includes(uname) || ADMIN_EMAILS.includes(emailLower);
}

export const ADMIN_EMAIL = ADMIN_EMAILS[0];
export const ADMIN_USERNAME = ADMIN_USERNAMES[0];

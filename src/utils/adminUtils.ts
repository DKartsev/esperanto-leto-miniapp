export const ADMIN_USERNAMES = ['admin5050', 'admin', 'administrator'];
export const ADMIN_EMAILS = ['admin5050@gmail.com'];

export function isAdmin(username?: string | null, email?: string | null): boolean {
  const uname = username?.toLowerCase() || '';
  const emailLower = email?.toLowerCase() || '';
  return ADMIN_USERNAMES.includes(uname) || ADMIN_EMAILS.includes(emailLower);
}

export const ADMIN_EMAIL = ADMIN_EMAILS[0];
export const ADMIN_USERNAME = ADMIN_USERNAMES[0];

/**
 * Builds email verification URL
 * @param {string} email - User email
 * @param {string} from - Optional redirect path after verification
 */
export function buildVerifyUrl(email, from) {
  if (!email) return "/auth/login";
  let url = `/auth/verify-email?email=${encodeURIComponent(email)}`;
  if (from && typeof from === "string") {
    url += `&from=${encodeURIComponent(from)}`;
  }
  return url;
}

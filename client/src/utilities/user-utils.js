/**
 * Generates initials from a full name (e.g., "John Doe" -> "JD").
 * Robustly handles extra spaces and missing names.
 */
export function getInitials(name) {
  if (!name || typeof name !== "string") return "U";
  
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  
  return parts
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

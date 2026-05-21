export function isAdmin(role: string): boolean {
  return role === "ADMIN" || role === "OWNER";
}

export function canViewAnalytics(role: string): boolean {
  return role === "OWNER" || role === "DATA_ANALYST";
}

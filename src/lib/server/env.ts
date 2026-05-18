// Server environment is configured directly in db.ts with hardcoded connection
// No required env vars needed for database (connection is IP-based)
export function ensureServerEnv() {
  // No-op: connection details are in src/lib/db.ts
}

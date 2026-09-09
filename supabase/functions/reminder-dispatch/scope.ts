/** Both identifiers are mandatory so a malformed test can never become a broadcast. */
export function dispatchScope(url: URL) {
  const userId = url.searchParams.get("user_id");
  const reminderId = url.searchParams.get("reminder_id");
  if (userId === null && reminderId === null) return null;
  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!userId || !reminderId || !uuid.test(userId) || !uuid.test(reminderId)) {
    throw new Error("Both user_id and reminder_id must be valid UUIDs");
  }
  return { userId, reminderId };
}

export type EmailConfig = { key?: string; from?: string; testTo?: string };
export function emailReady(config: EmailConfig): boolean {
  return !!(config.key && config.from && !config.testTo &&
    !/@resend\.dev\b/i.test(config.from));
}
export function emailAllowed(
  config: EmailConfig,
  recipient: string,
  scoped: boolean,
): boolean {
  if (emailReady(config)) return true;
  return !!(scoped && config.key && config.from && config.testTo &&
    recipient.toLowerCase() === config.testTo.trim().toLowerCase());
}

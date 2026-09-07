type ReadResult = { error: { message: string } | null };
/** Only retry reads for a newly issued token's brief server clock skew. */
export async function readWithSessionRetry<T extends ReadResult[]>(
  read: () => Promise<T>,
  pause: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const result = await read();
    if (
      attempt >= 3 ||
      !result.some((r) => r.error?.message.includes("JWT issued at future"))
    )
      return result;
    await pause(1000 * 2 ** attempt);
  }
}

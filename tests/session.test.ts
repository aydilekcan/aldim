import test from "node:test";
import assert from "node:assert/strict";
import { readWithSessionRetry } from "../shared/retry";
test("new session reads recover from transient server clock skew", async () => {
  let calls = 0;
  const delays: number[] = [];
  const result = await readWithSessionRetry(
    async () => [
      { error: ++calls < 3 ? { message: "JWT issued at future" } : null },
    ],
    async (ms) => {
      delays.push(ms);
    },
  );
  assert.equal(result[0].error, null);
  assert.deepEqual(delays, [1000, 2000]);
});
test("session retries stop and do not retry ordinary permission errors", async () => {
  for (const [message, expected] of [
    ["JWT issued at future", 4],
    ["permission denied", 1],
  ] as const) {
    let calls = 0;
    await readWithSessionRetry(
      async () => {
        calls++;
        return [{ error: { message } }];
      },
      async () => {},
    );
    assert.equal(calls, expected);
  }
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { sendNetgsm } from "../supabase/functions/reminder-dispatch/netgsm";
import { dispatchScope } from "../supabase/functions/reminder-dispatch/scope";
import {
  emailAllowed,
  emailReady,
} from "../supabase/functions/reminder-dispatch/email-config";

test("Resend test sender only sends scoped tests to the explicitly configured account", () => {
  const config = {
    key: "test",
    from: "Aldım <onboarding@resend.dev>",
    testTo: "owner@example.test",
  };
  assert.equal(emailReady(config), false);
  assert.equal(emailAllowed(config, "owner@example.test", false), false);
  assert.equal(emailAllowed(config, "other@example.test", true), false);
  assert.equal(emailAllowed(config, "owner@example.test", true), true);
  assert.equal(
    emailAllowed({ ...config, testTo: undefined }, "owner@example.test", true),
    false,
  );
  assert.equal(
    emailAllowed({ ...config, key: undefined }, "owner@example.test", true),
    false,
  );
  assert.equal(
    emailReady({ key: "test", from: "Aldım <hello@verified.example>" }),
    true,
  );
});

const config = { username: "test", password: "test-password", header: "ALDIM" };
const message = { to: "+905551234567", text: "Netflix: 1 gün kaldı." };
test("Netgsm sends a Turkish transactional reminder and records acceptance, not delivery", async () => {
  let calls = 0;
  const result = await sendNetgsm(config, message, async (url, init) => {
    calls++;
    assert.equal(url, "https://api.netgsm.com.tr/sms/rest/v2/send");
    const body = JSON.parse(String(init?.body));
    assert.deepEqual(body.messages, [{ no: "5551234567", msg: message.text }]);
    assert.equal(body.encoding, "TR");
    assert.equal(body.iysfilter, "0");
    return Response.json({ code: "00", jobid: "job-1" });
  });
  assert.equal(calls, 1);
  assert.deepEqual(result, {
    status: "accepted",
    providerId: "job-1",
    failure: null,
  });
});
test("Provider rejection is failed; timeout, 5xx and malformed success stay unknown without retry", async () => {
  for (
    const [response, expected] of [
      [Response.json({ code: "30" }), "failed"],
      [new Response("unavailable", { status: 503 }), "unknown"],
      [Response.json({ code: "00" }), "unknown"],
      [Response.json({ unexpected: true }), "unknown"],
      [null, "unknown"],
    ] as const
  ) {
    let calls = 0;
    const result = await sendNetgsm(config, message, async () => {
      calls++;
      if (!response) throw new Error("timeout");
      return response;
    });
    assert.equal(result.status, expected);
    assert.equal(calls, 1);
    assert.equal(result.providerId, null);
  }
});
test("Invalid recipients never reach the provider", async () => {
  const result = await sendNetgsm(
    config,
    { ...message, to: "5551234567" },
    async () => {
      throw new Error("must not send");
    },
  );
  assert.equal(result.status, "failed");
});
test("A scoped reminder test cannot accidentally broaden to all accounts", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  assert.equal(dispatchScope(new URL("https://example.test")), null);
  assert.deepEqual(
    dispatchScope(
      new URL(`https://example.test?user_id=${id}&reminder_id=${id}`),
    ),
    { userId: id, reminderId: id },
  );
  for (
    const query of [
      `user_id=${id}`,
      `reminder_id=${id}`,
      "user_id=&reminder_id=",
      `user_id=bad&reminder_id=${id}`,
    ]
  ) {
    assert.throws(() =>
      dispatchScope(new URL(`https://example.test?${query}`))
    );
  }
});

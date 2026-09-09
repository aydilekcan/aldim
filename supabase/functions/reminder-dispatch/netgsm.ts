export type SmsResult = {
  status: "accepted" | "failed" | "unknown";
  providerId: string | null;
  failure: string | null;
};

/** Transactional reminders only. Never retries an ambiguous provider response. */
export async function sendNetgsm(
  config: { username: string; password: string; header: string },
  message: { to: string; text: string },
  transport: typeof fetch = fetch,
): Promise<SmsResult> {
  if (!/^\+[1-9]\d{7,14}$/.test(message.to)) {
    return {
      status: "failed",
      providerId: null,
      failure: "Invalid E.164 phone",
    };
  }
  try {
    // Netgsm expects Turkish national numbers or 00-prefixed international numbers.
    const no = /^\+90\d{10}$/.test(message.to)
      ? message.to.slice(3)
      : `00${message.to.slice(1)}`;
    const response = await transport(
      "https://api.netgsm.com.tr/sms/rest/v2/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${
            btoa(`${config.username}:${config.password}`)
          }`,
        },
        body: JSON.stringify({
          msgheader: config.header,
          messages: [{ msg: message.text, no }],
          encoding: "TR",
          iysfilter: "0",
          appname: "Aldim",
        }),
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!response.ok) {
      return {
        status: response.status >= 500 ? "unknown" : "failed",
        providerId: null,
        failure: `Netgsm HTTP ${response.status}`,
      };
    }
    const result = await response.json();
    if (
      result.code === "00" && typeof result.jobid === "string" && result.jobid
    ) {
      return { status: "accepted", providerId: result.jobid, failure: null };
    }
    // A success without a tracking id cannot safely be sent again.
    const definiteRejection = typeof result.code === "string" &&
      ["20", "30", "40", "50", "51", "70", "80", "85"].includes(result.code);
    return {
      status: definiteRejection ? "failed" : "unknown",
      providerId: null,
      failure: definiteRejection
        ? `Netgsm code ${result.code}`
        : "Netgsm response requires reconciliation",
    };
  } catch {
    return {
      status: "unknown",
      providerId: null,
      failure: "Netgsm response unavailable; verify before retry",
    };
  }
}

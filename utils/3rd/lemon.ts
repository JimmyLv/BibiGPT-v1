import { ratelimit } from "./upstash";

export async function checkLicenseKey(licenseKey: string) {
  const response = await fetch(`https://api.lemonsqueezy.com/v1/license-keys`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LEMON_API_KEY ?? ""}`,
    },
  });
  const keysData = await response.json();
  const licenseKeys = keysData.data?.map((i: any) => {
    console.log("========i.attributes========", i.attributes);
    return i.attributes.key;
  });

  if (licenseKeys?.includes(licenseKey.toLowerCase())) {
    // TODO: change to supabase after implement user-login
    const { remaining } = await ratelimit.limit(licenseKey.toLowerCase());
    // TODO: log to hit licenseKey
    console.log(
      `!!!!!!!!! {short-xxxx-licenseKey}, remaining: ${remaining} ========`
    );
    return remaining > 0;
  }

  return false;
}

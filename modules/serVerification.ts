import { insert, destroy, get } from "../core/dbFunctions";

import { Env } from "../src/index";

const setVerification = async (data: any, env: Env) => {
  let existingData = await get(data.email, env);

  if (existingData !== null) {
    await destroy(data.email, env);
  }

  const randomNumber: number = Math.floor(Math.random() * 90000) + 10000;
  const currentLocalDatetime = new Date(
    new Date().toLocaleString("en", { timeZone: "Asia/Kolkata" })
  );

  const currentTime = currentLocalDatetime.toISOString();

  const expTime = new Date(
    currentLocalDatetime.getTime() + 180000
  ).toISOString();

  data.token = randomNumber;
  data.created_at = currentTime;
  data.expires_at = expTime;

  // let value: string = JSON.stringify({
  //   token: randomNumber,
  //   createdAt: currentTime,
  //   expairesAt: expTime,
  // });

  // const currentEpochTime: number = Math.floor(Date.now() / 1000) + 180;

  // await env.VERIFICATION_TOKENS.put(data.email, value, {
  //   expiration: currentEpochTime,
  // });

  // await env.VERIFICATION_TOKENS.put(data.email, value);

  const insertData = await insert(data, env);

  let eventType = "send_verification_token";

  const payload = JSON.stringify({
    event_type: eventType,
    environment: env.NEPTUNE_ENV,
    api_token: env.NEPTUNE_TOKEN,

    version: "1",
    data: {
      otp: randomNumber,
    },
    contact_infos: [{ type: "email", value: data.email }],
  });

  var requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  };

  await fetch("https://edge.teurons.com/neptune/events/ingest", requestOptions);

  return data;
};

export default setVerification;

// module.exports = setVerification;

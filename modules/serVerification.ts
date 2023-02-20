const setVerification = async (data: any, env: any) => {
  let existingData = await env.VERIFICATION_TOKENS.get(data.email);

  if (existingData !== null) {
    await env.VERIFICATION_TOKENS.delete(data.email);
  }

  const randomNumber: number = Math.floor(Math.random() * 90000) + 10000;
  const currentTime = new Date(
    new Date().toLocaleString("en", { timeZone: "Asia/Kolkata" })
  );

  const expTime = new Date(currentTime.getTime() + 180000);

  let value: string = JSON.stringify({
    token: randomNumber,
    createdAt: currentTime,
    expairesAt: expTime,
  });

  //   const currentEpochTime: number = Math.floor(Date.now() / 1000) + 180;

  //   await env.VERIFICATION_TOKENS.put(data.email, value, {
  //     expiration: currentEpochTime,
  //   });

  await env.VERIFICATION_TOKENS.put(data.email, value);

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

  return "success";
};

export default setVerification;

// module.exports = setVerification;

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  VERIFICATION_TOKENS: KVNamespace;

  NEPTUNE_ENV: string;
  NEPTUNE_TOKEN: string;

  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

export interface userInput {
  email: string;
}

export interface value {
  token: number;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname == "/set-verify") {
      let data: userInput = await request.json();
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

      await fetch(
        "https://edge.teurons.com/neptune/events/ingest",
        requestOptions
      );

      return new Response("verification added successfully");

      //   return new Response(JSON.stringify(value), {
      //     headers: {
      //       "Content-type": "application/json",
      //     },
      //   });
    } else if (pathname == "/do-verify") {
      const params: any = {};
      const url = new URL(request.url);
      const queryString = url.search.slice(1).split("&");

      const dateTime = new Date(
        new Date().toLocaleString("en", { timeZone: "Asia/Kolkata" })
      );

      queryString.forEach((item) => {
        const kv = item.split("=");
        if (kv[0]) params[kv[0]] = kv[1] || true;
      });

      let data = await env.VERIFICATION_TOKENS.get(params.email);

      if (data != null) {
        let tokenDat = data as string;
        let verificationToken = JSON.parse(tokenDat);

        const expTime = new Date(verificationToken.expairesAt);

        if (dateTime < expTime) {
          if (params.token == verificationToken.token) {
            return new Response("Verification Successfull");
          }
          return new Response("Invalid Token");
        } else {
          return new Response("Token expired");
        }
      } else {
        return new Response("Invalid verification data");
      }
    } else {
      return new Response("path not found");
    }
  },
};

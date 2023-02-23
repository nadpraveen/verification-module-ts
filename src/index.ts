import setVerification from "../modules/serVerification";
import doVerify from "../modules/doVerification";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  VERIFICATION_TOKENS: KVNamespace;

  NEPTUNE_ENV: string;
  NEPTUNE_TOKEN: string;
  DATA_SOURCE: string;
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
      const addVerification = await setVerification(data, env);

      if (addVerification) {
        return new Response(JSON.stringify(addVerification), {
          headers: {
            "Content-type": "application/json",
          },
        });
      } else {
        return new Response("somthing went wrong");
      }
    } else if (pathname == "/do-verify") {
      const params: any = {};
      const url = new URL(request.url);
      const queryString = url.search.slice(1).split("&");

      queryString.forEach((item) => {
        const kv = item.split("=");
        if (kv[0]) params[kv[0]] = kv[1] || true;
      });

      const verify = await doVerify(params, env);

      return new Response(verify);
    } else {
      return new Response("path not found");
    }
  },
};

import { connect } from "@planetscale/database";
import { generateInsertQuery } from "../functions/queryGeneraters";
import { planetScaleConfig } from "../dbConnections/planetScale";

export interface data {
  email: string;
  token: number;
  created_at: string;
  expires_at: string;
}

export async function insert(data: data, env: any) {
  if (env.DATA_SOURCE == "KV") {
    let value: string = JSON.stringify({
      token: data.token,
      created_at: data.created_at,
      expires_at: data.expires_at,
    });
    await env.VERIFICATION_TOKENS.put(data.email, value);
    return "success";
  }
  if (env.DATA_SOURCE == "planet-scale") {
    const query = await generateInsertQuery("verification_tokens", data);

    const conn = connect(planetScaleConfig);
    const results = await conn.execute(query);
    return results;
  }
}

export async function destroy(email: string, env: any) {
  if (env.DATA_SOURCE == "KV") {
    await env.VERIFICATION_TOKENS.delete(email);
    return "success";
  }
  if (env.DATA_SOURCE == "planet-scale") {
    const query = `delete from verification_tokens where email = '${email}'`;

    const conn = connect(planetScaleConfig);
    const results = await conn.execute(query);
    return results;
  }
}

export async function get(email: string, env: any) {
  if (env.DATA_SOURCE == "KV") {
    let data = await env.VERIFICATION_TOKENS.get(email);
    return data;
  }
  if (env.DATA_SOURCE == "planet-scale") {
    const query = `select * from verification_tokens where email = '${email}'`;
    const conn = connect(planetScaleConfig);
    const results = await conn.execute(query);
    return results.rows[0];
  }
}

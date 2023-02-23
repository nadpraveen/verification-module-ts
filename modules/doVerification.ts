import { get } from "../core/dbFunctions";

const doVerify = async (params: any, env: any) => {
  const dateTime = new Date(
    new Date().toLocaleString("en", { timeZone: "Asia/Kolkata" })
  );

  // const dateTime = dateTimeLocal.toISOString();

  let data = await get(params.email, env);

  if (data != null) {
    let tokenData = data as string;
    let verificationToken =
      typeof data == "object" ? tokenData : JSON.parse(tokenData);

    const expTime = new Date(verificationToken.expires_at);

    if (dateTime < expTime) {
      if (params.token == verificationToken.token) {
        return "Verification Successfull";
      }
      return "Invalid Token";
    } else {
      return "Token expired";
    }
  } else {
    return "Invalid verification data";
  }
};

export default doVerify;

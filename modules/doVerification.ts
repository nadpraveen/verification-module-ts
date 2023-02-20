const doVerify = async (params: any, env: any) => {
  const dateTime = new Date(
    new Date().toLocaleString("en", { timeZone: "Asia/Kolkata" })
  );

  let data = await env.VERIFICATION_TOKENS.get(params.email);

  if (data != null) {
    let tokenDat = data as string;
    let verificationToken = JSON.parse(tokenDat);

    const expTime = new Date(verificationToken.expairesAt);

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

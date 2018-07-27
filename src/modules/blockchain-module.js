import connect from "../utils/dbc";

async function registerUser(data) {
  const dbc = await connect();
  let { password, ...rest } = data;
  let { email, phone } = rest;
  let query = [{ phone }];
  if (email) query.push({ email });
  let exist = await dbc.collection("users").findOne({ $or: query });
  if (exist) {
    throw new Error("Phone or email already exist");
    return;
  }
  password = createHash(password);
  if (email) rest.email = email.toLowerCase();
  data = { ...rest, password };
  await dbc.collection("users").insertOne(data);
  let token = email ? genratedToken(email) : genratedToken(phone);
  return {
    token,
    user: rest
  };
}

async function loginUser(data) {
  let dbc = await connect();
  let { email, phone, password } = data;
  let user;
  if (email)
    user = await dbc
      .collection("users")
      .findOne({ email }, { fields: { _id: 0 } });
  else
    user = await dbc
      .collection("users")
      .findOne({ phone }, { fields: { _id: 0 } });
  if (!user) {
    throw new Error("User not found");
    return;
  }
  if (!user.password) {
    throw new Error("Password not set yet");
    return;
  }
  if (!checkHashedPassword(password, user.password)) {
    throw new Error("Inavid password");
    return;
  }
  let token = email ? genratedToken(email) : genratedToken(phone);
  return { token, user };
}

async function loginValidation(email) {
  const dbc = await connect();
  return await dbc
    .collection("users")
    .findOne({ $and: [{ email }, { status_flag: false }] }); // change (status_flag = true) after notification-service is completed
}

async function isUserExist(email) {
  const dbc = await connect();
  return await dbc.collection("users").findOne({ email });
}

// validate temporary token
async function validateUserTemporaryToken(token_value) {
  const dbc = await connect();
  return await dbc
    .collection("user_collection")
    .findOne({ temporary_token: token_value });
}

// reactive user
async function reactiveUser(email) {
  const dbc = await connect();
  return await dbc
    .collection("user_collection")
    .update({ email }, { $set: { status_flag: true } });
}

export {
  registerUser,
  loginUser,
  loginValidation,
  isUserExist,
  reactiveUser,
  validateUserTemporaryToken
};

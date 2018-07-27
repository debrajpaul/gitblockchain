require("dotenv").config();
import { MongoClient, ObjectId } from "mongodb";
let _connected = false,
  _db = null,
  {
    MONGO_HOST,
    MONGO_PORT,
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_DB
  } = process.env;
if (!MONGO_HOST) {
  console.error(
    "FATAL ERROR : MONGO_HOST is not defind! Please check .env setting"
  );
  process.exit(1);
} else if (!MONGO_PORT) {
  console.error(
    "FATAL ERROR : MONGO_PORT is not defind! Please check .env setting"
  );
  process.exit(1);
} else if (!MONGO_DB) {
  console.error(
    "FATAL ERROR : MONGO_DB is not defind! Please check .env setting"
  );
  process.exit(1);
}
export default function() {
  return new Promise((resolve, reject) => {
    if (_connected && _db) {
      resolve(_db);
    } else {
      let connection_string = `mongodb://${
        MONGO_USERNAME ? MONGO_USERNAME + ":" : ""
      }${
        MONGO_PASSWORD ? MONGO_PASSWORD + "@" : ""
      }${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;
      MongoClient.connect(
        connection_string,
        { useNewUrlParser: true }
      )
        .then(async client => {
          _connected = true;
          _db = client.db(MONGO_DB);
          resolve(_db);
        })
        .catch(err => {
          console.log("Mongo connection failed, check .env file");
          reject(err);
        });
    }
  });
}

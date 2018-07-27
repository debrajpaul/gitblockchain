require("dotenv").config();
import cors from "cors";
import morgan from "morgan";
import express from "express";
import bodyParser from "body-parser";
const debug = require("debug")("app");
import blockchain_routes from "../src/routes/blockchain-routes";

const app = express();
let { PORT } = process.env;
if (!PORT) {
  console.error("FATAL ERROR : Port is not defind! Please check .env setting");
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(morgan("tiny", { stream: { write: msg => debug(msg) } }));

// append prefix to every router
app.use("/blockchainApi", blockchain_routes);

app.get("/", (req, res) => {
  res.send("<H2>Blockchain portal backend is up and running</H2>");
});

app.listen(PORT, err => {
  if (!err) {
    debug(`listenning on port ${PORT}`);
  }
});

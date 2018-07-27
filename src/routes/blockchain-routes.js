import express from "express";
import {
  body_validator,
  headers_validator,
  params_validator,
  query_validator
} from "../middleware/validator";
import transaction_schema from "../schemas/transaction-schema-schema";
import { success, fail } from "../utils/response-helper";
import {
  registerUser,
  loginUser,
  loginValidation,
  reactiveUser
} from "../modules/blockchain-module";
import Blockchain from "../entities/blockchain-entities";
import uuid from "uuid/v1";

const router = express.Router();
const bitcoin = new Blockchain();
const nodeAddress = uuid()
  .split("-")
  .join("");

// blockchain code
router.get("/blockchain", async (req, res) => {
  try {
    let { body } = req;
    res.json(success(bitcoin));
  } catch (e) {
    console.log(e);
    res.json(fail(e.message));
  }
});

// reg-user code
router.post("/transaction", body_validator(transaction_schema), (req, res) => {
  (async () => {
    try {
      let { body } = req;
      const blockIndex = bitcoin.createNewTransaction(
        body.amount,
        body.sender,
        body.recipient
      );
      res.json(
        success({
          note: `Transaction will be added in block --> ${blockIndex}.`
        })
      );
    } catch (e) {
      console.log(e);
      res.json(fail(e.message));
    }
  })();
});

// mine code
router.get("/mine", async (req, res) => {
  try {
    let { body } = req;
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock["hash"];
    const currentBlockData = {
      transactions: bitcoin.pendingTransactions,
      index: lastBlock["index"] + 1
    };
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(
      previousBlockHash,
      currentBlockData,
      nonce
    );
    bitcoin.createNewTransaction(12.5, "00", nodeAddress);
    const newBlock = bitcoin.createNewBlock(
      nonce,
      previousBlockHash,
      blockHash
    );
    res.json(
      success({ note: "New block mined successfully", block: newBlock })
    );
  } catch (e) {
    console.log(e);
    res.json(fail(e.message));
  }
});

export default router;

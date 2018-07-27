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
import axios from "../utils/axios-helper";
import uuid from "uuid/v1";
import { Promise } from "core-js";

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

// regiser a node and broadcast to all node code
router.post("/register-and-broadcast-node", (req, res) => {
  (async () => {
    try {
      let { newNodeUrl } = req.body;
      if (
        bitcoin.networkNodes.indexOf(newNodeUrl) === -1 &&
        bitcoin.currentNodeUrl !== newNodeUrl
      )
        bitcoin.networkNodes.push(newNodeUrl);
      let promises = bitcoin.networkNodes.map(async networkNodeUrl => {
        let url = `${networkNodeUrl}/blockchainApi/register-node`;
        let body = { newNodeUrl: newNodeUrl };
        return await axios.post(url, body);
      });
      let data = await Promise.all(promises);
      let url = `${newNodeUrl}/blockchainApi/register-node-bulk`;
      let body = {
        allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]
      };
      await axios.post(url, body);
      res.json(
        success({
          note: "New node registered with network successfully."
        })
      );
    } catch (e) {
      console.log(e);
      res.json(fail(e.message));
    }
  })();
});

// regiser a node with the network
router.post("/register-node", (req, res) => {
  try {
    let { body } = req;
    const newNodeUrl = body.newNodeUrl;
    if (
      bitcoin.networkNodes.indexOf(newNodeUrl) === -1 &&
      bitcoin.currentNodeUrl !== newNodeUrl
    )
      bitcoin.networkNodes.push(newNodeUrl);
    res.json(
      success({
        note: "new node register successfully."
      })
    );
  } catch (e) {
    console.log(e);
    res.json(fail(e.message));
  }
});

// regiser a multiple node with the network
router.post("/register-node-bulk", (req, res) => {
  try {
    let { body } = req;
    const allNetworkNodes = body.allNetworkNodes;
    if (!allNetworkNodes) {
      console.log("error");
    }
    allNetworkNodes.forEach(networkNodeUrl => {
      if (
        bitcoin.networkNodes.indexOf(networkNodeUrl) === -1 &&
        bitcoin.currentNodeUrl !== networkNodeUrl
      )
        bitcoin.networkNodes.push(networkNodeUrl);
    });
    res.json(
      success({
        note: "Bulk registration successful."
      })
    );
  } catch (e) {
    console.log(e);
    res.json(fail(e.message));
  }
});

export default router;

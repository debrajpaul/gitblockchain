import express from "express";
import {
  body_validator,
  headers_validator,
  params_validator,
  query_validator
} from "../middleware/validator";
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
import path from "path";

const router = express.Router();
const bitcoin = new Blockchain();
const nodeAddress = uuid()
  .split("-")
  .join("");

// blockchain code
router.get("/blockchain", (req, res) => {
  try {
    let { body } = req;
    res.json(success(bitcoin));
  } catch (e) {
    console.log(e);
    res.json(fail(e.message));
  }
});

// reg-user code
router.post("/transaction", (req, res) => {
  try {
    const newTransaction = req.body;
    const blockIndex = bitcoin.addTransactionToPendingTransactions(
      newTransaction
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
});

// transaction and broadcast to other network
router.post("/transaction-broadcast", (req, res) => {
  (async () => {
    try {
      let { body } = req;
      const newTransaction = bitcoin.createNewTransaction(
        body.amount,
        body.sender,
        body.recipient
      );
      bitcoin.addTransactionToPendingTransactions(newTransaction);
      // call to other node
      let promises = bitcoin.networkNodes.map(async networkNodeUrl => {
        let url = `${networkNodeUrl}/blockchainApi/transaction`;
        let body = newTransaction;
        return await axios.post(url, body);
      });
      await Promise.all(promises);
      res.json(
        success({
          note: "Transaction created and broadcast successfully."
        })
      );
    } catch (e) {
      console.log(e);
      res.json(fail(e.message));
    }
  })();
});

// mine code
router.get("/mine", (req, res) => {
  (async () => {
    try {
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
      const newBlock = bitcoin.createNewBlock(
        nonce,
        previousBlockHash,
        blockHash
      );
      // call to other node
      let promises = bitcoin.networkNodes.map(async networkNodeUrl => {
        let url = `${networkNodeUrl}/blockchainApi/receive-new-block`;
        let body = { newBlock: newBlock };
        return await axios.post(url, body);
      });
      let data = await Promise.all(promises);
      // call to other transaction broadcast
      let url = `${bitcoin.currentNodeUrl}/blockchainApi/transaction-broadcast`;
      let body = {
        amount: 12.5,
        sender: "00",
        recipient: nodeAddress
      };
      await axios.post(url, body);
      res.json(
        success({ note: "New block mined successfully", block: newBlock })
      );
    } catch (e) {
      console.log(e);
      res.json(fail(e.message));
    }
  })();
});

router.post("/receive-new-block", (req, res) => {
  try {
    let { newBlock } = req.body;
    if (
      bitcoin.getLastBlock().hash === newBlock.previousBlockHash &&
      bitcoin.getLastBlock()["index"] + 1 === newBlock["index"]
    ) {
      bitcoin.chain.push(newBlock);
      bitcoin.pendingTransactions = [];
      res.json(
        success({
          note: "New block received and accepted.",
          newBlock: newBlock
        })
      );
    } else {
      res.json(
        success({
          note: "New block rejected.",
          newBlock: newBlock
        })
      );
    }
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

// consensus Api
router.get("/consensus", (req, res) => {
  (async () => {
    try {
      // call to other node
      const promises = bitcoin.networkNodes.map(async networkNodeUrl => {
        let url = `${networkNodeUrl}/blockchainApi/blockchain`;
        return await axios.get(url);
      });
      let blockchains = await Promise.all(promises);
      // validate the blockchain
      const currentChainLength = bitcoin.chain.length;
      let maxLength = currentChainLength;
      let newLongestChain = null;
      let newPendingTransaction = null;
      blockchains.map(blockchain => {
        if (blockchain.message.chain.length > maxLength) {
          maxLength = blockchain.message.chain.length;
          newLongestChain = blockchain.message.chain;
          newPendingTransaction = blockchain.message.pendingTransactions;
        }
      });
      if (
        !newLongestChain ||
        !(newLongestChain && !bitcoin.chainIsValid(newLongestChain))
      ) {
        res.json(
          success({
            note: "Current chain has not been replaced",
            chain: bitcoin.chain
          })
        );
      } else {
        bitcoin.chain = newLongestChain;
        bitcoin.pendingTransactions = newPendingTransaction;
        res.json(
          success({
            note: "Current chain has been replaced",
            chain: bitcoin.chain
          })
        );
      }
    } catch (e) {
      console.log(e);
      res.json(fail(e.message));
    }
  })();
});

// blockchain code
router.get("/block/:blockHash", (req, res) => {
  try {
    res.json(success(bitcoin.getBlock(req.params.blockHash)));
  } catch (e) {
    console.log(e);
    res.json(fail(e.message));
  }
});

// blockchain code
router.get("/transaction/:transactionId", (req, res) => {
  try {
    const data = bitcoin.getTransaction(req.params.transactionId);
    res.json(
      success({
        transaction: data.transaction,
        block: data.block
      })
    );
  } catch (e) {
    console.log(e);
    res.json(fail(e.message));
  }
});

// blockchain code
router.get("/address/:address", (req, res) => {
  try {
    const data = bitcoin.getAddressData(req.params.address);
    res.json(
      success({
        addressTransactions: data.addressTransactions,
        addressBalance: data.addressBalance
      })
    );
  } catch (e) {
    console.log(e);
    res.json(fail(e.message));
  }
});

// blockchain code
router.get("/block-explorer", (req, res) => {
  try {
    res.sendFile("index.html", {
      root: path.join(__dirname, "../block-explorer")
    });
  } catch (e) {
    console.log(e);
    res.json(fail(e.message));
  }
});

export default router;

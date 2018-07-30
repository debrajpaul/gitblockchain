require("dotenv").config();
import sha256 from "sha256";
import uuid from "uuid/v1";
export default class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = process.env.SELF_URL;
    this.networkNodes = [];
    this.createNewBlock(100, "0", "0");
  }

  createNewBlock(nonce1, previousBlockHash, hash) {
    const newBlock = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce: nonce1,
      hash: hash,
      previousBlockHash: previousBlockHash
    };
    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  createNewTransaction(amount, sender, recipient) {
    const newTransaction = {
      amount: amount,
      sender: sender,
      recipient: recipient,
      transactionId: uuid()
        .split("-")
        .join("")
    };
    return newTransaction;
  }

  addTransactionToPendingTransactions(transactionObj) {
    this.pendingTransactions.push(transactionObj);
    return this.getLastBlock()["index"] + 1;
  }

  hashBlock(previousBlockHash, currentBlockData, nonce) {
    const dataAsString = `${previousBlockHash}${nonce.toString()}${JSON.stringify(
      currentBlockData
    )}`;
    const hash = sha256(dataAsString);
    return hash;
  }

  proofOfWork(previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while (hash.substring(0, 4) !== "0000") {
      nonce++;
      hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }
    return nonce;
  }

  chainIsValid(blockchain) {
    let validChain = true;
    for (let i = 1; i < blockchain.length; i++) {
      const blockHash = this.hashBlock(
        blockchain[i - 1]["hash"],
        {
          transactions: blockchain[i]["transactions"],
          index: blockchain[i]["index"]
        },
        blockchain[i]["nonce"]
      );
      if (blockHash.substring(0, 4) !== "0000") validChain = false;
      if (blockchain[i]["previousBlockHash"] !== blockchain[i - 1]["hash"])
        validChain = false;
      console.log(`currentBlockHash=>  ${blockchain[i - 1]["hash"]}`);
      console.log(`previousBlockHash=>  ${blockchain[i]["previousBlockHash"]}`);
    }
    const genesisBlock = blockchain[0];
    if (
      !(genesisBlock["nonce"] === 100) ||
      !(genesisBlock["previousBlockHash"] === "0") ||
      !(genesisBlock["hash"] === "0") ||
      !(genesisBlock["transactions"].length === 0)
    )
      validChain = false;
    return validChain;
  }

  getBlock(blockHash) {
    let result = null;
    this.chain.forEach(block => {
      if (block.hash === blockHash) result = block;
    });
    return result;
  }

  getTransaction(transactionId) {
    let correctTransaction = null;
    let correctBlock = null;
    this.chain.forEach(block => {
      block.transactions.forEach(transaction => {
        if (transaction.transactionId === transactionId) {
          correctTransaction = transaction;
          correctBlock = block;
        }
      });
    });
    return {
      transaction: correctTransaction,
      block: correctBlock
    };
  }

  getAddressData(address) {
    const addressTransactions = [];
    this.chain.forEach(block => {
      block.transactions.forEach(transaction => {
        if (transaction.sender === address || transaction.recipient === address)
          addressTransactions.push(transaction);
      });
    });
    let balance = 0;
    addressTransactions.forEach(transaction => {
      if (transaction.recipient === address) {
        balance += transaction.amount;
      } else if (transaction.sender === address) {
        balance -= transaction.amount;
      }
    });
    return {
      addressTransactions: addressTransactions,
      addressBalance: balance
    };
  }
}

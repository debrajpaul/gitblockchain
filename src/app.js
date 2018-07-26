import Blockchain from "../src/entities/blockchain-entities";

const bitcoin = new Blockchain();

const previousBlockHash = "724398y21h34f902786t21908rfyg2";
const currentBlockData = [
  {
    amount: 10,
    sender: "adjflwqjfnwqj",
    recipient: "ijpwiujvpwiu"
  },
  {
    amount: 50,
    sender: "adjflwqjfnwqj",
    recipient: "ijpwiujvpwiu"
  },
  {
    amount: 200,
    sender: "adjflwqjfnwqj",
    recipient: "ijpwiujvpwiu"
  }
];

console.log(bitcoin.proofOfWork(previousBlockHash, currentBlockData));

import SHA256 from 'crypto-js/sha256';

export interface Block {
  index: number;
  timestamp: number;
  data: any;
  previousHash: string;
  hash: string;
  nonce: number;
}

export class Blockchain {
  chain: Block[];
  difficulty: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
  }

  createGenesisBlock(): Block {
    return {
      index: 0,
      timestamp: Date.now(),
      data: "Genesis Block",
      previousHash: "0",
      hash: "0",
      nonce: 0
    };
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  calculateHash(index: number, previousHash: string, timestamp: number, data: any, nonce: number): string {
    return SHA256(index + previousHash + timestamp + JSON.stringify(data) + nonce).toString();
  }

  mineBlock(data: any): Block {
    const previousBlock = this.getLatestBlock();
    const index = previousBlock.index + 1;
    const timestamp = Date.now();
    let nonce = 0;
    let hash = this.calculateHash(index, previousBlock.hash, timestamp, data, nonce);

    while (hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join("0")) {
      nonce++;
      hash = this.calculateHash(index, previousBlock.hash, timestamp, data, nonce);
    }

    const newBlock: Block = {
      index,
      timestamp,
      data,
      previousHash: previousBlock.hash,
      hash,
      nonce
    };

    this.chain.push(newBlock);
    return newBlock;
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      if (currentBlock.hash !== this.calculateHash(
        currentBlock.index,
        currentBlock.previousHash,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.nonce
      )) {
        return false;
      }
    }
    return true;
  }
}
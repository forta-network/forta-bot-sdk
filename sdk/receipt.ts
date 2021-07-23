export interface Receipt {
  status: boolean;
  root: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  logsBloom: string;
  logs: Log[];
  contractAddress: string | null;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  transactionHash: string;
}

export interface Log {
  address: string;
  topics: string[];
  data: string;
  logIndex: number;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  transactionHash: string;
  removed: boolean;
}
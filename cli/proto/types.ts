export enum GrpcEventType {
  BLOCK = 0,
  REORG = 1,
}

export type GrpcNetwork = {
  chainId: string;
};

export type GrpcEvaluateBlockRequest = {
  requestId: string;
  event: GrpcBlockEvent;
};

export type GrpcEvaluateBlockResponse = {
  status: GrpcResponseStatus;
  errors: GrpcError[];
  findings: GrpcFinding[];
  metadata: { [key: string]: string };
  timestamp: string;
  latencyMs: number;
  private: boolean;
};

export type GrpcEvaluateTxRequest = {
  requestId: string;
  event: GrpcTransactionEvent;
};

export type GrpcEvaluateTxResponse = {
  status: GrpcResponseStatus;
  errors: GrpcError[];
  findings: GrpcFinding[];
  metadata: { [key: string]: string };
  timestamp: string;
  latencyMs: number;
  private: boolean;
};

export enum GrpcResponseStatus {
  UNKNOWN = 0,
  ERROR = 1,
  SUCCESS = 2,
}

export type GrpcError = {
  message: string;
};

export type GrpcBlock = {
  difficulty: string;
  extraData: string;
  gasLimit: string;
  gasUsed: string;
  hash: string;
  logsBloom: string;
  miner: string;
  mixHash: string;
  nonce: string;
  number: string;
  parentHash: string;
  receiptsRoot: string;
  sha3Uncles: string;
  size: string;
  stateRoot: string;
  timestamp: string;
  totalDifficulty: string;
  transactions: string[];
  transactionsRoot: string;
  uncles: string[];
};

export type GrpcBlockEvent = {
  type: GrpcEventType;
  blockHash: string;
  blockNumber: string;
  network: GrpcNetwork;
  block: GrpcBlock;
};

export type GrpcTransactionBlock = {
  blockHash: string;
  blockNumber: string;
  blockTimestamp: string;
};

export type GrpcTransaction = {
  type: string;
  nonce: string;
  gasPrice: string;
  gas: string;
  value: string;
  input: string;
  v: string;
  r: string;
  s: string;
  to: string;
  hash: string;
  from: string;
};

export type GrpcReceipt = {
  root: string;
  status: string;
  cumulativeGasUsed: string;
  logsBloom: string;
  logs: GrpcLog[];
  transactionHash: string;
  contractAddress: string;
  gasUsed: string;
  blockHash: string;
  blockNumber: string;
  transactionIndex: string;
};

export type GrpcLog = {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  logIndex: string;
  removed: boolean;
};

export type GrpcTransactionEvent = {
  type: GrpcEventType;
  transaction: GrpcTransaction;
  receipt: GrpcReceipt;
  network: GrpcNetwork;
  traces: GrpcTrace[];
  addresses: { [key: string]: boolean };
  block: GrpcTransactionBlock;
  logs: GrpcLog[];
  isContractDeployment: boolean;
  contractAddress: string;
};

export type GrpcTrace = {
  action: GrpcTraceAction;
  blockHash: string;
  blockNumber: number;
  result: GrpcTraceResult;
  subtraces: number;
  traceAddress: number[];
  transactionHash: string;
  transactionPosition: number;
  type: string;
  error: string;
};

export type GrpcTraceAction = {
  callType: string;
  to: string;
  input: string;
  from: string;
  value: string;
  init: string;
  address: string;
  balance: string;
  refundAddress: string;
};

export type GrpcTraceResult = {
  gasUsed: string;
  address: string;
  code: string;
  output: string;
};

export enum GrpcFindingSeverity {
  Unknown = 0,
  Info = 1,
  Low = 2,
  Medium = 3,
  High = 4,
  Critical = 5,
}

export enum GrpcFindingType {
  Unknown = 0,
  Exploit = 1,
  Suspicious = 2,
  Degraded = 3,
  Info = 4,
}

export type GrpcFinding = {
  protocol: string;
  severity: GrpcFindingSeverity;
  metadata: { [key: string]: string };
  type: GrpcFindingType;
  alertId: string;
  name: string;
  description: string;
  everestId: string;
  private: boolean;
  addresses: string[];
};

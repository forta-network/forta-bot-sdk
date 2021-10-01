export interface Trace {
  action: TraceAction;
  blockHash: string;
  blockNumber: number;
  result: TraceResult;
  subtraces: number;
  traceAddress: number[];
  transactionHash: string;
  transactionPosition: number;
  type: string;
  error: string;
}

export interface TraceAction {
  callType: string;
  to: string;
  input: string;
  from: string;
  value: string;
  init: string;
  address: string;
  balance: string;
  refundAddress: string;
}

export interface TraceResult {
  gasUsed: string;
  address: string;
  code: string;
  output: string;
}
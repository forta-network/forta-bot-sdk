const { BlockEvent, TransactionEvent } = require("../../../../sdk");
const { assertExists, formatAddress } = require("../../../utils");

module.exports = class AgentController {
  constructor(getAgentHandlers) {
    assertExists(getAgentHandlers, "getAgentHandlers");
    this.getAgentHandlers = getAgentHandlers;
  }

  async Initialize(call, callback) {
    // no-op response
    callback(null, { status: "SUCCESS" });
  }

  async EvaluateBlock(call, callback) {
    await this.ensureHandlersInitialized();

    const findings = [];
    let status = "SUCCESS";

    if (this.blockHandlers.length) {
      try {
        const blockEvent = this.createBlockEventFromGrpcRequest(call.request);
        for (const handleBlock of this.blockHandlers) {
          findings.push(...(await handleBlock(blockEvent)));
        }
      } catch (e) {
        console.log(
          `${new Date().toISOString()}    evaluateBlock ${
            call.request.event.blockHash
          }`
        );
        console.log(e);
        status = "ERROR";
      }
    }

    callback(null, {
      status,
      findings,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  async EvaluateTx(call, callback) {
    await this.ensureHandlersInitialized();

    const findings = [];
    let status = "SUCCESS";

    if (this.transactionHandlers.length) {
      try {
        const txEvent = this.createTransactionEventFromGrpcRequest(
          call.request
        );
        for (const handleTransaction of this.transactionHandlers) {
          findings.push(...(await handleTransaction(txEvent)));
        }
      } catch (e) {
        console.log(
          `${new Date().toISOString()}    evaluateTx ${
            call.request.event.transaction.hash
          }`
        );
        console.log(e);
        status = "ERROR";
      }
    }

    callback(null, {
      status,
      findings,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  async ensureHandlersInitialized() {
    if (!this.blockHandlers && !this.transactionHandlers) {
      const agentHandlers = await this.getAgentHandlers();
      this.blockHandlers = agentHandlers.blockHandlers;
      this.transactionHandlers = agentHandlers.transactionHandlers;
    }
  }

  createBlockEventFromGrpcRequest(request) {
    const { type, network, blockHash, blockNumber, block } = request.event;

    const blok = {
      difficulty: block.difficulty,
      extraData: block.extraData,
      gasLimit: block.gasLimit,
      gasUsed: block.gasUsed,
      hash: block.hash,
      logsBloom: block.logsBloom,
      miner: formatAddress(block.miner),
      mixHash: block.mixHash,
      nonce: block.nonce,
      number: parseInt(block.number),
      parentHash: block.parentHash,
      receiptsRoot: block.receiptsRoot,
      sha3Uncles: block.sha3Uncles,
      size: block.size,
      stateRoot: block.stateRoot,
      timestamp: parseInt(block.timestamp),
      totalDifficulty: block.totalDifficulty,
      transactions: block.transactions,
      transactionsRoot: block.transactionsRoot,
      uncles: block.uncles,
    };

    return new BlockEvent(
      type,
      parseInt(network.chainId),
      blockHash,
      parseInt(blockNumber),
      blok
    );
  }

  createTransactionEventFromGrpcRequest(request) {
    const {
      type,
      network,
      transaction: tx,
      receipt: rcpt,
      traces: trcs,
      addresses,
      block,
    } = request.event;

    const transaction = {
      hash: tx.hash,
      from: formatAddress(tx.from),
      to: tx.to ? formatAddress(tx.to) : null,
      nonce: parseInt(tx.nonce),
      gas: tx.gas,
      gasPrice: tx.gasPrice,
      value: tx.value,
      data: tx.input,
      r: tx.r,
      s: tx.s,
      v: tx.v,
    };

    const receipt = {
      status: rcpt.status === "0x1",
      root: rcpt.root,
      gasUsed: rcpt.gasUsed,
      cumulativeGasUsed: rcpt.cumulativeGasUsed,
      logsBloom: rcpt.logsBloom,
      logs: rcpt.logs.map((log) => ({
        address: formatAddress(log.address),
        topics: log.topics,
        data: log.data,
        logIndex: parseInt(log.logIndex),
        blockNumber: parseInt(log.blockNumber),
        blockHash: log.blockHash,
        transactionIndex: parseInt(log.transactionIndex),
        transactionHash: log.transactionHash,
        removed: log.removed,
      })),
      contractAddress: rcpt.contractAddress
        ? formatAddress(rcpt.contractAddress)
        : null,
      blockNumber: parseInt(rcpt.blockNumber),
      blockHash: rcpt.blockHash,
      transactionIndex: parseInt(rcpt.transactionIndex),
      transactionHash: rcpt.transactionHash,
    };

    const traces = !trcs
      ? []
      : trcs.map((trace) => ({
          action: {
            callType: trace.action.callType,
            to: formatAddress(trace.action.to),
            input: trace.action.input,
            from: formatAddress(trace.action.from),
            value: trace.action.value,
            init: trace.action.init,
            address: formatAddress(trace.action.address),
            balance: trace.action.balance,
            refundAddress: formatAddress(trace.action.refundAddress),
          },
          blockHash: trace.blockHash,
          blockNumber: trace.blockNumber,
          result: {
            gasUsed: trace.result.gasUsed,
            address: trace.result.address,
            code: trace.result.code,
          },
          subtraces: trace.subtraces,
          traceAddress: trace.traceAddress,
          transactionHash: trace.transactionHash,
          transactionPosition: trace.transactionPosition,
          type: trace.type,
          error: trace.error,
        }));

    const blok = {
      hash: block.blockHash,
      number: parseInt(block.blockNumber),
      timestamp: parseInt(block.blockTimestamp),
    };

    return new TransactionEvent(
      type,
      parseInt(network.chainId),
      transaction,
      receipt,
      traces,
      addresses,
      blok
    );
  }
};

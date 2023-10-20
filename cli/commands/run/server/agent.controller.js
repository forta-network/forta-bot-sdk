const {
  BlockEvent,
  TransactionEvent,
  isPrivateFindings,
  AlertEvent,
  Alert,
} = require("../../../../sdk");
const {
  assertExists,
  formatAddress,
  assertFindings,
} = require("../../../utils");

module.exports = class AgentController {
  constructor(getAgentHandlers) {
    assertExists(getAgentHandlers, "getAgentHandlers");
    this.getAgentHandlers = getAgentHandlers;
    this.initializeAgentHandlers();
    this.isInitialized = false; // makes sure agent initialize handler only called once
    this.initializeResponse = {};
  }

  async HealthCheck(call, callback) {
    let errors = [];
    let status = "SUCCESS";

    if (this.healthCheck) {
      try {
        const response = await this.healthCheck();
        if (response && response.length > 0) {
          status = "ERROR";
          errors = response.map((r) => ({ message: r }));
        }
      } catch (e) {
        console.log(`${new Date().toISOString()}    healthCheck`);
        console.log(e);
        status = "ERROR";
        errors = [{ message: e.message }];
      }
    }

    callback(null, {
      status,
      errors,
    });
  }

  async Initialize(call, callback) {
    let status = "SUCCESS";

    if (this.initialize && !this.isInitialized) {
      try {
        this.initializeResponse = await this.initialize();
        this.isInitialized = true;
      } catch (e) {
        console.log(`${new Date().toISOString()}    initialize`);
        console.log(e);
        status = "ERROR";
      }
    }

    callback(null, {
      status,
      alertConfig: this.initializeResponse
        ? this.initializeResponse.alertConfig
        : undefined,
    });
  }

  async EvaluateBlock(call, callback) {
    const findings = [];
    let status = "SUCCESS";

    if (this.handleBlock) {
      try {
        const blockEvent = this.createBlockEventFromGrpcRequest(call.request);

        const returnedFindings = await this.handleBlock(blockEvent);

        assertFindings(returnedFindings);

        findings.push(...returnedFindings);
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
      findings: this.formatFindings(findings),
      metadata: {
        timestamp: new Date().toISOString(),
      },
      private: isPrivateFindings(),
    });
  }

  async EvaluateTx(call, callback) {
    const findings = [];
    let status = "SUCCESS";

    if (this.handleTransaction) {
      try {
        const txEvent = this.createTransactionEventFromGrpcRequest(
          call.request
        );

        const returnedFindings = await this.handleTransaction(txEvent);

        assertFindings(returnedFindings);

        findings.push(...returnedFindings);
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
      findings: this.formatFindings(findings),
      metadata: {
        timestamp: new Date().toISOString(),
      },
      private: isPrivateFindings(),
    });
  }

  async EvaluateAlert(call, callback) {
    const findings = [];
    let status = "SUCCESS";

    if (this.handleAlert) {
      try {
        const alertEvent = this.createAlertEventFromGrpcRequest(call.request);
        const returnedFindings = await this.handleAlert(alertEvent);

        assertFindings(returnedFindings);

        findings.push(...returnedFindings);
      } catch (e) {
        console.log(
          `${new Date().toISOString()}    evaluateAlert ${call.request.hash}`
        );
        console.log(e);
        status = "ERROR";
      }
    }

    callback(null, {
      status,
      findings: this.formatFindings(findings),
      metadata: {
        timestamp: new Date().toISOString(),
      },
      private: isPrivateFindings(),
    });
  }

  async initializeAgentHandlers() {
    try {
      const agentHandlers = await this.getAgentHandlers({
        shouldRunInitialize: false,
      });
      this.initialize = agentHandlers.initialize;
      this.handleBlock = agentHandlers.handleBlock;
      this.handleTransaction = agentHandlers.handleTransaction;
      this.handleAlert = agentHandlers.handleAlert;
      this.healthCheck = agentHandlers.healthCheck;
    } catch (e) {
      console.log(e);
    }
  }

  createBlockEventFromGrpcRequest(request) {
    const { type, network, block } = request.event;

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

    return new BlockEvent(type, parseInt(network.chainId), blok);
  }

  createAlertEventFromGrpcRequest(request) {
    const { alert } = request.event;

    return new AlertEvent(Alert.fromObject(alert));
  }

  createTransactionEventFromGrpcRequest(request) {
    const {
      type,
      network,
      transaction: tx,
      logs: lgs,
      traces: trcs,
      addresses,
      block,
      contractAddress,
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

    const logs = lgs.map((log) => ({
      address: formatAddress(log.address),
      topics: log.topics,
      data: log.data,
      logIndex: parseInt(log.logIndex),
      blockNumber: parseInt(log.blockNumber),
      blockHash: log.blockHash,
      transactionIndex: parseInt(log.transactionIndex),
      transactionHash: log.transactionHash,
      removed: log.removed,
    }));

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
            gasUsed: trace.result?.gasUsed,
            address: trace.result?.address,
            code: trace.result?.code,
            output: trace.result?.output,
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
      traces,
      addresses,
      blok,
      logs,
      formatAddress(contractAddress)
    );
  }

  formatFindings(findings) {
    // convert any label metadata from map to array
    for (const finding of findings) {
      for (const label of finding.labels) {
        if (!Array.isArray(label.metadata)) {
          const metadataArray = [];
          for (const key of Object.keys(label.metadata)) {
            metadataArray.push(`${key}=${label.metadata[key]}`);
          }
          label.metadata = metadataArray;
        }
      }
    }

    return findings;
  }
};

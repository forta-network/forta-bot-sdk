import { BlockEvent, EventType, Network, TransactionEvent } from "../../../../sdk"
import { formatAddress } from "../../../utils"
import AgentController from "./agent.controller"

describe("AgentController", () => {
  // cheating here by using any so that we can invoke initializeAgentHandlers() for synchronous testing
  let agentController: any
  const mockHandleBlock = jest.fn()
  const mockHandleTransaction = jest.fn()
  const mockGetAgentHandlers = jest.fn()
  const mockCallback = jest.fn()
  const mockFinding = { some: 'finding' }
  const systemTime = new Date()

  const generateBlockRequest = () => ({
    request: {
      event: {
        type: 0,
        network: {
          chainId: "1"
        },
        blockHash: "0x550bf22138e7cd31602ecc180fac4e1d719ac52cfad41c8320078683a3b90859",
        blockNumber: "13309526",
        block: {
          "difficulty": "9130034435939756",
          "extraData": "0xe4b883e5bda9e7a59ee4bb99e9b1bc090721",
          "gasLimit": "30029295",
          "gasUsed": "21829296",
          "hash": "0x550bf22138e7cd31602ecc180fac4e1d719ac52cfad41c8320078683a3b90859",
          "logsBloom": "0x04b025210385118f9800b948a02882e1485e804163339070e12f7050c100540820144d50c0885201816450214a00812492b4e00338809ac344004661187132940a04036910f809172b32423a0851ca2027101ad210420e4020040581a0080300020d094407610544894e2e06c8b4a8a20000db6854020440bc044ad0850832b000a165507040228819c21503052a4e3448c200495184080d8224904001d226062349a9c30d677a0d471104992bbf2421302852193030e7201040a1b11b21c2d0548c0466caa9a841a8440880420145482a5182204d02c25af08240c603f3218c19f93b198a32454094010501892651043852684331a709d4000339938083102d",
          "miner": "0x829BD824B016326A401d083B33D092293333A830",
          "mixHash": "0xe8cbde8d58c522b754766a2480f839887a3771ddc84491a1e8b52f512cc14b17",
          "nonce": "0xb226e219ac6add78",
          "number": "13309526",
          "parentHash": "0xa66b125e5bd6a1c27ec6d986eb898796532378552f9aec41b87cdb0d39bb69c1",
          "receiptsRoot": "0xb0d3b93e4ff7e71a75f9a40208a6024d2fed33f5ee7a5f3734979799b8171b3f",
          "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
          "size": "44657",
          "stateRoot": "0x3266f900e7894f13c05b16877d6c362c49981d3b645487cce6f8674e024243c5",
          "timestamp": "1632768366",
          "totalDifficulty": "31393651082871943563908",
          "transactions": ["0xfadb14c4d6bc7985583f6aded4d64bd0e071010ff4c29ab341a357550147fb28"],
          "transactionsRoot": "0xb5bbf490945d26e4f0c5ca88f8ca12807abcfd46f272de2712d814a43bdeef44",
          "uncles": []
        }
      }
    }
  })

  const generateTxRequest = () => ({
    request: {
      event: {
        type: 0,
        network: {
          chainId: "1"
        },
        transaction: {
          "from": "0xC9f7bc0Ed37b821A34bFD508059c75460d6EFB37",
          "gas": "634772",
          "gasPrice": "120102274187",
          "hash": "0xfadb14c4d6bc7985583f6aded4d64bd0e071010ff4c29ab341a357550147fb28",
          "input": "0x530ed69400000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000418ed8709d206b533ab0b6fc526987bff7ec7b5eae527062bb09af80f7f578231c0734276e7d4675fdf7c9fbe540578891cf9fac872d8663c7c634afb01c39f9931c00000000000000000000000000000000000000000000000000000000000000",
          "nonce": "387",
          "r": "0x2724a8ec2e2f3f634f04e954cf3b966bf9f734ada1611a44cd435441c83742e1",
          "s": "0x7ae8047b83dc285a32f9fe6fb0b84927fc789e2a411ea2616deb3efd7c77a9a2",
          "to": "0x127E479Ac59A1EA76AfdEDf830fEcc2909aA4cAE",
          "type": "0x2",
          "v": "0x0",
          "value": "400000000000000000"
        },
        receipt: {
          "root": "123abc",
          "blockHash": "0x550bf22138e7cd31602ecc180fac4e1d719ac52cfad41c8320078683a3b90859",
          "blockNumber": "13309526",
          "contractAddress": "0x351d579AC59a1ea76afdedf567becc3518ee5deb",
          "cumulativeGasUsed": "634772",
          "gasUsed": "634772",
          "logs": [{
            "address": "0xB9f7bc0Ed37b821A34bFD508059c75460d6EFB37",
            "topics": ["topic1"],
            "data": "0xdata",
            "logIndex": "1",
            "blockNumber": "13309526",
            "blockHash": "0x550bf22138e7cd31602ecc180fac4e1d719ac52cfad41c8320078683a3b90859",
            "transactionIndex": "1",
            "transactionHash": "0xfadb14c4d6bc7985583f6aded4d64bd0e071010ff4c29ab341a357550147fb28",
            "removed": false
          }],
          "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
          "status": "0x0",
          "transactionHash": "0xfadb14c4d6bc7985583f6aded4d64bd0e071010ff4c29ab341a357550147fb28",
          "transactionIndex": "0",
        },
        traces: [{
          "blockHash": "0x550bf22138e7cd31602ecc180fac4e1d719ac52cfad41c8320078683a3b90859",
          "blockNumber": 13309526,
          "result": {
            "gasUsed": "12345",
            "address": "0xC9f7bc0Ed37b821A34bFD508059c75460d6EFB37",
            "code": "1",
            "output": "0x001"
          },
          "action": {
            "callType": "someType",
            "to": "0xC9f7bc0Ed37b821A34bFD508059c75460d6EFB37",
            "input": "0xinput",
            "from": "0xc9F7bc0ed37b821A34bfd508069c75460d6efb37",
            "value": "500",
            "init": "xyz",
            "address": "0xC9f7bc0Ed37b821A34bFD508059c75460d6EFB38",
            "balance": "100",
            "refundAddress": "0xC9f7bc0Ed37b821A34bFD508059c75460d6EFB56"
          },
          "subtraces": 5,
          "traceAddress": [1, 2],
          "transactionHash": "0xfadb14c4d6bc7985583f6aded4d64bd0e071010ff4c29ab341a357550147fb28",
          "transactionPosition": 1,
          "type": "call",
          "error": ""
        }],
        addresses: {
          "0xC9f7bc0Ed37b821A34bFD508059c75460d6EFB37": true
        },
        block: {
          "blockHash": "0x550bf22138e7cd31602ecc180fac4e1d719ac52cfad41c8320078683a3b90859",
          "blockNumber": "13309526",
          "blockTimestamp": "1632768366"
        }
      }
    }
  })

  const resetMocks = () => {
    mockCallback.mockReset()
    mockGetAgentHandlers.mockReset()
    mockHandleBlock.mockReset()
    mockHandleTransaction.mockReset()
  }

  beforeEach(() => resetMocks())

  beforeAll(() => {
    jest.useFakeTimers('modern').setSystemTime(systemTime)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe("constructor", () => {
    it("should invoke getAgentHandlers", () => {
      mockGetAgentHandlers.mockReturnValueOnce({})
      new AgentController(mockGetAgentHandlers)
  
      expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1)
    })
  })

  describe("Initialize", () => {
    it("invokes callback with success response", async () => {
      mockGetAgentHandlers.mockReturnValueOnce({})
      agentController = new AgentController(mockGetAgentHandlers)

      await agentController.Initialize({}, mockCallback)

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith(null, { status: "SUCCESS" })
    })
  })

  describe("EvaluateBlock", () => {
    const mockBlockRequest = generateBlockRequest()

    it("invokes callback with error response if error occurs", async () => {
      mockGetAgentHandlers.mockReturnValue({ handleBlock: mockHandleBlock })
      agentController = new AgentController(mockGetAgentHandlers)
      await agentController.initializeAgentHandlers()
      const mockRequest = { 
        request: {
          event: {
            blockHash: "0xabc"
          }
        }
      }

      await agentController.EvaluateBlock(mockRequest, mockCallback)// error because request object is not fully populated

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith(null, {
        status: "ERROR",
        findings: [],
        metadata: {
          timestamp: systemTime.toISOString(),
        },
        private: false
      })
    })

    it("invokes callback with success response and empty findings if no block handlers", async () => {
      mockGetAgentHandlers.mockReturnValue({ })
      agentController = new AgentController(mockGetAgentHandlers)

      await agentController.EvaluateBlock({}, mockCallback)

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith(null, {
        status: "SUCCESS",
        findings: [],
        metadata: {
          timestamp: systemTime.toISOString(),
        },
        private: false
      })
    })

    it("invokes callback with success response and findings from block handlers", async () => {
      const mockFinding = { some: 'finding' }
      mockHandleBlock.mockReturnValue([mockFinding])
      mockGetAgentHandlers.mockReturnValue({ handleBlock: mockHandleBlock })
      agentController = new AgentController(mockGetAgentHandlers)
      await agentController.initializeAgentHandlers()

      await agentController.EvaluateBlock(mockBlockRequest, mockCallback)

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith(null, {
        status: "SUCCESS",
        findings: [mockFinding],
        metadata: {
          timestamp: systemTime.toISOString(),
        },
        private: false
      })
      expect(mockHandleBlock).toHaveBeenCalledTimes(1)
      const blockEvent: BlockEvent = mockHandleBlock.mock.calls[0][0]
      expect(blockEvent).toBeInstanceOf(BlockEvent)
      expect(blockEvent.type).toEqual(EventType.BLOCK)
      expect(blockEvent.network).toEqual(Network.MAINNET)
      const grpcBlock = mockBlockRequest.request.event.block
      expect(blockEvent.blockHash).toEqual(grpcBlock.hash)
      expect(blockEvent.blockNumber).toEqual(parseInt(grpcBlock.number))
      expect(blockEvent.block).toStrictEqual({
        difficulty: grpcBlock.difficulty,
        extraData: grpcBlock.extraData,
        gasLimit: grpcBlock.gasLimit,
        gasUsed: grpcBlock.gasUsed,
        hash: grpcBlock.hash,
        logsBloom: grpcBlock.logsBloom,
        miner: formatAddress(grpcBlock.miner),
        mixHash: grpcBlock.mixHash,
        nonce: grpcBlock.nonce,
        number: parseInt(grpcBlock.number),
        parentHash: grpcBlock.parentHash,
        receiptsRoot: grpcBlock.receiptsRoot,
        sha3Uncles: grpcBlock.sha3Uncles,
        size: grpcBlock.size,
        stateRoot: grpcBlock.stateRoot,
        timestamp: parseInt(grpcBlock.timestamp),
        totalDifficulty: grpcBlock.totalDifficulty,
        transactions: grpcBlock.transactions,
        transactionsRoot: grpcBlock.transactionsRoot,
        uncles: grpcBlock.uncles
      })
    })
  })

  describe("EvaluateTx", () => {
    const mockTxRequest = generateTxRequest()

    it("invokes callback with error response if error occurs", async () => {
      mockGetAgentHandlers.mockReturnValue({ handleTransaction: mockHandleTransaction })
      agentController = new AgentController(mockGetAgentHandlers)
      await agentController.initializeAgentHandlers()
      const mockRequest = { 
        request: {
          event: {
            transaction: {
              hash: "0x123"
            }
          }
        }
      }

      await agentController.EvaluateTx(mockRequest, mockCallback)// error because request object is not fully populated

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith(null, {
        status: "ERROR",
        findings: [],
        metadata: {
          timestamp: systemTime.toISOString(),
        },
        private: false
      })
    })

    it("invokes callback with success response and empty findings if no transaction handlers", async () => {
      mockGetAgentHandlers.mockReturnValue({ })
      agentController = new AgentController(mockGetAgentHandlers)

      await agentController.EvaluateTx({}, mockCallback)

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith(null, {
        status: "SUCCESS",
        findings: [],
        metadata: {
          timestamp: systemTime.toISOString(),
        },
        private: false
      })
    })

    it("invokes callback with success response and findings from transaction handlers", async () => {
      mockHandleTransaction.mockReturnValue([mockFinding])
      mockGetAgentHandlers.mockReturnValue({ handleTransaction: mockHandleTransaction })
      agentController = new AgentController(mockGetAgentHandlers)
      await agentController.initializeAgentHandlers()

      await agentController.EvaluateTx(mockTxRequest, mockCallback)

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith(null, {
        status: "SUCCESS",
        findings: [mockFinding],
        metadata: {
          timestamp: systemTime.toISOString(),
        },
        private: false
      })
      expect(mockHandleTransaction).toHaveBeenCalledTimes(1)
      const txEvent: TransactionEvent = mockHandleTransaction.mock.calls[0][0]
      expect(txEvent).toBeInstanceOf(TransactionEvent)
      expect(txEvent.type).toEqual(EventType.BLOCK)
      expect(txEvent.network).toEqual(Network.MAINNET)
      const grpcTx = mockTxRequest.request.event.transaction
      expect(txEvent.transaction).toStrictEqual({
        hash: grpcTx.hash,
        from: formatAddress(grpcTx.from),
        to: formatAddress(grpcTx.to),
        nonce: parseInt(grpcTx.nonce),
        gas: grpcTx.gas,
        gasPrice: grpcTx.gasPrice,
        value: grpcTx.value,
        data: grpcTx.input,
        r: grpcTx.r,
        s: grpcTx.s,
        v: grpcTx.v,
      })
      const grpcReceipt = mockTxRequest.request.event.receipt
      expect(txEvent.receipt).toStrictEqual({
        status: false,
        root: grpcReceipt.root,
        gasUsed: grpcReceipt.gasUsed,
        cumulativeGasUsed: grpcReceipt.cumulativeGasUsed,
        logsBloom: grpcReceipt.logsBloom,
        logs: grpcReceipt.logs.map((log) => ({
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
        contractAddress: formatAddress(grpcReceipt.contractAddress),
        blockNumber: parseInt(grpcReceipt.blockNumber),
        blockHash: grpcReceipt.blockHash,
        transactionIndex: parseInt(grpcReceipt.transactionIndex),
        transactionHash: grpcReceipt.transactionHash,
      })
      const grpcTraces = mockTxRequest.request.event.traces
      expect(txEvent.traces).toStrictEqual(grpcTraces.map((trace) => ({
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
          output: trace.result.output
        },
        subtraces: trace.subtraces,
        traceAddress: trace.traceAddress,
        transactionHash: trace.transactionHash,
        transactionPosition: trace.transactionPosition,
        type: trace.type,
        error: trace.error,
      })))
      const grpcAddresses = mockTxRequest.request.event.addresses
      expect(txEvent.addresses).toStrictEqual(grpcAddresses)
      const grpcBlock = mockTxRequest.request.event.block
      expect(txEvent.block).toStrictEqual({
        hash: grpcBlock.blockHash,
        number: parseInt(grpcBlock.blockNumber),
        timestamp: parseInt(grpcBlock.blockTimestamp),
      })
    })
  })
})
import { provideRunFile, RunFile } from "./run.file";

describe("runFile", () => {
  let runFile: RunFile;
  const mockGetAgentHandlers = jest.fn();
  const mockGetJsonFile = jest.fn();
  const mockRunHandlersOnBlock = jest.fn();
  const mockRunHandlersOnTransaction = jest.fn();
  const mockRunHandlersOnAlert = jest.fn();
  const mockRunSequence = jest.fn();
  const mockFilePath = "some/file/path";

  beforeAll(() => {
    runFile = provideRunFile(
      mockGetAgentHandlers,
      mockGetJsonFile,
      mockRunHandlersOnBlock,
      mockRunHandlersOnTransaction,
      mockRunHandlersOnAlert,
      mockRunSequence
    );
  });

  it("throws error if no handlers found", async () => {
    mockGetAgentHandlers.mockReturnValueOnce({});

    try {
      await runFile(mockFilePath);
    } catch (e) {
      expect(e.message).toEqual("no block/transaction/alert handler found");
    }

    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1);
  });

  it("runs handlers against each event provided in file", async () => {
    mockGetAgentHandlers.mockReset();
    const mockHandleBlock = jest.fn().mockReturnValue([]);
    const mockHandleTransaction = jest.fn().mockReturnValue([]);
    const mockHandleAlert = jest.fn().mockReturnValue([]);
    mockGetAgentHandlers.mockReturnValueOnce({
      handleBlock: mockHandleBlock,
      handleTransaction: mockHandleTransaction,
      handleAlert: mockHandleAlert,
    });
    const blockEvent1 = { hash: "0xabc" };
    const blockEvent2 = { hash: "0xdef" };
    const blockEvent3 = "0xghi";
    const blockEvent4 = 1234;
    const txEvent1 = { transaction: { hash: "0x123" } };
    const txEvent2 = { transaction: { hash: "0x456" } };
    const txEvent3 = "0x789";
    const alertEvent1 = { alert: { hash: "0x123" } };
    const alertEvent2 = { alert: { hash: "0x456" } };
    const alertEvent3 = "0x328";
    const sequenceEvent1 = "a,b,c";
    const sequenceEvent2 = "d";
    mockGetJsonFile.mockReturnValueOnce({
      blockEvents: [blockEvent1, blockEvent2, blockEvent3, blockEvent4],
      transactionEvents: [txEvent1, txEvent2, txEvent3],
      alertEvents: [alertEvent1, alertEvent2, alertEvent3],
      sequenceEvents: [sequenceEvent1, sequenceEvent2],
    });

    await runFile(mockFilePath);

    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1);
    expect(mockGetJsonFile).toHaveBeenCalledTimes(1);
    expect(mockGetJsonFile).toHaveBeenCalledWith(mockFilePath);
    expect(mockHandleBlock).toHaveBeenCalledTimes(2);
    expect(mockHandleBlock).toHaveBeenNthCalledWith(1, blockEvent1);
    expect(mockHandleBlock).toHaveBeenNthCalledWith(2, blockEvent2);
    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(2);
    expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(1, blockEvent3);
    expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(2, blockEvent4);
    expect(mockHandleTransaction).toHaveBeenCalledTimes(2);
    expect(mockHandleTransaction).toHaveBeenNthCalledWith(1, txEvent1);
    expect(mockHandleTransaction).toHaveBeenNthCalledWith(2, txEvent2);
    expect(mockRunHandlersOnTransaction).toHaveBeenCalledTimes(1);
    expect(mockRunHandlersOnTransaction).toHaveBeenNthCalledWith(1, txEvent3);
    expect(mockHandleAlert).toHaveBeenCalledTimes(2);
    expect(mockHandleAlert).toHaveBeenNthCalledWith(1, alertEvent1);
    expect(mockHandleAlert).toHaveBeenNthCalledWith(2, alertEvent2);
    expect(mockRunHandlersOnAlert).toHaveBeenCalledTimes(1);
    expect(mockRunHandlersOnAlert).toHaveBeenNthCalledWith(1, alertEvent3);
    expect(mockRunSequence).toHaveBeenCalledTimes(2);
    expect(mockRunSequence).toHaveBeenNthCalledWith(1, sequenceEvent1);
    expect(mockRunSequence).toHaveBeenNthCalledWith(2, sequenceEvent2);
  });
});

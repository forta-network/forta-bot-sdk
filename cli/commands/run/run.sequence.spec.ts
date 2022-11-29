import { provideRunSequence, RunSequence } from "./run.sequence";

describe("runSequence", () => {
  let runSequence: RunSequence;
  const mockRunHandlersOnBlock = jest.fn();
  const mockRunHandlersOnTransaction = jest.fn();
  const mockRunHandlersOnAlert = jest.fn();

  beforeEach(() => {
    mockRunHandlersOnAlert.mockReset();
  });

  beforeAll(() => {
    runSequence = provideRunSequence(
      mockRunHandlersOnBlock,
      mockRunHandlersOnTransaction,
      mockRunHandlersOnAlert
    );
  });

  it("runs handlers on specified sequence with single step", async () => {
    const sequence = "0x123";

    await runSequence(sequence);

    expect(mockRunHandlersOnAlert).toHaveBeenCalledTimes(1);
    expect(mockRunHandlersOnAlert).toHaveBeenCalledWith(sequence);
  });

  it("runs handlers on specified sequence with multiple steps", async () => {
    const sequence = "0x123,9461,tx0x456";

    await runSequence(sequence);

    expect(mockRunHandlersOnAlert).toHaveBeenCalledTimes(1);
    expect(mockRunHandlersOnAlert).toHaveBeenCalledWith("0x123");
    expect(mockRunHandlersOnAlert).toHaveBeenCalledBefore(
      mockRunHandlersOnBlock
    );
    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(1);
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(9461);
    expect(mockRunHandlersOnBlock).toHaveBeenCalledBefore(
      mockRunHandlersOnTransaction
    );
    expect(mockRunHandlersOnTransaction).toHaveBeenCalledTimes(1);
    expect(mockRunHandlersOnTransaction).toHaveBeenCalledWith("0x456");
  });
});

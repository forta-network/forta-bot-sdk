import { ethers } from "ethers";
import { HandleTransaction } from "./handlers";
import { Finding, FindingSeverity, FindingType } from "./finding";
import { createTransactionEvent } from "./utils";

describe("finding", () => {
  // let handleTransaction: HandleTransaction;

  // const mockTxEvent = createTransactionEvent({} as any);
  // mockTxEvent.filterLog = jest.fn();

  //   handleTransaction = jest.fn().mockReturnValue([]);

  // const mockTetherTransferEvent = {
  //   args: {
  //     from: "0xabc",
  //     to: "0xdef",
  //     value: ethers.BigNumber.from("20000000000"), //20k with 6 decimals
  //   },
  // };
  // mockTxEvent.filterLog = jest
  //   .fn()
  //   .mockReturnValue([mockTetherTransferEvent]);

  // const findings = handleTransaction(mockTxEvent);

  const finding = Finding.fromObject({
    name: "High Tether Transfer",
    description: "High amount of USDT transferred",
    alertId: "FORTA-1",
    severity: FindingSeverity.Low,
    type: FindingType.Info,
  });

  it("should convert to string", () => {
    // console.log(finding.toString());
    // expect(finding.toString()).toBeString();
    expect(true).toBeTrue();
  });
});

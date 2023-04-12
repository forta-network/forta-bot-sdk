import { ethers } from "ethers";
import { Finding, FindingSeverity, FindingType } from "./finding";
import { EntityType, Label } from "./label";

describe("finding", () => {
  const TETHER_DECIMALS = 6;

  const mockTetherTransferEvent = {
    args: {
      from: "0xabc",
      to: "0xdef",
      value: ethers.BigNumber.from("20000000000"), //20k with 6 decimals
    },
  };

  const normalizedValue = mockTetherTransferEvent.args.value.div(
    10 ** TETHER_DECIMALS
  );

  const labelInput1 = {
    entityType: EntityType.Address,
    entity: "Address",
    label: "Address",
    confidence: 1,
  }

  const labelInput2 = {
    entityType: EntityType.Transaction,
    entity: "Transaction",
    label: "Transaction",
    confidence: 1,
  }

  const mockLabels = [Label.fromObject(labelInput1), Label.fromObject(labelInput2)];

  const findingInput = {
    name: "High Tether Transfer",
    description: `High amount of USDT transferred: ${normalizedValue}`,
    alertId: "FORTA-1",
    severity: FindingSeverity.Low,
    type: FindingType.Info,
    metadata: {
      to: mockTetherTransferEvent.args.to,
      from: mockTetherTransferEvent.args.from,
    },
    addresses: ["0x01", "0x02", "0x03"],
    labels: mockLabels,
  }

  const finding = Finding.fromObject(findingInput);

  it("should convert to string", () => {
    const expectedJSONString = JSON.stringify({
      name: "High Tether Transfer",
      description: `High amount of USDT transferred: ${normalizedValue}`,
      alertId: "FORTA-1",
      protocol: "ethereum",
      severity: FindingSeverity[findingInput.severity],
      type: FindingType[findingInput.type],
      metadata: {
        to: mockTetherTransferEvent.args.to,
        from: mockTetherTransferEvent.args.from,
      },
      addresses: ["0x01", "0x02", "0x03"],
      labels: findingInput.labels
    }, null, 2);

    expect(finding.toString()).toEqual(expectedJSONString);
  });
});

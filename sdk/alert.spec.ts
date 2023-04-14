import { Alert } from "./alert";
import { FindingSeverity, FindingType } from "./finding";
import { EntityType, Label } from "./label";

describe("alert", () => {
  describe("no addressBloomFilter", () => {
    const mockAddress1 = "0x111", mockAddress2 = "0x112", mockAddress3 = "0x113", mockAddress4 = "0x114";
    const mockAlertId = "ALERT-1";
    const mockAlertHash = "0x123";
    const mockAlertContracts = [{address: "0x321", name: "CONTRACT-1", projectId: "1"}];
    const mockAlertCreatedAt = new Date().toISOString();
    const mockAlertDescription = "ALERT-1-DESCRIPTION";
    const mockAlertFindingType = FindingType[FindingType.Scam];
    const mockAlertName = "Mock Alert 1";
    const mockAlertProtocol = "ethereum";
    const mockAlertScanNodeCount = 2;
    const mockAlertSeverity = FindingSeverity[FindingSeverity.Medium];
    const mockAlertDocumentType = "Document";
    const mockAlertRelatedAlerts = ["ALERT-2"];
    const mockChainId = 1;
    const mockAlertLabels = [Label.fromObject({
      entityType: EntityType.Address,
      entity: "Address",
      label: "Address",
      confidence: 1,
    })];
    const mockAlertSource = {           
      transactionHash: "0x456",
      block: {
        timestamp: "2022-03-20T13:01:00Z",
        chainId: 1,
        hash: "0x789",
        number: 10,
      },
      bot: {
        id: "BOT-1",
      }
    };
    const mockAlertMetadata = {
      timestamp: new Date().toISOString(),
    };
    const mockAlertProjects = [{
      id: "PROJECT-1",
      name: "Project 1",
    }];

    
    const mockAlert = Alert.fromObject({
      addresses: [mockAddress1, mockAddress2, mockAddress3],
      alertId: mockAlertId,
      hash: mockAlertHash,
      contracts: mockAlertContracts,
      createdAt: mockAlertCreatedAt,
      description: mockAlertDescription,
      findingType: mockAlertFindingType,
      name: mockAlertName,
      protocol: mockAlertProtocol,
      scanNodeCount: mockAlertScanNodeCount,
      severity: mockAlertSeverity,
      alertDocumentType: mockAlertDocumentType,
      relatedAlerts: mockAlertRelatedAlerts,
      chainId: mockChainId,
      labels: mockAlertLabels,
      source: mockAlertSource,
      metadata: mockAlertMetadata,
      projects: mockAlertProjects,
    });

    it("should returns Alert attributes", () => {
      expect(mockAlert.addresses).toEqual([mockAddress1, mockAddress2, mockAddress3]);
      expect(mockAlert.alertId).toEqual(mockAlertId);
      expect(mockAlert.hash).toEqual(mockAlertHash);
      expect(mockAlert.contracts).toEqual(mockAlertContracts);
      expect(mockAlert.createdAt).toEqual(mockAlertCreatedAt);
      expect(mockAlert.description).toEqual(mockAlertDescription);
      expect(mockAlert.findingType).toEqual(mockAlertFindingType);
      expect(mockAlert.name).toEqual(mockAlertName);
      expect(mockAlert.protocol).toEqual(mockAlertProtocol);
      expect(mockAlert.scanNodeCount).toEqual(mockAlertScanNodeCount);
      expect(mockAlert.severity).toEqual(mockAlertSeverity);
      expect(mockAlert.alertDocumentType).toEqual(mockAlertDocumentType);
      expect(mockAlert.relatedAlerts).toEqual(mockAlertRelatedAlerts);
      expect(mockAlert.chainId).toEqual(mockChainId);
      expect(mockAlert.labels).toEqual(mockAlertLabels);
      expect(mockAlert.source).toEqual(mockAlertSource);
      expect(mockAlert.metadata).toEqual(mockAlertMetadata);
      expect(mockAlert.projects).toEqual(mockAlertProjects);
    });

    it("should returns true when it contains a specific address", () => {
      expect(mockAlert.hasAddress(mockAddress1)).toBeTrue();
      expect(mockAlert.hasAddress(mockAddress2)).toBeTrue();
      expect(mockAlert.hasAddress(mockAddress3)).toBeTrue();
    });

    it("should returns false when it does not contain a specific address", () => {
      expect(mockAlert.hasAddress(mockAddress4)).toBeFalse();
    });
  });

  describe("has addressBloomFilter", () => {
    const k = "0xa"; //10
    const m = "0xd33"; //3379
    const bitset =
      "AAAAAAAADTMAAAAAAAAACgAAAAAAAA0zoCntpyGtcm49UqMM9AWNWqEnAxF/UO3IbAPDWRKTJq+wpI051Z+uHn7exEpOzxdllSK+ICU9OfhN+FXsLpC2HkzRYDrOJ0Zp9DG73mRPvwRTcyFHwSOwlCtNoE9pgSk8jXe2S7uTanRQrS6WnP71vagcoXHydeiJfyVIxHIEt5IydneVsPBO0ko/iypb5EtAx57IiOWgmIWqngc+mao8bY9rxe42mv4ZnG/JGRqZyxdgIWSLrpCwkqOEVyYxuHFzoH67YujJUuPsl8GY0sFMJdpuySJlEgzIELFNcsJSA9YLLgAJ7flterIjUIgTad3rgR2kNu1OQksso0NlQY2OhguEoNDrtJcWTRwYudO69Q5Kp1mcg3ax+n0iP4Q8tgjrJhD0EnLujlYQPH1Gdr8v1zJVZ2PhLVFDnXjQGoZ6Lmqi/fjOTpvHwSks+jeHuCzWF1X9Lvm7/LPWDd2XX/jmyp9df2NiA/Jb3FhZf3akolcMIo5hnXnnyn1LupGbILiIz24NwzMl3w43xOe1bDEvRKiD+s3qNhrxbmWM9V03NMYABHfM2p7W1Q==";
    
    const mockAlert = Alert.fromObject({
      addressBloomFilter: {k, m, bitset},
    });

    it("should returns addressBloomFilter", () => {
      expect(mockAlert.addressBloomFilter).toEqual({k, m, bitset});
    });

    it("should returns true when it contains a specific address on addressBloomFilter", () => {
      expect(
        mockAlert.hasAddress("0x030cb0fd022b0a66d2d6e39d0691cce86d4188b8")
      ).toBeTrue();
      expect(
        mockAlert.hasAddress("0x1727b5a84fee033c3065473cc91c23e8607eef6b")
      ).toBeTrue();
      expect(
        mockAlert.hasAddress("0x1f11417c24fecc07154ce96db1b7b6af11c3af3f")
      ).toBeTrue();
    });

    it("should returns false when it does not contain a specific address on addressBloomFilter", () => {
      expect(mockAlert.hasAddress("a")).toBeFalse();
      expect(mockAlert.hasAddress("b")).toBeFalse();
      expect(mockAlert.hasAddress("c")).toBeFalse();
    });
  })

  describe("no address and no addressBloomFilter", () => {
    const mockAlert = Alert.fromObject({});

    it("should returns false", () => {
      expect(mockAlert.hasAddress("0x111")).toBeFalse();
      expect(mockAlert.hasAddress("0x112")).toBeFalse();
      expect(mockAlert.hasAddress("0x113")).toBeFalse();
      expect(mockAlert.hasAddress("0x030cb0fd022b0a66d2d6e39d0691cce86d4188b8")).toBeFalse();
      expect(mockAlert.hasAddress("0x1727b5a84fee033c3065473cc91c23e8607eef6b")).toBeFalse();
      expect(mockAlert.hasAddress("0x1f11417c24fecc07154ce96db1b7b6af11c3af3f")).toBeFalse();
      expect(mockAlert.hasAddress("a")).toBeFalse();
      expect(mockAlert.hasAddress("b")).toBeFalse();
      expect(mockAlert.hasAddress("c")).toBeFalse();
    });
  })
});
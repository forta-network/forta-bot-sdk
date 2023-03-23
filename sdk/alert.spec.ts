import { Alert } from "./alert";

describe("alert", () => {
  describe("no addressBloomFilter", () => {
    const mockAddress1 = "0x111", mockAddress2 = "0x112", mockAddress3 = "0x113", mockAddress4 = "0x114";
    const mockAlert = Alert.fromObject({
      addresses: [mockAddress1, mockAddress2, mockAddress3],
    });

    it("returns true when it contains a specific address", () => {
      expect(mockAlert.hasAddress(mockAddress1)).toBeTrue();
      expect(mockAlert.hasAddress(mockAddress2)).toBeTrue();
      expect(mockAlert.hasAddress(mockAddress3)).toBeTrue();
    });

    it("returns false when it does not contain a specific address", () => {
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

    it("returns true when it contains a specific address on addressBloomFilter", () => {
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

    it("returns false when it does not contain a specific address on addressBloomFilter", () => {
      expect(mockAlert.hasAddress("a")).toBeFalse();
      expect(mockAlert.hasAddress("b")).toBeFalse();
      expect(mockAlert.hasAddress("c")).toBeFalse();
    });
  })

  describe("no address and no addressBloomFilter", () => {
    const mockAlert = Alert.fromObject({});

    it("returns false", () => {
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
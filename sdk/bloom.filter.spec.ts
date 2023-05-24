import { BloomFilter } from "./bloom.filter";

describe("BloomFilter", () => {
  describe("alert 0xb680bc4e826ee6419f738a7cd76838126a1cfd85ef4607cb0ae2b75b0a5c70af", () => {
    it("returns correct filter values", () => {
      const k = "0xa"; //10
      const m = "0xd33"; //3379
      const content =
        "AAAAAAAADTMAAAAAAAAACgAAAAAAAA0zoCntpyGtcm49UqMM9AWNWqEnAxF/UO3IbAPDWRKTJq+wpI051Z+uHn7exEpOzxdllSK+ICU9OfhN+FXsLpC2HkzRYDrOJ0Zp9DG73mRPvwRTcyFHwSOwlCtNoE9pgSk8jXe2S7uTanRQrS6WnP71vagcoXHydeiJfyVIxHIEt5IydneVsPBO0ko/iypb5EtAx57IiOWgmIWqngc+mao8bY9rxe42mv4ZnG/JGRqZyxdgIWSLrpCwkqOEVyYxuHFzoH67YujJUuPsl8GY0sFMJdpuySJlEgzIELFNcsJSA9YLLgAJ7flterIjUIgTad3rgR2kNu1OQksso0NlQY2OhguEoNDrtJcWTRwYudO69Q5Kp1mcg3ax+n0iP4Q8tgjrJhD0EnLujlYQPH1Gdr8v1zJVZ2PhLVFDnXjQGoZ6Lmqi/fjOTpvHwSks+jeHuCzWF1X9Lvm7/LPWDd2XX/jmyp9df2NiA/Jb3FhZf3akolcMIo5hnXnnyn1LupGbILiIz24NwzMl3w43xOe1bDEvRKiD+s3qNhrxbmWM9V03NMYABHfM2p7W1Q==";

      const bloomFilter = new BloomFilter(m, k, content);

      expect(
        bloomFilter.has("0x030cb0fd022b0a66d2d6e39d0691cce86d4188b8")
      ).toBeTrue();
      expect(
        bloomFilter.has("0x1727b5a84fee033c3065473cc91c23e8607eef6b")
      ).toBeTrue();
      expect(
        bloomFilter.has("0x1f11417c24fecc07154ce96db1b7b6af11c3af3f")
      ).toBeTrue();
      expect(bloomFilter.has("a")).toBeFalse();
      expect(bloomFilter.has("b")).toBeFalse();
      expect(bloomFilter.has("c")).toBeFalse();
    });
  });

  describe("alert 0xd7387cfe3ad5e051ba195ab0386ae33b2359ca403d650df5d05fc6dc596db149", () => {
    it("returns correct filter values", () => {
      const k = 11;
      const m = 15;
      const content = "AAAAAAAAAA8AAAAAAAAACwAAAAAAAAAPAAAAAAAANtI=";

      const bloomFilter = new BloomFilter(m, k, content);

      expect(
        bloomFilter.has("0x68f180fcce6836688e9084f035309e29bf0a2095")
      ).toBeTrue();
      expect(bloomFilter.has("a")).toBeFalse();
      expect(bloomFilter.has("b")).toBeFalse();
      expect(bloomFilter.has("c")).toBeFalse();
    });
  });
});

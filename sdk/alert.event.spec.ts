import { Alert } from "./alert";
import { AlertEvent } from "./alert.event";

describe("alertEvent", () => {
	const alertSource = {           
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
	}

	const mockAlert = Alert.fromObject({
		alertId: "ALERT-1",
		name: "Mock Alert 1",
		hash: "0x123",
		source: alertSource,
		chainId: 1,
		addresses: ["0x111", "0x112", "0x113"],
	});
		
	const alertEvent = new AlertEvent(mockAlert)

	it("returns AlertEvent attributes", () => {
		expect(alertEvent.alertId).toEqual(mockAlert.alertId);
		expect(alertEvent.name).toEqual(mockAlert.name);
		expect(alertEvent.hash).toEqual(mockAlert.hash);
		expect(alertEvent.alertHash).toEqual(mockAlert.hash);
		expect(alertEvent.botId).toEqual(mockAlert.source?.bot?.id);
		expect(alertEvent.transactionHash).toEqual(mockAlert.source?.transactionHash);
		expect(alertEvent.blockHash).toEqual(mockAlert.source?.block?.hash);
		expect(alertEvent.blockNumber).toEqual(mockAlert.source?.block?.number);
		expect(alertEvent.chainId).toEqual(mockAlert.chainId);
	});

	it("returns true when it contains a specific address", () => {
		expect(alertEvent.hasAddress("0x111")).toBeTrue();
	});

	it("returns false when it does not contain a specific address", () => {
		expect(alertEvent.hasAddress("0x123")).toBeFalse();
	});
});
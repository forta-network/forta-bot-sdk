import { Alert, AlertSource } from "./alert";
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
		expect(alertEvent.alertId).toEqual("ALERT-1");
		expect(alertEvent.name).toEqual("Mock Alert 1");
		expect(alertEvent.hash).toEqual("0x123");
		expect(alertEvent.alertHash).toEqual("0x123");
		expect(alertEvent.botId).toEqual("BOT-1");
		expect(alertEvent.transactionHash).toEqual("0x456");
		expect(alertEvent.blockHash).toEqual("0x789");
		expect(alertEvent.blockNumber).toEqual(10);
		expect(alertEvent.chainId).toEqual(1);
	});

	it("returns true when it has address", () => {
		expect(alertEvent.hasAddress).toBeTrue;
	});

	it("returns false when it has no address", () => {
		const mockAlert2 = Alert.fromObject({
			alertId: "ALERT-2",
			addresses: [],
		});
			
		const alertEvent2 = new AlertEvent(mockAlert2)

		expect(alertEvent2.hasAddress).toBeFalse;
	});
});
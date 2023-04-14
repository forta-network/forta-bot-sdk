import { Alert } from "./alert";
import { AlertEvent } from "./alert.event";

describe("alertEvent", () => {
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
	}

	const mockAddress1 = "0x111", mockAddress2 = "0x112", mockAddress3 = "0x113", mockAddress4 = "0x114";

	const mockAlert = Alert.fromObject({
		alertId: "ALERT-1",
		name: "Mock Alert 1",
		hash: "0x123",
		source: mockAlertSource,
		chainId: 1,
		addresses: [mockAddress1, mockAddress2, mockAddress3],
	});
		
	const mockAlertEvent = new AlertEvent(mockAlert);

	it("should returns AlertEvent attributes", () => {
		expect(mockAlertEvent.alertId).toEqual(mockAlert.alertId);
		expect(mockAlertEvent.name).toEqual(mockAlert.name);
		expect(mockAlertEvent.hash).toEqual(mockAlert.hash);
		expect(mockAlertEvent.alertHash).toEqual(mockAlert.hash);
		expect(mockAlertEvent.botId).toEqual(mockAlert.source?.bot?.id);
		expect(mockAlertEvent.transactionHash).toEqual(mockAlert.source?.transactionHash);
		expect(mockAlertEvent.blockHash).toEqual(mockAlert.source?.block?.hash);
		expect(mockAlertEvent.blockNumber).toEqual(mockAlert.source?.block?.number);
		expect(mockAlertEvent.chainId).toEqual(mockAlert.chainId);
	});

	it("should returns true when it contains a specific address", () => {
		expect(mockAlertEvent.hasAddress(mockAddress1)).toBeTrue();
		expect(mockAlertEvent.hasAddress(mockAddress2)).toBeTrue();
		expect(mockAlertEvent.hasAddress(mockAddress3)).toBeTrue();
	});

	it("should returns false when it does not contain a specific address", () => {
		expect(mockAlertEvent.hasAddress(mockAddress4)).toBeFalse();
	});
});
import { Alert } from "./alert";

export class AlertEvent {
  constructor(readonly alert: Alert) {}

  get alertId() {
    return this.alert.alertId;
  }

  get name() {
    return this.alert.name;
  }

  get hash() {
    return this.alertHash;
  }

  get alertHash() {
    return this.alert.hash;
  }

  get botId() {
    return this.alert.source?.bot?.id;
  }

  get transactionHash() {
    return this.alert.source?.transactionHash;
  }

  get blockHash() {
    return this.alert.source?.block?.hash;
  }

  get blockNumber() {
    return this.alert.source?.block?.number;
  }

  get chainId() {
    return this.alert.source?.block?.chainId;
  }
}

import {Alert} from "./alert";

export class AlertEvent {
  constructor(
    readonly alert: Alert
  ) {}

  get alertHash() {
    return this.alert.hash
  }
}
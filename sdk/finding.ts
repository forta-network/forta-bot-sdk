import { EntityType, Label } from "./label"
import { assertIsFromEnum, assertIsNonEmptyString } from "./utils"

export enum FindingSeverity {
  Unknown,
  Info,
  Low,
  Medium,
  High,
  Critical
}

export enum FindingType {
  Unknown,
  Exploit,
  Suspicious,
  Degraded,
  Info,
  Scam
}

type FindingInput = {
  name: string,
  description: string,
  alertId: string,
  protocol?: string,
  severity: FindingSeverity,
  type: FindingType,
  metadata?: { [key: string]: string},
  addresses?: string[],
  labels?: Label[],
  uniqueKey?: string,
}

export class Finding {
  private constructor(
    readonly name: string,
    readonly description: string,
    readonly alertId: string,
    readonly protocol: string,
    readonly severity: FindingSeverity,
    readonly type: FindingType,
    readonly metadata: { [key: string]: string},
    readonly addresses: string[],
    readonly labels: Label[],
    readonly uniqueKey: string,
  ) {}

  toString() {
    return JSON.stringify({
      ...this,
      severity: FindingSeverity[this.severity],
      type: FindingType[this.type],
      labels: this.labels.map(l => Object.assign(l, {
        entityType: EntityType[l.entityType]}))
    }, null, 2)
  }

  static from(findingInput: FindingInput) {
    return this.fromObject(findingInput)
  }

  static fromObject({
    name,
    description,
    alertId,
    protocol = 'ethereum',
    severity,
    type,
    metadata = {},
    addresses = [],
    labels = [],
    uniqueKey = '',
  }: FindingInput) {
    assertIsNonEmptyString(name, 'name')
    assertIsNonEmptyString(description, 'description')
    assertIsNonEmptyString(alertId, 'alertId')
    assertIsNonEmptyString(protocol, 'protocol')
    assertIsFromEnum(severity, FindingSeverity, 'severity')
    assertIsFromEnum(type, FindingType, 'type')
    // TODO assert metadata keys and values are strings

    labels = labels.map(l => l instanceof Label ? l : Label.fromObject(l))
    return new Finding(name, description, alertId, protocol, severity, type, metadata, addresses, labels, uniqueKey)
  }
}
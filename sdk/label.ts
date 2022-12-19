export enum LabelType {
  Unknown,
  Custom,
  ProtocolAttack,
  Scam,
  RugPull,
  Bridge,
  Mixer,
  Dex,
  Cex,
  Attacker,
  Victim,
  Eoa,
  Contract,
  Good,
}

export enum EntityType {
  Unknown,
  Address,
  Transaction,
  Block,
  Url,
}

type LabelInput = {
  entityType: EntityType;
  entity: string;
  labelType: LabelType;
  confidence: number;
  customValue?: string;
};

export class Label {
  private constructor(
    readonly entityType: EntityType,
    readonly entity: string,
    readonly labelType: LabelType,
    readonly confidence: number,
    readonly customValue?: string
  ) {}

  static fromObject({
    entityType,
    entity,
    labelType,
    confidence,
    customValue,
  }: LabelInput) {
    return new Label(entityType, entity, labelType, confidence, customValue);
  }
}

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
  label: string;
  confidence: number;
  remove: boolean;
};

export class Label {
  private constructor(
    readonly entityType: EntityType,
    readonly entity: string,
    readonly label: string,
    readonly confidence: number,
    readonly remove: boolean
  ) {}

  static fromObject({
    entityType,
    entity,
    label,
    confidence,
    remove = false,
  }: LabelInput) {
    return new Label(entityType, entity, label, confidence, remove);
  }
}

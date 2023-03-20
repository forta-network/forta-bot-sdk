export enum EntityType {
  Unknown,
  Address,
  Transaction,
  Block,
  Url,
}

export const ENTITY_TYPE_STRING_TO_ENUM = {
  UNKNOWN: EntityType.Unknown,
  ADDRESS: EntityType.Address,
  TRANSACTION: EntityType.Transaction,
  BLOCK: EntityType.Block,
  URL: EntityType.Url,
};

type LabelInput = {
  entityType: EntityType;
  entity: string;
  label: string;
  confidence: number;
  remove: boolean;
  metadata: string[];
};

export class Label {
  private constructor(
    readonly entityType: EntityType,
    readonly entity: string,
    readonly label: string,
    readonly confidence: number,
    readonly remove: boolean,
    readonly metadata: string[]
  ) {}

  static fromObject({
    entityType,
    entity,
    label,
    confidence,
    remove = false,
    metadata = [],
  }: LabelInput) {
    if (typeof entityType == "string") {
      entityType = ENTITY_TYPE_STRING_TO_ENUM[entityType];
    }
    return new Label(entityType, entity, label, confidence, remove, metadata);
  }
}

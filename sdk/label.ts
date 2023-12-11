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

export type LabelSource = {
  alertHash?: string;
  alertId?: string;
  bot?: {
    id: string;
    image: string;
    imageHash: string;
    manifest: string;
  };
  chainId?: number;
  id?: string;
};

type LabelInput = {
  entityType: EntityType;
  entity: string;
  label: string;
  confidence: number;
  remove?: boolean;
  metadata?: { [key: string]: string };
  source?: LabelSource;
  createdAt?: string;
  id?: string;
  uniqueKey?: string;
  embedding?: number[];
};

export class Label {
  private constructor(
    readonly entityType: EntityType,
    readonly entity: string,
    readonly label: string,
    readonly confidence: number,
    readonly remove: boolean,
    readonly metadata: { [key: string]: string },
    readonly source?: LabelSource,
    readonly id?: string,
    readonly createdAt?: string,
    readonly uniqueKey?: string,
    readonly embedding?: number[]
  ) {}

  static from(labelInput: LabelInput) {
    return this.fromObject(labelInput);
  }

  static fromObject({
    entityType,
    entity,
    label,
    confidence,
    remove = false,
    metadata = {},
    source,
    id,
    createdAt,
    uniqueKey,
    embedding
  }: LabelInput) {
    if (typeof entityType == "string") {
      entityType = ENTITY_TYPE_STRING_TO_ENUM[entityType];
    }
    if (Array.isArray(metadata)) {
      // convert string array to string key/value map using first '=' character as separator
      // (label metadata is received as string array for handleAlert)
      let metadataMap: { [key: string]: string } = {};
      for (const arrayItem of metadata) {
        const separatorIndex = arrayItem.indexOf("=");
        const key = arrayItem.substring(0, separatorIndex);
        const value = arrayItem.substring(separatorIndex + 1, arrayItem.length);
        metadataMap[key] = value;
      }
      metadata = metadataMap;
    }
    return new Label(
      entityType,
      entity,
      label,
      confidence,
      remove,
      metadata,
      source,
      id,
      createdAt,
      uniqueKey,
      embedding
    );
  }
}

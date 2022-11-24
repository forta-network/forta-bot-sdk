
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
    Contract
}

export enum EntityType {
    Unknown,
    Address,
    Transaction,
    Block,
    Url
}

export interface Label {
    entityType: EntityType,
    entity: string,
    labelType: LabelType,
    confidence: number,
    customValue: string
}
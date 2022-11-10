export enum ResponseStatus {
    UNKNOWN,
    ERROR,
    SUCCESS
}

export interface Error {
    message: string
}

export interface CombinerBotSubscription {
    botId: string;
    alertId: string;
}

export interface AlertConfig {
    subscriptions: CombinerBotSubscription[];
}

export interface InitializeResponse {
    difficulty: string;
    errors: Error[];
    alertConfig: AlertConfig;
}
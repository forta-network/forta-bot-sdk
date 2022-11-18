export interface BotSubscription {
  botId: string;
  alertId: string;
}

export interface AlertConfig {
  subscriptions: BotSubscription[];
}

export interface InitializeResponse {
  alertConfig: AlertConfig;
}

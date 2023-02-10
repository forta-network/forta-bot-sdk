export interface BotSubscription {
  botId: string;
  alertId?: string;
  alertIds?: string[];
  chainId?: number;
}

export interface AlertConfig {
  subscriptions: BotSubscription[];
}

export interface InitializeResponse {
  alertConfig: AlertConfig;
}

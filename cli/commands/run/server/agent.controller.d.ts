import { GetBotHandlers } from "../../../utils/get.agent.handlers";

export = AgentController

declare class AgentController {
  constructor(getBotHandlers: GetBotHandlers)
  Initialize(call: any, callback: any): void
  EvaluateBlock(call: any, callback: any): void
  EvaluateTx(call: any, callback: any): void
}
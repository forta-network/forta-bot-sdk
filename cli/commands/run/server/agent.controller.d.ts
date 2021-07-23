import { GetAgentHandlers } from "../../../utils/get.agent.handlers";

export = AgentController

declare class AgentController {
  constructor(getAgentHandlers: GetAgentHandlers)
  Initialize(call: any, callback: any): void
  EvaluateBlock(call: any, callback: any): void
  EvaluateTx(call: any, callback: any): void
}
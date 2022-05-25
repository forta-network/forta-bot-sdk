import { Server, ServerCredentials } from '@grpc/grpc-js';
import { assertExists, assertIsNonEmptyString } from '../../../utils';
import AgentController from './agent.controller';

// runs the production grpc server to listen for requests from scanner node
export type RunProdServer = () => Promise<void>

export default function provideRunProdServer(
  port: string,
  agentController: AgentController,
  agentProto: any
): RunProdServer {
  assertIsNonEmptyString(port, 'port')
  assertExists(agentController, 'agentController')
  assertExists(agentProto, 'agentProto')

  return async function runProdServer() {
    console.log(`starting Forta Agent server...`)
    
    var server = new Server();
    server.addService(agentProto.network.forta.Agent.service, agentController as any);
    server.bindAsync(`0.0.0.0:${port}`, ServerCredentials.createInsecure(), () => {
      server.start();
      console.log(`listening on port ${port}`)
    });
  }
}
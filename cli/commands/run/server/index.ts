import { join } from 'path';
import { loadPackageDefinition, Server, ServerCredentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { assertExists, assertIsNonEmptyString } from '../../../utils';
import AgentController from './agent.controller';

// runs the production grpc server to listen for requests from scanner node
export type RunProdServer = () => Promise<void>

const PROTO_PATH = './agent.proto'

export default function provideRunProdServer(
  port: string,
  agentController: AgentController
): RunProdServer {
  assertIsNonEmptyString(port, 'port')
  assertExists(agentController, 'agentController')

  return async function runProdServer() {
    console.log(`starting Forta Agent server...`)
    const packageDefinition = loadSync(join(__dirname, PROTO_PATH), {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    const agentProto = loadPackageDefinition(packageDefinition) as any;
  
    var server = new Server();
    server.addService(agentProto.network.forta.Agent.service, agentController as any);
    server.bindAsync(`0.0.0.0:${port}`, ServerCredentials.createInsecure(), () => {
      server.start();
      console.log(`listening on port ${port}`)
    });
  }
}
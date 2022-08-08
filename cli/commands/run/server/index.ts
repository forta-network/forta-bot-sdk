import { join } from 'path';
import { assertIsNonEmptyString } from '../../../../sdk/utils';
import { loadPackageDefinition, Server, ServerCredentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { assertExists } from '../../../utils';
import BotController from './agent.controller';

// runs the production grpc server to listen for requests from scanner node
export type RunProdServer = () => Promise<void>

const PROTO_PATH = './agent.proto'

export default function provideRunProdServer(
  port: string,
  botController: BotController
): RunProdServer {
  assertIsNonEmptyString(port, 'port')
  assertExists(botController, 'botController')

  return async function runProdServer() {
    console.log(`starting Forta Bot server...`)
    const packageDefinition = loadSync(join(__dirname, PROTO_PATH), {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    const botProto = loadPackageDefinition(packageDefinition) as any;
  
    var server = new Server();
    server.addService(botProto.network.forta.Agent.service, botController as any);
    server.bindAsync(`0.0.0.0:${port}`, ServerCredentials.createInsecure(), () => {
      server.start();
      console.log(`listening on port ${port}`)
    });
  }
}
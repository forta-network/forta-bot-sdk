import { assertExists } from "../utils";
import {
  GrpcEvaluateTxRequest,
  GrpcEvaluateTxResponse,
  GrpcFinding,
} from "./types";

export type GrpcHandleTransaction = (
  request: GrpcEvaluateTxRequest
) => Promise<GrpcFinding[]>;

export default function provideGrpcHandleTransaction(
  agentGrpcClient: any
): GrpcHandleTransaction {
  assertExists(agentGrpcClient, "agentGrpcClient");

  return async function grpcHandleTransaction(request: GrpcEvaluateTxRequest) {
    const findings: GrpcFinding[] = await new Promise((resolve, reject) => {
      agentGrpcClient.EvaluateTx(
        request,
        (err: any, response: GrpcEvaluateTxResponse) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(response.findings);
        }
      );
    });

    return findings;
  };
}

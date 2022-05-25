import { assertExists } from "../utils";
import {
  GrpcEvaluateBlockRequest,
  GrpcEvaluateBlockResponse,
  GrpcFinding,
} from "./types";

export type GrpcHandleBlock = (
  request: GrpcEvaluateBlockRequest
) => Promise<GrpcFinding[]>;

export default function provideGrpcHandleBlock(
  agentGrpcClient: any
): GrpcHandleBlock {
  assertExists(agentGrpcClient, "agentGrpcClient");

  return async function grpcHandleBlock(request: GrpcEvaluateBlockRequest) {
    const findings: GrpcFinding[] = await new Promise((resolve, reject) => {
      agentGrpcClient.EvaluateBlock(
        request,
        (err: any, response: GrpcEvaluateBlockResponse) => {
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

import { ethers } from "ethers";
import { toUtf8Bytes } from "@ethersproject/strings";
import axios, { AxiosInstance } from "axios";
import { assertExists } from "./utils";

interface DecodedJwt {
  header: any;
  payload: any;
}

export const MOCK_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJib3QtaWQiOiIweDEzazM4N2IzNzc2OWNlMjQyMzZjNDAzZTc2ZmMzMGYwMWZhNzc0MTc2ZTE0MTZjODYxeWZlNmMwN2RmZWY3MWYiLCJleHAiOjE2NjAxMTk0NDMsImlhdCI6MTY2MDExOTQxMywianRpIjoicWtkNWNmYWQtMTg4NC0xMWVkLWE1YzktMDI0MjBhNjM5MzA4IiwibmJmIjoxNjYwMTE5MzgzLCJzdWIiOiIweDU1NmY4QkU0MmY3NmMwMUY5NjBmMzJDQjE5MzZEMmUwZTBFYjNGNEQifQ.9v5OiiYhDoEbhZ-abbiSXa5y-nQXa104YCN_2mK7SP0";

export type FetchJwt = (claims: object, expiresAt?: Date) => Promise<string>;
export const provideFetchJwt = (axios: AxiosInstance): FetchJwt => {
  assertExists(axios, "axios");

  return async function fetchJwt(claims: object, expiresAt?: Date) {
    if (process.env.NODE_ENV !== "production") return MOCK_JWT;

    const hostname = "forta-jwt-provider";
    const port = 8515;
    const path = "/create";

    let fullClaims = { ...claims };

    if (expiresAt) {
      const expInSec = Math.floor(expiresAt.getTime() / 1000);

      // This covers the edge case where a Date that causes a seconds value to have number overflow resulting in a null exp
      const safeExpInSec =
        expInSec > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : expInSec;

      fullClaims = {
        exp: safeExpInSec,
        ...fullClaims,
      };
    }

    const response = await axios.post(`http://${hostname}:${port}${path}`, {
      claims: fullClaims,
    });
    return response.data.token;
  };
};
export const fetchJwt = provideFetchJwt(axios);

export const decodeJwt = (token: string): DecodedJwt => {
  const splitJwt = token.split(".");
  const header = JSON.parse(Buffer.from(splitJwt[0], "base64").toString());
  const payload = JSON.parse(Buffer.from(splitJwt[1], "base64").toString());

  return {
    header,
    payload,
  };
};

export const verifyJwt = async (
  token: string,
  polygonRpcUrl: string = "https://polygon-rpc.com"
): Promise<boolean> => {
  const splitJwt = token.split(".");
  const rawHeader = splitJwt[0];
  const rawPayload = splitJwt[1];

  const header = JSON.parse(Buffer.from(rawHeader, "base64").toString());
  const payload = JSON.parse(Buffer.from(rawPayload, "base64").toString());

  const botId = payload["bot-id"] as string;
  const expiresAt = payload["exp"] as number;
  const algorithm = header?.alg;

  if (algorithm !== "ETH") {
    console.warn(`Unexpected signing method: ${algorithm}`);
    return false;
  }

  if (!botId) {
    console.warn(`Invalid claim`);
    return false;
  }

  const signerAddress = payload?.sub as string | undefined; // public key should be contract address that signed the JWT

  if (!signerAddress) {
    console.warn(`Invalid claim`);
    return false;
  }

  const currentUnixTime = Math.floor(Date.now() / 1000);

  if (expiresAt < currentUnixTime) {
    console.warn(`Jwt is expired`);
    return false;
  }

  const digest = ethers.utils.keccak256(
    toUtf8Bytes(`${rawHeader}.${rawPayload}`)
  );
  const signature = `0x${Buffer.from(splitJwt[2], "base64").toString("hex")}`;

  const recoveredSignerAddress = ethers.utils.recoverAddress(digest, signature); // Contract address that signed message

  if (recoveredSignerAddress !== signerAddress) {
    console.warn(
      `Signature invalid: expected=${signerAddress}, got=${recoveredSignerAddress}`
    );
    return false;
  }

  const polygonProvider = new ethers.providers.JsonRpcProvider(polygonRpcUrl);

  const DISPTACHER_ARE_THEY_LINKED =
    "function areTheyLinked(uint256 agentId, uint256 scannerId) external view returns(bool)";
  const DISPATCH_CONTRACT = "0xd46832F3f8EA8bDEFe5316696c0364F01b31a573"; // Source: https://docs.forta.network/en/latest/smart-contracts/
  const dispatchContract = new ethers.Contract(
    DISPATCH_CONTRACT,
    [DISPTACHER_ARE_THEY_LINKED],
    polygonProvider
  );
  const areTheyLinked = await dispatchContract.areTheyLinked(
    botId,
    recoveredSignerAddress
  );

  return areTheyLinked;
};

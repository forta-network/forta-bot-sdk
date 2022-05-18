import { AwilixContainer } from 'awilix';
import { CommandHandler } from "../..";
import { assertExists, assertIsISOString, assertIsNonEmptyString, isValidTimeRange } from "../../utils";
import { GetAgentLogs } from '../../utils/get.agent.logs';


export default function provideLogs(
  container: AwilixContainer,
  agentId: string,
  getAgentLogs: GetAgentLogs,
  args: any,
): CommandHandler {
  assertExists(container, 'container')
  assertExists(args, 'args')
  assertIsNonEmptyString(agentId, "agentId");


  return async function logs(cliArgs: any = {}) {

    args = { ...args, cliArgs }
    let latestTimestamp = args.before
    let earliestTimestamp = args.after

    assertIsISOString(latestTimestamp)
    assertIsISOString(earliestTimestamp)

    const earliestDateTime = new Date(Date.parse(earliestTimestamp))
    const latestDateTime = new Date(Date.parse(latestTimestamp))

    if(!isValidTimeRange(earliestDateTime, latestDateTime)) throw Error(`Provided date range is invalid`)

    let curMinute: Date | undefined = earliestDateTime;

    while(curMinute) {
      const logs = await getAgentLogs(agentId, curMinute)

      if(logs?.length > 0) {
        logs.filter(log => !args.scannerId || log.scanner === args.scannerId) // Filter logs by scannerId if provided
        .forEach(log => console.log(log))
      }

      curMinute = getNextMinute(curMinute, latestDateTime)
    }
  }
}

export type ScanDirection = 'forward' | 'backward';



export const getNextMinute = (curMinute: Date, latestDateTime: Date): Date | undefined => {
  const nextMinute = new Date(curMinute.getTime() + (60 * 1000))
  return nextMinute <= latestDateTime ? nextMinute : undefined
}
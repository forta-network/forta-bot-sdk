import { CommandHandler } from "../..";
import { assertExists, assertIsISOString, assertIsNonEmptyString, isValidTimeRange } from "../../utils";
import { FortaAgentLogResponse, GetAgentLogs } from '../../utils/get.agent.logs';


export default function provideLogs(
  agentId: string,
  getAgentLogs: GetAgentLogs,
  args: any,
): CommandHandler {
  assertExists(args, 'args')
  assertIsNonEmptyString(agentId, "agentId"); // agentId retrieved from forta.config.json


  return async function logs() {

    const cliAgentId = args.agentId;

    let latestTimestamp = args.before
    let earliestTimestamp = args.after;

    const finalAgentId = cliAgentId ? cliAgentId : agentId;

    if(!latestTimestamp && !earliestTimestamp) {
      const logs = await getAgentLogs(finalAgentId);
      processLogs(logs);
    } else {
      assertIsISOString(latestTimestamp, "\'before\'")
      assertIsISOString(earliestTimestamp, "\'after\'")

      const earliestDateTime = new Date(Date.parse(earliestTimestamp))
      const latestDateTime = new Date(Date.parse(latestTimestamp))

      if(!isValidTimeRange(earliestDateTime, latestDateTime)) throw Error(`Provided date range is invalid`)

      let curMinute: Date | undefined = earliestDateTime;

      while(curMinute) {
        const logs = await getAgentLogs(finalAgentId, curMinute)
        processLogs(logs);

        curMinute = getNextMinute(curMinute, latestDateTime)
      }
    }
  }
}

const processLogs = (logs: FortaAgentLogResponse[], scannerId?: string) => {
  if(logs?.length > 0) {
    logs.filter(log => !scannerId || log.scanner === scannerId) // Filter logs by scannerId if provided
    logs.forEach(log => printLogToConsole(log))
  }
}

export const printLogToConsole = (log: FortaAgentLogResponse) => {
  console.log(`${log.scanner} - ${log.timestamp}`);
  console.log('----------------------------------------------------------------- \n');
  console.log(log.logs);
}


export const getNextMinute = (curMinute: Date, latestDateTime: Date): Date | undefined => {
  const nextMinute = new Date(curMinute.getTime() + (60 * 1000))
  return nextMinute <= latestDateTime ? nextMinute : undefined
}